# API Reference

## Overview

This document provides a complete API reference for the HTML-to-Vega-Lite converter library.

## Main Classes

### HTMLToVegaLite

The main entry point for converting HTML to Vega-Lite specifications.

```typescript
class HTMLToVegaLite {
  constructor(options?: HTMLToVegaLiteOptions);
  
  // Core conversion methods
  convert(html: string, overrideOptions?: Partial<HTMLToVegaLiteOptions>): VegaLiteSpec;
  parseHTML(html: string): ParseResult;
  layoutSegments(segments: TextSegment[], maxWidth?: number): PositionedTextSegment[];
  generateSpec(segments: PositionedTextSegment[], bounds: Bounds, options?: Partial<HTMLToVegaLiteOptions>): VegaLiteSpec;
  
  // Strategy management
  registerTagStrategy(strategy: TagStrategy): void;
  unregisterTagStrategy(strategyName: string): boolean;
  getRegisteredStrategies(): string[];
  getStrategyRegistry(): TagStrategyRegistry;
  
  // Validation
  validateHTML(html: string): ValidationResult;
}
```

#### Constructor

```typescript
constructor(options?: HTMLToVegaLiteOptions)
```

Creates a new HTML-to-Vega-Lite converter instance.

**Parameters:**
- `options` (optional): Configuration options for the converter

**Example:**
```typescript
// Default configuration
const converter = new HTMLToVegaLite();

// Custom configuration
const converter = new HTMLToVegaLite({
  fontSize: 16,
  fontFamily: 'Helvetica, sans-serif',
  startX: 20,
  startY: 40,
  lineHeight: 24,
  maxWidth: 600,
  background: 'white'
});
```

#### convert()

```typescript
convert(html: string, overrideOptions?: Partial<HTMLToVegaLiteOptions>): VegaLiteSpec
```

Converts an HTML string to a Vega-Lite specification.

**Parameters:**
- `html`: HTML string to convert
- `overrideOptions` (optional): Options to override for this conversion

**Returns:** Complete Vega-Lite specification object

**Throws:** Error if input is invalid

**Example:**
```typescript
const html = '<h1>Title</h1><p>This is <b>bold</b> text.</p>';

// Basic conversion
const spec = converter.convert(html);

// With override options
const spec = converter.convert(html, {
  fontSize: 18,
  background: '#f0f0f0',
  maxWidth: 500
});
```

#### parseHTML()

```typescript
parseHTML(html: string): ParseResult
```

Parses HTML into styled text segments without layout or Vega-Lite generation.

**Parameters:**
- `html`: HTML string to parse

**Returns:** Parse result with segments and any errors

**Example:**
```typescript
const result = converter.parseHTML('<b>Bold</b> normal');
console.log(result.segments.length); // 2
console.log(result.segments[0].fontWeight); // 'bold'
console.log(result.errors); // Any validation errors
```

#### layoutSegments()

```typescript
layoutSegments(segments: TextSegment[], maxWidth?: number): PositionedTextSegment[]
```

Applies layout positioning to text segments.

**Parameters:**
- `segments`: Array of styled text segments
- `maxWidth` (optional): Maximum width for line wrapping

**Returns:** Array of positioned text segments

**Example:**
```typescript
const parseResult = converter.parseHTML('<b>Bold text</b>');
const positioned = converter.layoutSegments(parseResult.segments, 400);
console.log(positioned[0].x, positioned[0].y); // Position coordinates
```

#### generateSpec()

```typescript
generateSpec(
  segments: PositionedTextSegment[], 
  bounds: Bounds, 
  options?: Partial<HTMLToVegaLiteOptions>
): VegaLiteSpec
```

Generates Vega-Lite specification from positioned segments.

**Parameters:**
- `segments`: Array of positioned text segments
- `bounds`: Overall dimensions `{width: number, height: number}`
- `options` (optional): Generation options

**Returns:** Vega-Lite specification

**Example:**
```typescript
const bounds = { width: 400, height: 200 };
const spec = converter.generateSpec(positioned, bounds, {
  background: 'transparent'
});
```

#### registerTagStrategy()

```typescript
registerTagStrategy(strategy: TagStrategy): void
```

Registers a custom tag strategy.

**Parameters:**
- `strategy`: Tag strategy implementation

**Example:**
```typescript
class CustomStrategy extends BaseTagStrategy {
  getTagNames() { return ['custom']; }
  applyStyle(style, attrs) { return {...style, color: 'red'}; }
}

converter.registerTagStrategy(new CustomStrategy());
```

#### unregisterTagStrategy()

```typescript
unregisterTagStrategy(strategyName: string): boolean
```

Removes a tag strategy by name.

**Parameters:**
- `strategyName`: Name of tag to remove strategy for

**Returns:** `true` if strategy was removed, `false` if not found

#### validateHTML()

