#!/usr/bin/env node

import fs from 'fs';

console.log('🔧 Applying comprehensive error handling to all MCP tools...\n');

// Files to process
const files = [
  './src/tools/privateTools.js',
  './src/tools/publicTools.js'
];

files.forEach(filePath => {
  console.log(`📁 Processing: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ Skipping ${filePath} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let totalChanges = 0;

  // Find all handler functions
  const handlerRegex = /(\s*)([a-zA-Z_][a-zA-Z0-9_]*:\s*async\s*\(args\)\s*=>\s*{)(\s*)((?:.|[\r\n])*?)(\s*},)/g;

  content = content.replace(handlerRegex, (match, indent, signature, openSpace, body, closing) => {
    const handlerName = signature.match(/([a-zA-Z_][a-zA-Z0-9_]*):/)[1];

    // Skip if already has try-catch
    if (body.includes('try {')) {
      console.log(`  ✅ ${handlerName}: already protected`);
      return match;
    }

    console.log(`  🔄 ${handlerName}: adding error protection`);
    totalChanges++;

    // Convert throw new Error patterns to structured returns
    let protectedBody = body;

    // Handle credentials check throws
    protectedBody = protectedBody.replace(
      /(\s*)throw new Error\(\s*`([^`]*)`\s*\);/g,
      (match, spacing, message) => {
        return `${spacing}return {\n${spacing}  isError: true,\n${spacing}  content: [\n${spacing}    {\n${spacing}      type: "text",\n${spacing}      text: \`${message}\`,\n${spacing}    },\n${spacing}  ],\n${spacing}};`;
      }
    );

    // Handle other throws with string concatenation
    protectedBody = protectedBody.replace(
      /(\s*)throw new Error\(\s*([^;]*)\s*\);/g,
      (match, spacing, errorExpr) => {
        return `${spacing}return {\n${spacing}  isError: true,\n${spacing}  content: [\n${spacing}    {\n${spacing}      type: "text",\n${spacing}      text: ${errorExpr},\n${spacing}    },\n${spacing}  ],\n${spacing}};`;
      }
    );

    // Wrap entire body in try-catch
    const wrappedBody = `${openSpace}try {\n${protectedBody.split('\n').map(line => '  ' + line).join('\n')}\n    } catch (error) {\n      return {\n        isError: true,\n        content: [\n          {\n            type: "text",\n            text: \`Error in ${handlerName}: \${error.message}\`,\n          },\n        ],\n      };\n    }\n  `;

    return indent + signature + wrappedBody + closing;
  });

  // Write back to file
  fs.writeFileSync(filePath, content);
  console.log(`  📊 ${totalChanges} handlers updated in ${filePath}\n`);
});

console.log('✅ Error handling protection applied to all tools!');
console.log('🛡️ All tools now return structured errors instead of throwing exceptions.');
console.log('⚡ Transport blocking issues eliminated!');