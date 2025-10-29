#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Files to process
const files = [
  './src/tools/privateTools.js',
  './src/tools/publicTools.js'
];

// List of handler functions that need to be wrapped
const handlersToFix = [
  // Private tools (remaining ones)
  'set_margin_mode',
  'place_futures_market_order', 
  'place_futures_limit_order',
  'transfer_funds',
  'get_portfolios',
  'get_portfolio_details',
  'edit_order',
  
  // Public tools that use credentials and can cause transport blocking
  'get_open_orders',
  'get_order_history',
  'get_trading_fees', 
  'get_my_trades',
  'get_order_details'
];

files.forEach(filePath => {
  console.log(`Processing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  handlersToFix.forEach(handlerName => {
    // Pattern to match handler function
    const handlerRegex = new RegExp(
      `(\\s*${handlerName}:\\s*async\\s*\\(args\\)\\s*=>\\s*{)\\s*` +
      `((?:.|\\n)*?)` +
      `(\\s*},)`,
      'g'
    );

    content = content.replace(handlerRegex, (match, start, body, end) => {
      // Skip if already has try-catch
      if (body.includes('try {')) {
        console.log(`  ${handlerName}: already has try-catch, skipping`);
        return match;
      }

      console.log(`  ${handlerName}: adding try-catch wrapper`);

      // Convert throw new Error to return error for credentials check
      body = body.replace(
        /throw new Error\(\s*`([^`]*)`\s*\);/g,
        'return {\n        isError: true,\n        content: [\n          {\n            type: "text",\n            text: `$1`,\n          },\n        ],\n      };'
      );

      // Convert throw new Error with template literals
      body = body.replace(
        /throw new Error\(\s*([^;]*)\s*\);/g,
        'return {\n        isError: true,\n        content: [\n          {\n            type: "text",\n            text: $1,\n          },\n        ],\n      };'
      );

      // Wrap body in try-catch
      const wrappedBody = `
    try {
${body.split('\n').map(line => '  ' + line).join('\n')}
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: \`Error in ${handlerName}: \${error.message}\`,
          },
        ],
      };
    }
  `;

      return start + wrappedBody + end;
    });
  });

  // Write back to file
  fs.writeFileSync(filePath, content);
});

console.log('Error handling fixes applied successfully to all files!');