```typescript
validateHTML(html: string): ValidationResult
```

Validates HTML without performing conversion.

**Parameters:**
- `html`: HTML string to validate

**Returns:** Validation result with errors if any

**Example:**
```typescript
const validation = converter.validateHTML('<a href="">Empty link</a>');
if (!validation.isValid) {
  console.log('Errors:', validation.errors);
}
```

### HTMLParser

HTML parsing with extensible tag strategy system.

```typescript
class HTMLParser {
  constructor(customStrategies?: TagStrategy[]);
  
  parseHTML(html: string): ParseResult;
  registerTagStrategy(strategy: TagStrategy): void;
  removeTagStrategy(tagName: string): boolean;
  getSupportedTags(): string[];
  isTagSupported(tagName: string): boolean;
  getStrategyRegistry(): TagStrategyRegistry;
  validateHTML(html: string): ValidationResult;
}
```

### TextLayoutEngine

Text positioning and measurement system.

```typescript
class TextLayoutEngine {
  constructor(options?: HTMLToVegaLiteOptions);
  
  measureText(text: string, style: TextStyle): TextMeasurement;
  layoutSegments(segments: TextSegment[], maxWidth?: number): PositionedTextSegment[];
  calculateBounds(segments: PositionedTextSegment[]): Bounds;
  updateOptions(options: Partial<HTMLToVegaLiteOptions>): void;
}
```

### VegaLiteGenerator

Vega-Lite specification generation.

```typescript
class VegaLiteGenerator {
  constructor(options?: HTMLToVegaLiteOptions);
  
  generateSpec(segments: PositionedTextSegment[], bounds: Bounds, options?: Partial<HTMLToVegaLiteOptions>): VegaLiteSpec;
  generateMinimalSpec(text: string): VegaLiteSpec;
  updateOptions(options: Partial<HTMLToVegaLiteOptions>): void;
}
```

## Strategy System

### TagStrategy Interface

```typescript
interface TagStrategy {
  applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle;
  getTagNames(): string[];
  validateAttributes?(attributes: string): ValidationResult;
  isLineBreak?(): boolean;
}
```

### BaseTagStrategy

```typescript
abstract class BaseTagStrategy implements TagStrategy {
  abstract applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle;
  abstract getTagNames(): string[];
  
  validateAttributes(attributes: string): ValidationResult;
  isLineBreak(): boolean;
}
```

### TagStrategyRegistry

```typescript
class TagStrategyRegistry {
  registerStrategy(strategy: TagStrategy): void;
  getStrategy(tagName: string): TagStrategy | undefined;
  isSupported(tagName: string): boolean;
  getSupportedTags(): string[];
  removeStrategy(tagName: string): boolean;
  clearStrategies(): void;
}
```

## Built-in Strategies

### Text Formatting

#### BoldTagStrategy
- **Tags**: `b`, `strong`
- **Effect**: `fontWeight: 'bold'`

#### ItalicTagStrategy
- **Tags**: `i`, `em`
- **Effect**: `fontStyle: 'italic'`

#### UnderlineTagStrategy
- **Tags**: `u`
- **Effect**: `textDecoration: 'underline'`

### CSS-Aware

#### SpanTagStrategy
- **Tags**: `span`
- **Attributes**: `style` with CSS properties
- **Supported CSS**: `color`, `font-weight`, `font-style`, `text-decoration`, `font-size`

### Structural

#### HeadingTagStrategy
- **Tags**: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- **Effect**: `fontWeight: 'bold'` + appropriate `fontSize`
- **Font Sizes**: H1=32px, H2=24px, H3=18.72px, H4=16px, H5=13.28px, H6=10.72px

#### ParagraphTagStrategy
- **Tags**: `p`
- **Effect**: Structural recognition (no style changes)

#### LineBreakTagStrategy
- **Tags**: `br`
- **Effect**: No style changes, triggers line break

#### HyperlinkTagStrategy
- **Tags**: `a`
- **Effect**: `color: '#0066cc'`, `textDecoration: 'underline'`
- **Validation**: Validates `href` attribute

### Technical Content

#### CodeTagStrategy
- **Tags**: `code`, `pre`, `kbd`, `samp`
- **Effect**: `color: '#d63384'`

#### HighlightTagStrategy
- **Tags**: `mark`
- **Effect**: `color: '#212529'`

#### SmallTextTagStrategy
- **Tags**: `small`, `sub`, `sup`
- **Effect**: `fontSize: 11.2` (0.8 × default)

### Additional

#### StrikethroughTagStrategy
- **Tags**: `s`, `strike`, `del`
- **Effect**: `textDecoration: 'line-through'`, `color: '#6c757d'`

## Type Definitions

### Core Types

