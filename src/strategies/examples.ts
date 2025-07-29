import { HTMLParser } from '../parser';
import { 
  createDefaultTagStrategyRegistry,
  createMinimalTagStrategyRegistry,
  StrikethroughTagStrategy,
  ColorTagStrategy
} from '../strategies/index';

// Example 1: Using default parser with all strategies
console.log('=== Example 1: Default Parser ===');
const defaultParser = new HTMLParser();

const html1 = '<h1>Main Title</h1><p>This is a <b>bold</b> paragraph with a <a href="https://example.com">link</a>.</p><code>console.log("Hello");</code>';
const result1 = defaultParser.parseHTML(html1);

console.log('Parsed segments:', result1.segments.length);
console.log('Supported tags:', defaultParser.getSupportedTags());

// Example 2: Using minimal parser and adding custom strategies
console.log('\n=== Example 2: Custom Parser ===');
const customRegistry = createMinimalTagStrategyRegistry();
customRegistry.registerStrategy(new StrikethroughTagStrategy());
customRegistry.registerStrategy(new ColorTagStrategy());

const customParser = new HTMLParser();
// Replace the default registry with our custom one
customParser.getStrategyRegistry().clearStrategies();
for (const tagName of customRegistry.getSupportedTags()) {
  const strategy = customRegistry.getStrategy(tagName);
  if (strategy) {
    customParser.registerTagStrategy(strategy);
  }
}

const html2 = '<b>Bold</b> <s>Strikethrough</s> <red>Red text</red>';
const result2 = customParser.parseHTML(html2);

console.log('Custom parser segments:', result2.segments.length);
console.log('Custom supported tags:', customParser.getSupportedTags());

// Example 3: Validation
console.log('\n=== Example 3: Validation ===');
const htmlWithErrors = '<a href="">Empty link</a> <span style="invalid-property: value;">Invalid CSS</span>';
const validation = defaultParser.validateHTML(htmlWithErrors);

console.log('Validation result:', validation);
if (!validation.isValid) {
  console.log('Errors found:', validation.errors);
}

// Example 4: Detailed parsing
console.log('\n=== Example 4: Detailed Parsing ===');
const htmlComplex = '<h2>Section Title</h2><p>Regular text with <mark>highlighted</mark> content and <code>inline code</code>.</p>';
const detailedResult = defaultParser.parseWithDetails(htmlComplex);

console.log('Detailed result:');
console.log('- Segments:', detailedResult.segments.length);
console.log('- Errors:', detailedResult.errors);
console.log('- Used tags:', detailedResult.usedTags);
console.log('- Supported tags:', detailedResult.supportedTags.length);

export {
  defaultParser,
  customParser,
  result1,
  result2,
  validation,
  detailedResult
};
