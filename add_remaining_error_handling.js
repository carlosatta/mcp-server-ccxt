/**
 * Script to add comprehensive error handling to all remaining tools
 * This adds try-catch wrappers that return structured errors instead of throwing
 */

const fs = require('fs');

const files = [
  './src/tools/privateTools.js',
  './src/tools/publicTools.js'
];

// Tools that need protection (handlers without try-catch)
const toolsNeedingProtection = {
  privateTools: [
    'cancel_all_orders',
    'set_leverage',
    'set_margin_mode',
    'place_futures_market_order',
    'place_futures_limit_order',
    'transfer_funds',
    'get_portfolios',
    'get_portfolio_details',
    'edit_order'
  ],
  publicTools: [
    // Will be identified by scanning for throw statements
  ]
};

files.forEach(filePath => {
  console.log(`\n📝 Processing: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${filePath} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const isPrivate = filePath.includes('private');
  const toolsList = isPrivate ? toolsNeedingProtection.privateTools : [];

  toolsList.forEach(toolName => {
    // Find the handler function
    const handlerRegex = new RegExp(
      `(${toolName}:\\s*async\\s*\\(args\\)\\s*=>\\s*{)([^]*?)(^  },)`,
      'gm'
    );

    const match = content.match(handlerRegex);
    if (!match) {
      console.log(`  ⚠️  Handler ${toolName} not found or already protected`);
      return;
    }

    // Check if already has try-catch at the start
    const functionBody = match[2];
    if (functionBody.trim().startsWith('try {')) {
      console.log(`  ✅ ${toolName} already has try-catch`);
      return;
    }

    // Wrap the entire function body in try-catch
    const replacement = `$1
    try {$2
    } catch (error) {
      console.error(\`❌ Error in ${toolName}:\`, error.message);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: \`Error in ${toolName}: \${error.message}\`
          }
        ]
      };
    }
$3`;

    content = content.replace(handlerRegex, replacement);
    modified = true;
    console.log(`  ✅ Added error handling to ${toolName}`);
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n✅ Updated ${filePath}`);
  } else {
    console.log(`\n⚠️  No changes made to ${filePath}`);
  }
});

console.log('\n✅ Script completed');
