/**
 * REST API Routes for CCXT Tools
 * Exposes MCP tools via standard REST API endpoints
 */

import { publicToolsHandlers } from "./tools/publicTools.js";
import { privateToolsHandlers } from "./tools/privateTools.js";
import { SERVER_CONFIG, SUPPORTED_EXCHANGES } from "./config/config.js";

const allHandlers = { ...publicToolsHandlers, ...privateToolsHandlers };

/**
 * Setup REST API routes
 * @param {Express} app - Express application instance
 * @param {Map} transports - MCP transports map
 * @param {Map} sessionMetadata - Session metadata map
 */
export function setupRestApi(app, transports, sessionMetadata) {

  //===========================================================================
  // ROOT - API Documentation
  //===========================================================================
  app.get('/', (req, res) => {
    res.json({
      name: SERVER_CONFIG.name,
      version: SERVER_CONFIG.version,
      description: SERVER_CONFIG.description,
      endpoints: {
        mcp: {
          path: '/mcp',
          protocol: 'Streamable HTTP (2025-03-26)',
          description: 'Model Context Protocol endpoint for AI assistants'
        },
        api: {
          listTools: {
            path: '/api/tools',
            method: 'GET',
            description: 'List all available tools'
          },
          executeTool: {
            path: '/api/tools/:toolName',
            method: 'POST',
            description: 'Execute a specific tool',
            example: {
              url: '/api/tools/get_ticker',
              body: {
                symbol: 'BTC/USDT',
                exchange: 'binance'
              }
            }
          },
          status: {
            path: '/api/status',
            method: 'GET',
            description: 'Server health and statistics'
          }
        }
      },
      exchanges: SUPPORTED_EXCHANGES,
      uptime: process.uptime(),
      documentation: 'https://github.com/carlosatta/mcp-server-ccxt'
    });
  });

  //===========================================================================
  // STATUS - Server health and statistics
  //===========================================================================
  app.get('/api/status', (req, res) => {
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    res.json({
      status: 'running',
      uptime: uptimeSeconds,
      uptimeFormatted: `${hours}h ${minutes}m ${seconds}s`,
      sessions: {
        active: transports.size,
        total: sessionMetadata.size
      },
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`
      },
      tools: {
        public: Object.keys(publicToolsHandlers).length,
        private: Object.keys(privateToolsHandlers).length,
        total: Object.keys(allHandlers).length
      },
      exchanges: SUPPORTED_EXCHANGES,
      timestamp: Date.now(),
      timestampISO: new Date().toISOString()
    });
  });

  //===========================================================================
  // LIST TOOLS - Get all available tools
  //===========================================================================
  app.get('/api/tools', (req, res) => {
    const toolsList = Object.keys(allHandlers).map(name => ({
      name,
      endpoint: `/api/tools/${name}`,
      method: 'POST',
      type: publicToolsHandlers[name] ? 'public' : 'private'
    }));

    res.json({
      success: true,
      count: toolsList.length,
      tools: toolsList,
      documentation: 'POST to /api/tools/:toolName with JSON body containing tool arguments'
    });
  });

  //===========================================================================
  // EXECUTE TOOL - Run a specific tool
  //===========================================================================
  app.post('/api/tools/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const args = req.body;

    try {
      // Check if tool exists
      if (!allHandlers[toolName]) {
        return res.status(404).json({
          success: false,
          error: `Tool '${toolName}' not found`,
          availableTools: Object.keys(allHandlers),
          hint: 'Use GET /api/tools to see all available tools'
        });
      }

      console.log(`🔧 REST API - Tool execution: ${toolName}`);
      console.log(`   Arguments:`, JSON.stringify(args, null, 2));
      console.log(`   Timestamp: ${new Date().toISOString()}`);

      // Execute the tool handler
      const startTime = Date.now();
      const result = await allHandlers[toolName](args);
      const executionTime = Date.now() - startTime;

      console.log(`✅ REST API - Tool ${toolName} executed in ${executionTime}ms`);

      // Extract text content from MCP format
      let data;
      if (result.content && result.content[0] && result.content[0].text) {
        try {
          data = JSON.parse(result.content[0].text);
        } catch (e) {
          data = result.content[0].text;
        }
      } else {
        data = result;
      }

      res.json({
        success: true,
        tool: toolName,
        executionTime: `${executionTime}ms`,
        timestamp: new Date().toISOString(),
        data
      });

    } catch (error) {
      console.error(`❌ REST API - Error executing ${toolName}:`, error.message);
      console.error(`   Error type: ${error.constructor.name}`);

      res.status(500).json({
        success: false,
        tool: toolName,
        error: error.message,
        type: error.constructor.name,
        timestamp: new Date().toISOString()
      });
    }
  });

  console.log('✅ REST API routes configured');
}
