# HTML to Vega-Lite Examples

This directory contains comprehensive examples demonstrating all the new tag strategies and capabilities of the `html-vegalite` library.

## 📁 Files Overview

### Browser Examples
- **`standalone-enhanced.html`** - **✨ New comprehensive demo** showcasing all strategies (no build required)
- **`basic-new.html`** - **✨ Updated examples** with all new tag strategies (requires build)
- **`standalone.html`** - Original standalone demo
- **`basic.html`** - Original basic examples

### Node.js Examples  
- **`node-example-new.js`** - **✨ Enhanced Node.js demo** showcasing all strategies
- **`node-example.js`** - Original Node.js example
- **`package.json`** - Example package configuration

### Generated Files
- **`generated/`** - Auto-generated Vega-Lite specifications and previews

## 🚀 Getting Started

### Prerequisites
```bash
# For standalone examples (no build required) ⭐ RECOMMENDED
# Just open the HTML files in a browser

# For examples with full library
yarn build

# For Node.js examples
node --version  # >= 16
```

### Running Examples

#### ⭐ Standalone Enhanced Demo (Recommended for Testing)
```bash
# No build required - just open in browser
open examples/standalone-enhanced.html

# Or serve the examples directory
npx serve examples
# Then open http://localhost:3000/standalone-enhanced.html
```

#### Browser Examples (Requires Build)
```bash
# Build the library first
yarn build

# Serve the examples directory
yarn example
# Then open http://localhost:3000/basic-new.html
```

#### Node.js Examples
```bash
# Run the enhanced Node.js example
node examples/node-example-new.js

# Run original example
node examples/node-example.js

# With memory profiling
node --expose-gc examples/node-example-new.js
```

## 📖 New Strategy Categories

### 🎯 **What's New in This Update**

We've completely refactored and expanded the tag strategy system! Here's what's new:

#### 📝 **Core Text Formatting Strategies**
- **BoldTagStrategy**: `<b>`, `<strong>`
- **ItalicTagStrategy**: `<i>`, `<em>`
- **UnderlineTagStrategy**: `<u>`
- **SpanTagStrategy**: `<span style="...">` with CSS validation

#### 🏗️ **HTML Structure Strategies** *(NEW)*
- **HeadingTagStrategy**: `<h1>` through `<h6>` with font size mapping
- **ParagraphTagStrategy**: `<p>`
- **HyperlinkTagStrategy**: `<a href="...">` with URL validation
- **LineBreakTagStrategy**: `<br>`

#### 💻 **Technical Content Strategies** *(NEW)*
- **CodeTagStrategy**: `<code>`, `<pre>`, `<kbd>`, `<samp>`
- **SmallTextTagStrategy**: `<small>`, `<sub>`, `<sup>`
- **HighlightTagStrategy**: `<mark>`

#### 🎨 **Custom/Example Strategies**
- **StrikethroughTagStrategy**: `<s>`, `<strike>`, `<del>`
- **ColorTagStrategy**: `<red>`, `<green>`, `<blue>`, etc.

## 🌟 Example Categories

### 1. **Enhanced Basic Usage** (`basic-new.html`)

**Core formatting with all new strategies:**
```html
<b>Bold</b> <i>italic</i> <u>underline</u> <span style="color: red">colored</span>
```

**HTML structure elements:**
```html
<h1>Main Title</h1>
<h2>Subtitle</h2>
<p>Paragraph with <a href="https://example.com">link</a></p>
```

**Technical content:**
```html
Run <code>npm install</code> and press <kbd>Ctrl+C</kbd>
Chemical formula: H<sub>2</sub>O and E=mc<sup>2</sup>
<mark>Important note</mark> here.
```

### 2. **Comprehensive Strategy Showcase** (`standalone-enhanced.html`)

**Real-world examples:**
- 📊 Dashboard reports with metrics
- 📝 Documentation with code snippets
- 🚨 Status messages with color coding
- 🔬 Scientific content with formulas

**Interactive playground:**
- Real-time HTML validation
- Error reporting and debugging
- All strategies enabled
- Responsive rendering

### 3. **Advanced Node.js Examples** (`node-example-new.js`)

**Server-side capabilities:**
```javascript
// Register custom strategies
const colorStrategy = new ColorTagStrategy();
converter.registerTagStrategy(colorStrategy);

// Process complex HTML
const html = '<h1>Report</h1><p><red>Error:</red> <green>Success</green></p>';
const spec = converter.convert(html);
```

