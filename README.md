# HTML to Vega-Lite
By default Vega does not provide support for HTML tags extensively. This library intends to bridge the gap and enable rendering HTML in vega-lite. 

## 📁 Files Overview

### Browser Examples
- **`standalone.html`** - **Ready to use demo** (no build required)
- **`basic.html`** - Simple usage with common HTML tags (requires build)
- **`advanced.html`** - Advanced features, custom strategies, and edge cases (requires build)

### Node.js Examples  
- **`node-example.js`** - Server-side usage and file generation
- **`package.json`** - Example package configuration

### Generated Files
- **`generated/`** - Auto-generated Vega-Lite specifications and previews

## 🚀 Getting Started

### Prerequisites
```bash
# For standalone examples (no build required)
# Just open the HTML files in a browser

# For advanced examples with full library
yarn build

# For Node.js examples
node --version  # >= 16
```

### Running Examples

#### Standalone Demo (Recommended for Testing)
```bash
# No build required - just open in browser
open examples/standalone.html

# Or serve the examples directory
npx serve examples
# Then open http://localhost:3000/standalone.html
```

#### Browser Examples (Requires Build)
```bash
# Build the library first
yarn build

# Serve the examples directory
yarn example
# Then open http://localhost:3000/basic.html
```

#### Node.js Example
```bash
# Run the Node.js example
node examples/node-example.js

# With memory profiling
node --expose-gc examples/node-example.js
```

## 📖 Example Categories

### 1. Basic Usage (`basic.html`)

**Simple formatting tags:**
```html
<b>Bold text</b> and <i>italic text</i>
```

**Nested formatting:**
```html
<b>Bold with <i>nested italic</i></b>
```

**Colored text:**
```html
<span style="color: red; font-weight: bold">Red bold text</span>
```

### 2. Advanced Features (`advanced.html`)

**Custom tag strategies:**
```javascript
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

## HTML to Vega-Lite Examples

## 🤝 Contributing

We welcome contributions! To get started, please review the following guidelines and resources:

### 1. Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md) to foster a welcoming and respectful community.

### 2. How to Contribute

- **Bug Reports & Feature Requests:**  
    Open an issue describing the problem or feature. Include steps to reproduce, expected behavior, and relevant context.

- **Pull Requests:**  
    1. Fork the repository and create a new branch for your changes.
    2. Write clear, concise commit messages.
    3. Add or update tests for your changes.
    4. Ensure all tests pass (`yarn test`).
    5. Update documentation as needed (README, examples, API docs).
    6. Submit a pull request with a description of your changes.

### 3. Project Structure

Refer to [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for a detailed overview of the codebase, including:

- **Core Modules:**  
    - `src/converter/` – HTML parsing and conversion logic  
    - `src/strategies/` – Tag strategies and custom extensions  
    - `src/utils/` – Utility functions and helpers

- **Examples:**  
    - `examples/` – Browser and Node.js usage samples

- **Tests:**  
    - `test/` – Unit and integration tests

### 4. Adding New Tag Strategies

To add support for a new HTML tag or custom formatting:

1. Implement a new strategy class in `src/strategies/`.
2. Register your strategy in the converter (see "Strategy Management" in API docs).
3. Add usage examples in `examples/` and update the README.
4. Document your strategy in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

### 5. Documentation

- Update the README and relevant `.md` files for any user-facing changes.
- Add or update JSDoc comments for public APIs.
- For architectural changes, update [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

### 6. Testing

- Run `yarn test` to execute all tests.
- Add tests for new features or bug fixes in the `test/` directory.
- Ensure code coverage does not decrease.

### 7. Commit & PR Standards

- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.
- Reference related issues in your PR description.

---

For more details, see [CONTRIBUTING.md](./CONTRIBUTING.md) and [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
