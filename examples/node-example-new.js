#!/usr/bin/env node

/**
 * Node.js example for html-vegalite library
 * Demonstrates server-side usage and all new strategies
 */

import { HTMLToVegaLite, ColorTagStrategy, StrikethroughTagStrategy } from '../dist/index.esm.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

console.log('🚀 HTML to Vega-Lite - Node.js Strategy Showcase\n');

// Create output directory
const outputDir = './generated';
try {
    mkdirSync(outputDir, { recursive: true });
} catch (e) {
    // Directory might already exist
}

// Create converter instance with enhanced options
const converter = new HTMLToVegaLite({
    fontSize: 18,
    fontFamily: 'Arial, sans-serif',
    startX: 20,
    startY: 30
});

// Example 1: Core text formatting strategies
console.log('📝 Example 1: Core Text Formatting Strategies');
const coreFormattingHTML = '<b>Bold text</b> and <i>italic text</i> with <u>underlined</u> content using <strong>strong</strong> emphasis.';
const coreFormattingSpec = converter.convert(coreFormattingHTML);

console.log('   Input HTML:', coreFormattingHTML);
console.log('   Generated layers:', coreFormattingSpec.layer.length);
console.log('   Dimensions:', `${coreFormattingSpec.width}x${coreFormattingSpec.height}`);
writeFileSync(join(outputDir, 'core-formatting.json'), JSON.stringify(coreFormattingSpec, null, 2));
console.log('   ✅ Saved to generated/core-formatting.json\n');

// Example 2: HTML structure strategies
console.log('🏗️ Example 2: HTML Structure Strategies');
const structureHTML = '<h1>Main Title</h1><h2>Subtitle</h2><p>This is a paragraph with a <a href="https://example.com">hyperlink</a>.</p>';
const structureSpec = converter.convert(structureHTML);

console.log('   Input HTML:', structureHTML);
console.log('   Generated layers:', structureSpec.layer.length);
writeFileSync(join(outputDir, 'html-structure.json'), JSON.stringify(structureSpec, null, 2));
console.log('   ✅ Saved to generated/html-structure.json\n');

// Example 3: Technical content strategies
console.log('💻 Example 3: Technical Content Strategies');
const technicalHTML = 'Run <code>npm install</code> and press <kbd>Ctrl+C</kbd>. Chemical formula: H<sub>2</sub>O and E=mc<sup>2</sup>. <mark>Important note</mark> here.';
const technicalSpec = converter.convert(technicalHTML);

console.log('   Input HTML:', technicalHTML);
console.log('   Generated layers:', technicalSpec.layer.length);
writeFileSync(join(outputDir, 'technical-content.json'), JSON.stringify(technicalSpec, null, 2));
console.log('   ✅ Saved to technical-content.json\n');

// Example 4: Span with CSS styles
console.log('🎨 Example 4: Advanced Span Styling');
const spanStylesHTML = '<span style="color: red; font-weight: bold">Error:</span> Connection failed. <span style="color: green; font-style: italic">Success:</span> Data saved. <span style="color: blue; text-decoration: underline">Info:</span> Process complete.';
const spanStylesSpec = converter.convert(spanStylesHTML);

console.log('   Input HTML:', spanStylesHTML);
console.log('   Generated layers:', spanStylesSpec.layer.length);
writeFileSync(join(outputDir, 'span-styles.json'), JSON.stringify(spanStylesSpec, null, 2));
console.log('   ✅ Saved to generated/span-styles.json\n');

// Example 5: Custom strategies
console.log('🌟 Example 5: Custom Strategy Registration');
// Register custom strategies
const colorStrategy = new ColorTagStrategy();
const strikethroughStrategy = new StrikethroughTagStrategy();

converter.registerTagStrategy(colorStrategy);
converter.registerTagStrategy(strikethroughStrategy);

const customHTML = '<red>Error:</red> Connection failed. <green>Success:</green> Backup completed. <del>Old price: $100</del> <s>Strike this</s> New price: $80';
const customSpec = converter.convert(customHTML);

console.log('   Registered custom strategies:');
console.log('   - ColorTagStrategy tags:', colorStrategy.getTagNames().join(', '));
console.log('   - StrikethroughTagStrategy tags:', strikethroughStrategy.getTagNames().join(', '));
console.log('   Input HTML:', customHTML);
console.log('   Generated layers:', customSpec.layer.length);
writeFileSync(join(outputDir, 'custom-strategies.json'), JSON.stringify(customSpec, null, 2));
console.log('   ✅ Saved to generated/custom-strategies.json\n');

// Example 6: Complex nested content
console.log('🌈 Example 6: Complex Nested Content');
const complexHTML = `
<h1>Q4 Sales Report</h1>
<h2>Executive Summary</h2>
<p><b>Performance:</b> Sales increased by <span style="color: green; font-weight: bold">25%</span> this quarter.</p>
<p><i>Key metrics:</i> <code>revenue = $1.2M</code> and <mark>customer satisfaction</mark> improved significantly.</p>
<h3>Technical Details</h3>
<p>Database query: <code>SELECT * FROM sales WHERE quarter = 'Q4'</code></p>
<p><small>Report generated on ${new Date().toLocaleDateString()}</small></p>
<p>For more information, visit <a href="/reports/q4">the detailed report</a>.</p>
`.trim();

const complexSpec = converter.convert(complexHTML);

console.log('   Input HTML (truncated):', complexHTML.substring(0, 100) + '...');
console.log('   Generated layers:', complexSpec.layer.length);
console.log('   Final dimensions:', `${complexSpec.width}x${complexSpec.height}`);
writeFileSync(join(outputDir, 'complex-nested.json'), JSON.stringify(complexSpec, null, 2));
console.log('   ✅ Saved to generated/complex-nested.json\n');