**Performance testing:**
- Batch processing of multiple HTML snippets
- Performance metrics and timing
- Large document handling
- File generation and export

## 🔧 **New Architecture Features**

### Strategy Pattern Implementation
```
src/strategies/
├── interfaces/          # Core interfaces and base classes
├── implementations/     # Individual strategy implementations  
├── registry/           # Strategy registry management
└── index.ts           # Main export with factory functions
```

### Factory Functions
```javascript
// Full registry with all strategies
const fullRegistry = createDefaultTagStrategyRegistry();

// Minimal registry with basic formatting only
const minimalRegistry = createMinimalTagStrategyRegistry();
```

### Enhanced Validation
```javascript
// Comprehensive validation with detailed error reporting
const validation = converter.validateHTML(html);
if (!validation.isValid) {
    console.log('Errors:', validation.errors);
}
```

## 📋 **Complete Tag Support**

### ✅ **Supported Tags** (27 total)

| Category | Tags | Strategy |
|----------|------|----------|
| **Text Formatting** | `<b>`, `<strong>`, `<i>`, `<em>`, `<u>` | Bold, Italic, Underline |
| **HTML Structure** | `<h1>`-`<h6>`, `<p>`, `<a>`, `<br>` | Heading, Paragraph, Hyperlink, LineBreak |
| **Technical** | `<code>`, `<pre>`, `<kbd>`, `<samp>` | Code |
| **Special Text** | `<small>`, `<sub>`, `<sup>`, `<mark>` | SmallText, Highlight |
| **Custom** | `<s>`, `<strike>`, `<del>` | Strikethrough |
| **Styled** | `<span style="...">` | Span with CSS validation |
| **Color Shortcuts** | `<red>`, `<green>`, `<blue>`, etc. | Color (custom example) |

### 🎨 **CSS Properties Supported**
- `color`: Any valid CSS color
- `font-weight`: `normal`, `bold`, `100`-`900`
- `font-style`: `normal`, `italic`, `oblique`
- `text-decoration`: `none`, `underline`

## 🚀 **Performance & Features**

- ⚡ **Fast**: Processes 300+ HTML elements in milliseconds
- 🔧 **Extensible**: Easy to add custom strategies
- ✅ **Validated**: Built-in HTML and CSS validation
- 🎯 **Type-Safe**: Full TypeScript support
- 📱 **Responsive**: Works in browser and Node.js
- 🌐 **Universal**: ESM, CommonJS, and UMD builds

## 🎯 **Quick Start Examples**

### Browser (No Build Required)
```html
<!-- Just open in browser -->
examples/standalone-enhanced.html
```

### Node.js
```bash
node examples/node-example-new.js
```

### Library Usage
```javascript
import { HTMLToVegaLite, createDefaultTagStrategyRegistry } from 'html-vegalite';

const converter = new HTMLToVegaLite();
const spec = converter.convert('<h1>Hello <b>World</b>!</h1>');
```

The examples now comprehensively demonstrate the full power and flexibility of the refactored tag strategy system! 🎉
// Register custom color tags
const colorStrategy = new ColorTagStrategy();
converter.registerTagStrategy(colorStrategy);

// Now you can use: <red>Text</red>, <blue>Text</blue>
```

**HTML validation:**
```javascript
const result = converter.validateHTML('<b>Unclosed tag');
// Returns: { isValid: false, errors: ['Unclosed tags: b'] }
```

**Performance testing:**
```javascript
// Benchmark conversion speed
const iterations = 1000;
console.time('conversion');
for (let i = 0; i < iterations; i++) {
    converter.convert(html);
}
console.timeEnd('conversion');
```

### 3. Node.js Usage (`node-example.js`)

**File generation:**
```javascript
// Generate Vega-Lite JSON files
const spec = converter.convert('<b>Bold text</b>');
fs.writeFileSync('output.json', JSON.stringify(spec, null, 2));
```

**Batch processing:**
```javascript
const examples = [
    { html: '<b>Title</b>', options: { fontSize: 18 } },
    { html: '<i>Subtitle</i>', options: { fontSize: 14 } }
];

