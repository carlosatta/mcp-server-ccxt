#!/usr/bin/env node

import fs from 'fs';

const filePath = './src/tools/privateTools.js';
const content = fs.readFileSync(filePath, 'utf8');

// Tool handlers che necessitano ancora del fix
const remainingHandlers = [
  'cancel_all_orders',
  'set_leverage',
  'set_margin_mode',
  'place_futures_market_order',
  'place_futures_limit_order',
  'transfer_funds',
  'get_portfolios',
  'get_portfolio_details',
  'edit_order'
];

console.log(`🔧 Quick-fixing remaining ${remainingHandlers.length} private tool handlers...`);

let updatedContent = content;

remainingHandlers.forEach(handlerName => {
  console.log(`  🔄 ${handlerName}`);

  // Simple pattern to find throw new Error and replace with return
  const throwPattern = new RegExp(
    `(\\s+)throw new Error\\(\\s*\`([^`]*)\`\\s*\\);`,
    'g'
  );

  // First pass: replace throw patterns in the specific handler
  const handlerStart = updatedContent.indexOf(`${handlerName}: async (args) => {`);
  if (handlerStart === -1) {
    console.log(`    ❌ Handler ${handlerName} not found`);
    return;
  }

  const handlerEnd = updatedContent.indexOf('\n  },', handlerStart);
  if (handlerEnd === -1) {
    console.log(`    ❌ Handler ${handlerName} end not found`);
    return;
  }

  const beforeHandler = updatedContent.substring(0, handlerStart);
  const handlerSection = updatedContent.substring(handlerStart, handlerEnd + 5);
  const afterHandler = updatedContent.substring(handlerEnd + 5);

  // Replace throws in this section only
  const fixedSection = handlerSection.replace(throwPattern, (match, spacing, message) => {
    return `${spacing}return {\n${spacing}  isError: true,\n${spacing}  content: [\n${spacing}    {\n${spacing}      type: "text",\n${spacing}      text: \`${message}\`,\n${spacing}    },\n${spacing}  ],\n${spacing}};`;
  });

  updatedContent = beforeHandler + fixedSection + afterHandler;
  console.log(`    ✅ Fixed throws for ${handlerName}`);
});

fs.writeFileSync(filePath, updatedContent);
console.log(`✅ Quick fixes applied to private tools!`);