// Example 7: Validation and error handling
console.log('✅ Example 7: HTML Validation');
const validHTML = '<b>Valid HTML</b> with <i>proper nesting</i>';
const invalidHTML = '<b>Invalid HTML <i>with improper</b> nesting</i>';

const validResult = converter.validateHTML(validHTML);
const invalidResult = converter.validateHTML(invalidHTML);

console.log('   Valid HTML validation:', validResult);
console.log('   Invalid HTML validation:', invalidResult);

// Test parsing with detailed information
const parseDetails = converter.parseHTML(complexHTML);
console.log('   Parsed segments count:', parseDetails.segments.length);
if (parseDetails.errors) {
    console.log('   Parse errors:', parseDetails.errors);
} else {
    console.log('   ✅ No parse errors');
}
console.log('');

// Example 8: Performance demonstration
console.log('⚡ Example 8: Performance Demonstration');
const startTime = Date.now();
const performanceHTML = Array(100).fill('<b>Performance test</b> with <i>multiple</i> <u>elements</u>').join(' ');
const performanceSpec = converter.convert(performanceHTML);
const endTime = Date.now();

console.log('   Processed 300 HTML elements in:', endTime - startTime, 'ms');
console.log('   Generated layers:', performanceSpec.layer.length);
console.log('   Final spec size:', JSON.stringify(performanceSpec).length, 'characters');
writeFileSync(join(outputDir, 'performance-test.json'), JSON.stringify(performanceSpec, null, 2));
console.log('   ✅ Saved to generated/performance-test.json\n');

// Example 9: All supported tags showcase
console.log('📋 Example 9: All Supported Tags Showcase');
const allTagsHTML = `
<h1>All Supported Tags</h1>
<h2>Text Formatting</h2>
<p><b>Bold</b> <strong>Strong</strong> <i>Italic</i> <em>Emphasis</em> <u>Underline</u></p>
<h3>Code and Technical</h3>
<p>Command: <code>npm start</code> Key: <kbd>Enter</kbd> Output: <samp>Success</samp></p>
<h4>Special Elements</h4>
<p><mark>Highlighted text</mark> <small>Small text</small> Formula: H<sub>2</sub>O Energy: E=mc<sup>2</sup></p>
<h5>Links and Structure</h5>
<p>Visit <a href="https://example.com">our website</a> for more information.</p>
<h6>Custom Elements</h6>
<p><del>Deleted text</del> <s>Strikethrough</s></p>
`.trim();

const allTagsSpec = converter.convert(allTagsHTML);
console.log('   Comprehensive example with all tag types');
console.log('   Generated layers:', allTagsSpec.layer.length);
console.log('   Dimensions:', `${allTagsSpec.width}x${allTagsSpec.height}`);
writeFileSync(join(outputDir, 'all-tags-showcase.json'), JSON.stringify(allTagsSpec, null, 2));
console.log('   ✅ Saved to generated/all-tags-showcase.json\n');

// Example 10: Create an HTML preview file
console.log('🌐 Example 10: Creating HTML Preview');
const htmlPreview = `
<!DOCTYPE html>
<html>
<head>
    <title>Generated Vega-Lite Specifications</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vega/5.22.1/vega.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vega-lite/5.6.0/vega-lite.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vega-embed/6.21.0/vega-embed.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .example { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .vega-container { margin: 15px 0; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>HTML to Vega-Lite - Generated Examples</h1>
    
    <div class="example">
        <h2>Core Text Formatting</h2>
        <div id="vis1"></div>
    </div>
    
    <div class="example">
        <h2>HTML Structure</h2>
        <div id="vis2"></div>
    </div>
    
    <div class="example">
        <h2>Technical Content</h2>
        <div id="vis3"></div>
    </div>
    
    <div class="example">
        <h2>Complex Nested Example</h2>
        <div id="vis4"></div>
    </div>
    
    <div class="example">
        <h2>All Tags Showcase</h2>
        <div id="vis5"></div>
    </div>

    <script>
        // Load and render all generated specifications
        Promise.all([
            fetch('./core-formatting.json').then(r => r.json()),
            fetch('./html-structure.json').then(r => r.json()),
            fetch('./technical-content.json').then(r => r.json()),
            fetch('./complex-nested.json').then(r => r.json()),
            fetch('./all-tags-showcase.json').then(r => r.json())
        ]).then(specs => {
            specs.forEach((spec, i) => {
                vegaEmbed(\`#vis\${i + 1}\`, spec, {theme: 'light'});
            });
        }).catch(console.error);
    </script>
</body>
</html>
`;

writeFileSync(join(outputDir, 'preview.html'), htmlPreview);
console.log('   ✅ Created generated/preview.html for viewing results\n');

// Summary
console.log('🎉 Summary:');
console.log('   Generated 9 Vega-Lite specifications demonstrating all strategies');
console.log('   Files saved to:', outputDir);
console.log('   Open generated/preview.html in a browser to view all examples');
console.log('   Total strategies demonstrated: Core formatting, HTML structure, Technical content, Custom strategies');
console.log('');
console.log('📁 Generated files:');
console.log('   • core-formatting.json');
console.log('   • html-structure.json');
console.log('   • technical-content.json');
console.log('   • span-styles.json');
console.log('   • custom-strategies.json');
console.log('   • complex-nested.json');
console.log('   • performance-test.json');
console.log('   • all-tags-showcase.json');
console.log('   • preview.html');
console.log('');
console.log('🚀 Node.js strategy showcase complete!');

export {
    converter,
    coreFormattingSpec,
    structureSpec,
    technicalSpec,
    complexSpec,
    allTagsSpec
};