```typescript
interface TextStyle {
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: string;
  textDecoration?: 'none' | 'underline' | 'line-through';
  fontSize?: number;
}

interface TextSegment extends TextStyle {
  text: string;
}

interface PositionedTextSegment extends TextSegment {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HTMLToVegaLiteOptions {
  fontSize?: number;
  fontFamily?: string;
  startX?: number;
  startY?: number;
  lineHeight?: number;
  maxWidth?: number;
  background?: string;
}
```

### Parse Results

```typescript
interface ParseResult {
  segments: TextSegment[];
  errors: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

### Measurements and Bounds

```typescript
interface TextMeasurement {
  width: number;
  height: number;
}

interface Bounds {
  width: number;
  height: number;
}
```

### Vega-Lite Types

```typescript
interface VegaLiteSpec {
  $schema: string;
  width: number;
  height: number;
  background: string;
  padding: number;
  autosize: string;
  config: {
    view: { stroke: null };
  };
  resolve: {
    scale: {
      x: string;
      y: string;
    };
  };
  layer: VegaLiteLayer[];
}

interface VegaLiteLayer {
  data: {
    values: VegaLiteLayerData[];
  };
  mark: VegaLiteTextMark | VegaLiteRuleMark;
  encoding: {
    x: VegaLiteEncoding;
    y: VegaLiteEncoding;
    text?: VegaLiteEncoding;
  };
}

interface VegaLiteLayerData {
  id: number;
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  x2?: number; // For rule marks
}

interface VegaLiteTextMark {
  type: 'text';
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: string;
  align: 'left' | 'center' | 'right';
  baseline: 'top' | 'middle' | 'bottom';
}

interface VegaLiteRuleMark {
  type: 'rule';
  color: string;
  strokeWidth: number;
}

interface VegaLiteEncoding {
  field: string;
  type: 'quantitative' | 'nominal';
  axis?: null;
  scale?: {
    domain: [number, number];
  };
}
```

## Factory Functions

### Registry Factories

```typescript
function createDefaultTagStrategyRegistry(): TagStrategyRegistry
```

Creates a registry with all built-in strategies pre-registered.

```typescript
function createMinimalTagStrategyRegistry(): TagStrategyRegistry
```

Creates a registry with only basic text formatting strategies.

## Utility Functions

### Style Utilities

```typescript
function parseInlineStyles(styleString: string): Partial<TextStyle>
```

Parses CSS style string into TextStyle properties.

**Example:**
```typescript
const styles = parseInlineStyles('color: red; font-weight: bold');
// Returns: { color: 'red', fontWeight: 'bold' }
```

### Validation Utilities

```typescript
function isValidColor(color: string): boolean
function isValidUrl(url: string): boolean
function isValidFontSize(size: string): boolean
```

## Error Handling

### Error Types

The library uses standard JavaScript `Error` objects with descriptive messages:

```typescript
// Input validation errors
throw new Error('Input must be a non-empty string');

// Strategy registration errors
throw new Error('Strategy must implement TagStrategy interface');

// HTML parsing errors (collected in ParseResult.errors)
errors.push('Invalid URL in href attribute');
errors.push('Malformed HTML tag');
```

### Error Recovery

- **Unknown tags**: Treated as plain text, no error thrown
- **Invalid attributes**: Validation errors collected but parsing continues
- **Malformed HTML**: Parser attempts to recover and continue
- **Missing dependencies**: Graceful fallbacks (e.g., Canvas API unavailable)

## Browser Compatibility

### Supported Browsers

- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Features used**: ES2017 features, Canvas API (optional), Map/Set collections

### Polyfills

For older browser support, include polyfills for:
- `Map` and `Set` (IE)
- `Object.assign` (IE)
- `Array.from` (IE)

### Node.js Support

- **Minimum version**: Node.js 14+
- **Canvas fallback**: Uses character-based text measurement when Canvas API unavailable

## Performance Considerations

### Optimization Features

1. **Strategy Caching**: Strategies are cached after first lookup
2. **Style Grouping**: Identical styles merged into single Vega-Lite layers
3. **Lazy Initialization**: Components initialized only when needed
4. **Memory Efficiency**: Minimal object creation during parsing

### Performance Guidelines

1. **Large Documents**: Consider chunking very large HTML documents
2. **Repeated Conversions**: Reuse converter instances when possible
3. **Custom Strategies**: Minimize computation in `applyStyle` methods
4. **Memory Usage**: Clear references to large objects when done

### Benchmarks

Typical performance on modern hardware:

- **Simple HTML** (< 1KB): < 5ms
- **Complex HTML** (10KB): < 50ms
- **Large Documents** (100KB): < 500ms

Memory usage scales linearly with document size, approximately 2-3x the input size.

---

For more detailed information, see:
- [Architecture Documentation](./ARCHITECTURE.md)
- [Strategy System Documentation](./STRATEGIES.md)
- [Extension Guide](./EXTENSIONS.md)
- [Testing Guide](./TESTING.md)
