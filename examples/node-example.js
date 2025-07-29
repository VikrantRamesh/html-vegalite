#!/usr/bin/env node

/**
 * Node.js example for html-vegalite library
 * Demonstrates server-side usage and file generation
 */

import { HTMLToVegaLite, ColorTagStrategy } from '../dist/index.esm.js';
import fs from 'fs';
import path from 'path';

console.log('🚀 HTML to Vega-Lite - Node.js Example\n');

// Create converter instance
const converter = new HTMLToVegaLite({
    fontSize: 16,
    fontFamily: 'Arial, sans-serif',
    startX: 20,
    startY: 30
});

// Example 1: Basic conversion
console.log('📝 Example 1: Basic HTML conversion');
const basicHTML = '<b>Sales Report:</b> Revenue increased by <i>25%</i> this quarter!';
const basicSpec = converter.convert(basicHTML);

console.log('   Input HTML:', basicHTML);
console.log('   Generated layers:', basicSpec.layer.length);
console.log('   Dimensions:', `${basicSpec.width}x${basicSpec.height}`);
console.log('');

// Example 2: Custom strategy
console.log('🎨 Example 2: Custom color strategy');
const colorStrategy = new ColorTagStrategy();
converter.registerTagStrategy(colorStrategy);

const colorHTML = '<red>Error:</red> Connection failed. <green>Success:</green> Backup completed.';
const colorSpec = converter.convert(colorHTML);

console.log('   Registered tags:', colorStrategy.getTagNames().join(', '));
console.log('   Input HTML:', colorHTML);
console.log('   Generated layers:', colorSpec.layer.length);
console.log('');

// Example 3: Validation
console.log('✅ Example 3: HTML validation');
const invalidHTML = '<b>Unclosed bold and <span style="color: invalidcolor">invalid CSS</span>';
const validation = converter.validateHTML(invalidHTML);

console.log('   Input HTML:', invalidHTML);
console.log('   Is valid:', validation.isValid);
if (!validation.isValid) {
    console.log('   Errors:');
    validation.errors.forEach(error => console.log(`     - ${error}`));
}
console.log('');

// Example 4: Performance test
console.log('⚡ Example 4: Performance benchmark');
const testHTML = '<b>Performance</b> <i>test</i> with <span style="color: red">multiple</span> tags.';
const iterations = 1000;

console.time('   Conversion time');
for (let i = 0; i < iterations; i++) {
    converter.convert(testHTML);
}
console.timeEnd('   Conversion time');
console.log(`   Processed ${iterations} conversions`);
console.log('');

// Example 5: Different layout options
console.log('📐 Example 5: Layout configurations');
const layoutHTML = '<b>This is a longer text</b> that will demonstrate <i>text wrapping</i> and layout options.';

const configs = [
    { name: 'Narrow', maxWidth: 150 },
    { name: 'Wide', maxWidth: 500 },
    { name: 'Large Font', fontSize: 24 },
    { name: 'Custom Font', fontFamily: 'Georgia, serif' }
];

configs.forEach(config => {
    const spec = converter.convert(layoutHTML, config);
    console.log(`   ${config.name}: ${spec.width}x${spec.height} (${spec.layer.length} layers)`);
});
console.log('');

// Example 6: API methods demonstration
console.log('🔧 Example 6: API methods');

// Parse only
const parseResult = converter.parseHTML('<b>Bold</b> and <i>italic</i>');
console.log('   Parse result segments:', parseResult.segments.length);

// Layout only
const segments = [
    { text: 'Hello', fontWeight: 'bold', fontStyle: 'normal', color: '#000000' },
    { text: ' ', fontWeight: 'normal', fontStyle: 'normal', color: '#000000' },
    { text: 'World', fontWeight: 'normal', fontStyle: 'italic', color: '#ff0000' }
];
const positioned = converter.layoutSegments(segments, 300);
console.log('   Positioned segments:', positioned.length);

// Static methods
const staticSpec = HTMLToVegaLite.convert('<b>Static conversion</b>');
const minimalSpec = HTMLToVegaLite.createMinimal('Minimal text');
console.log('   Static conversion layers:', staticSpec.layer.length);
console.log('   Minimal spec layers:', minimalSpec.layer.length);
console.log('');