examples.forEach(example => {
    const spec = converter.convert(example.html, example.options);
    // Process spec...
});
```

## 🎨 Supported HTML Tags

### Default Tags
- **Bold**: `<b>`, `<strong>`
- **Italic**: `<i>`, `<em>`  
- **Underline**: `<u>`
- **Styled**: `<span style="...">`

### Custom Strategy Examples
- **Colors**: `<red>`, `<blue>`, `<green>`, etc.
- **Strikethrough**: `<s>`, `<strike>`, `<del>`

## 🔧 Configuration Options

```javascript
const converter = new HTMLToVegaLite({
    fontSize: 16,           // Font size in pixels
    fontFamily: 'Arial',    // Font family
    startX: 10,             // Starting X coordinate  
    startY: 30,             // Starting Y coordinate
    lineHeight: 22,         // Line height (auto-calculated if not set)
    maxWidth: 400,          // Max width before wrapping
    background: 'white'     // Background color
});
```

## 📊 API Methods

### Conversion Methods
```javascript
// Main conversion
const spec = converter.convert(html, options);

// Static conversion (one-off)
const spec = HTMLToVegaLite.convert(html, options);

// Minimal spec for testing
const spec = HTMLToVegaLite.createMinimal('text');
```

### Parsing Methods
```javascript
// Parse HTML only
const result = converter.parseHTML(html);
// Returns: { segments: [...], errors: [...] }

// Parse with detailed info
const details = converter.parseWithDetails(html);
// Returns: { segments, errors, warnings, supportedTags, usedTags }

// Layout segments only
const positioned = converter.layoutSegments(segments, maxWidth);
```

### Validation Methods
```javascript
// Validate HTML structure
const validation = converter.validateHTML(html);
// Returns: { isValid: boolean, errors: string[] }

// Check tag support
const isSupported = converter.isTagSupported('custom');
const supportedTags = converter.getSupportedTags();
```

### Strategy Management
```javascript
// Register custom strategy
converter.registerTagStrategy(new CustomStrategy());

// Remove strategy
converter.removeTagStrategy('tagName');

// Get strategy registry
const registry = converter.getStrategyRegistry();
```

## 🎯 Use Cases

### 1. Data Visualization Labels
```javascript
// Chart titles with formatting
const title = '<b>Sales Growth</b> <span style="color: green">+15%</span>';
const spec = converter.convert(title);
// Use spec in Vega-Lite chart
```

### 2. Dashboard Text Elements
```javascript
// Status indicators
const status = '<green>✓ Online</green> <blue>ℹ Last updated: 2 min ago</blue>';
const spec = converter.convert(status);
```

### 3. Report Generation
```javascript
// Automated report text
const report = `
<b>Q4 Performance Summary</b>
Revenue: <span style="color: green; font-weight: bold">$2.1M</span> (↑15%)
Expenses: <span style="color: red">$1.8M</span> (↑5%)
<b>Net Profit: <span style="color: blue">$300K</span></b>
`;
const spec = converter.convert(report, { maxWidth: 400 });
```

## 🔍 Debugging Tips

### Common Issues
1. **Tags not rendering**: Check if strategy is registered
2. **Text overlapping**: Adjust `lineHeight` or `maxWidth`
3. **Colors not showing**: Verify CSS color syntax in `style` attribute
4. **Performance issues**: Use static methods for one-off conversions

### Debug Information
```javascript
// Get detailed parse information
const details = converter.parseWithDetails(html);
console.log('Segments:', details.segments);
console.log('Errors:', details.errors);
console.log('Used tags:', details.usedTags);
console.log('Supported tags:', details.supportedTags);
```

## 📈 Performance Considerations

- **Caching**: Reuse converter instances when possible
- **Batch processing**: Process multiple HTML strings with same converter
- **Memory**: Converter instances are lightweight, create as needed
- **Canvas measurement**: Automatic fallback in Node.js environments

## 🤝 Contributing Examples

To add new examples:

1. Create example file in appropriate category
2. Update this README with documentation
3. Add test case in `node-example.js` if applicable
4. Include error handling and edge cases

### Example Template
```javascript
// examples/my-example.js
import { HTMLToVegaLite } from '../dist/index.esm.js';

const converter = new HTMLToVegaLite();

// Your example here
const html = '<b>Example</b>';
const spec = converter.convert(html);

console.log('Generated spec:', spec);
```