// Example 7: Generate files
console.log('💾 Example 7: File generation');

const examples = [
    {
        name: 'sales-report',
        html: '<b>Q4 Sales Report</b><br>Revenue: <span style="color: green; font-weight: bold">$2.1M</span> (↑15%)',
        options: { fontSize: 18, fontFamily: 'Arial, sans-serif' }
    },
    {
        name: 'error-message',
        html: '<red>Error:</red> <b>Connection timeout</b>. Please <i>try again</i> later.',
        options: { fontSize: 14 }
    },
    {
        name: 'status-update',
        html: '<green>✓ Deployment successful</green><br><blue>ℹ Next deployment in 2 hours</blue>',
        options: { fontSize: 16, maxWidth: 300 }
    }
];

// Create output directory
const outputDir = path.join(process.cwd(), 'examples', 'generated');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

examples.forEach(example => {
    try {
        // Register color strategy if not already registered
        if (!converter.isTagSupported('red')) {
            converter.registerTagStrategy(new ColorTagStrategy());
        }

        const spec = converter.convert(example.html, example.options);
        const fileName = `${example.name}.json`;
        const filePath = path.join(outputDir, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(spec, null, 2));
        console.log(`   ✓ Generated: ${fileName} (${spec.layer.length} layers, ${spec.width}x${spec.height})`);
    } catch (error) {
        console.log(`   ✗ Failed to generate ${example.name}: ${error.message}`);
    }
});

// Generate HTML preview file
const previewHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Generated Vega-Lite Examples</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vega/5.22.1/vega.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vega-lite/5.6.0/vega-lite.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vega-embed/6.21.0/vega-embed.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .example { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .vis { border: 1px solid #ccc; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Generated Vega-Lite Examples</h1>
    ${examples.map((example, i) => `
    <div class="example">
        <h3>${example.name}</h3>
        <p><strong>HTML:</strong> <code>${example.html}</code></p>
        <div id="vis${i}" class="vis"></div>
        <script>
            fetch('./generated/${example.name}.json')
                .then(r => r.json())
                .then(spec => vegaEmbed('#vis${i}', spec, {actions: false}));
        </script>
    </div>
    `).join('')}
</body>
</html>
`;

fs.writeFileSync(path.join(outputDir, 'preview.html'), previewHTML);
console.log('   ✓ Generated: preview.html');
console.log('');

// Example 8: Error handling
console.log('🚨 Example 8: Error handling');

const errorTests = [
    { name: 'Empty input', input: '' },
    { name: 'Null input', input: null },
    { name: 'Non-string input', input: 123 },
    { name: 'Malformed HTML', input: '<b>Unclosed <i>tags' }
];

errorTests.forEach(test => {
    try {
        if (test.input === null || typeof test.input !== 'string') {
            converter.convert(test.input);
        } else {
            const result = converter.convert(test.input);
            console.log(`   ${test.name}: Handled gracefully (${result.layer.length} layers)`);
        }
    } catch (error) {
        console.log(`   ${test.name}: Caught error - ${error.message}`);
    }
});

console.log('');

// Example 9: Memory usage and cleanup
console.log('📊 Example 9: Memory usage');

if (global.gc) {
    global.gc();
    const memBefore = process.memoryUsage();
    
    // Create many converter instances
    const converters = [];
    for (let i = 0; i < 100; i++) {
        converters.push(new HTMLToVegaLite());
    }
    
    // Use them
    converters.forEach((conv, i) => {
        conv.convert(`<b>Test ${i}</b>`);
    });
    
    global.gc();
    const memAfter = process.memoryUsage();
    
    console.log('   Memory usage:');
    console.log(`     Before: ${(memBefore.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`     After: ${(memAfter.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`     Diff: ${((memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024).toFixed(2)} MB`);
} else {
    console.log('   Run with --expose-gc flag to see memory usage');
}

console.log('');
console.log('✅ All examples completed!');
console.log(`📁 Check ${outputDir} for generated files`);
console.log('🌐 Open generated/preview.html in browser to view results');