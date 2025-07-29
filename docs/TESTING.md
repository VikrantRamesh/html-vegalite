# Testing Guide

## Overview

This guide covers the comprehensive testing strategy for the HTML-to-Vega-Lite converter, including unit tests, integration tests, and testing patterns for extensions.

## Test Architecture

### Test Structure

```
tests/
├── index.test.ts           # Main API tests
├── parser.test.ts          # HTML parsing tests
├── layout.test.ts          # Text positioning tests
├── vega-generator.test.ts  # Vega-Lite generation tests
├── strategies.test.ts      # Tag strategy tests
├── integration.test.ts     # End-to-end pipeline tests
├── examples.test.ts        # Real-world usage examples
└── html-to-vegalite.test.ts # Component integration tests
```

### Test Categories

#### Unit Tests
- Test individual components in isolation
- Mock dependencies where necessary
- Fast execution, high coverage

#### Integration Tests
- Test component interactions
- Use real dependencies
- Focus on data flow between components

#### End-to-End Tests
- Test complete conversion pipeline
- Real HTML inputs to Vega-Lite outputs
- Performance and edge case validation

## Component Testing

### HTMLToVegaLite (Main API)

**File**: `tests/index.test.ts`

```typescript
import { HTMLToVegaLite } from '../src/index';

describe('HTMLToVegaLite', () => {
  let converter: HTMLToVegaLite;

  beforeEach(() => {
    converter = new HTMLToVegaLite();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const defaultConverter = new HTMLToVegaLite();
      expect(defaultConverter).toBeInstanceOf(HTMLToVegaLite);
    });

    it('should create instance with custom options', () => {
      const options = { fontSize: 16, fontFamily: 'Helvetica' };
      const customConverter = new HTMLToVegaLite(options);
      expect(customConverter).toBeInstanceOf(HTMLToVegaLite);
    });
  });

  describe('convert', () => {
    it('should convert simple HTML to Vega-Lite spec', () => {
      const html = '<b>Bold text</b>';
      const spec = converter.convert(html);

      expect(spec).toHaveProperty('$schema');
      expect(spec).toHaveProperty('layer');
      expect(spec.layer).toHaveLength(1);
      expect(spec.layer[0].mark.fontWeight).toBe('bold');
    });

    it('should handle override options', () => {
      const html = '<p>Test</p>';
      const options = { fontSize: 20, background: 'white' };
      const spec = converter.convert(html, options);

      expect(spec.layer[0].mark.fontSize).toBe(20);
      expect(spec.background).toBe('white');
    });

    it('should throw error for invalid input', () => {
      expect(() => converter.convert('')).toThrow('Input must be a non-empty string');
      expect(() => converter.convert(null as any)).toThrow('Input must be a non-empty string');
    });
  });

  describe('strategy management', () => {
    it('should register custom strategy', () => {
      const customStrategy = new CustomTagStrategy();
      converter.registerTagStrategy(customStrategy);
      
      const strategies = converter.getRegisteredStrategies();
      expect(strategies).toContain('custom');
    });

    it('should unregister strategy', () => {
      const removed = converter.unregisterTagStrategy('b');
      expect(removed).toBe(true);
      
      const strategies = converter.getRegisteredStrategies();
      expect(strategies).not.toContain('b');
    });
  });
});
```

### HTMLParser

**File**: `tests/parser.test.ts`

```typescript
import { HTMLParser } from '../src/parser';
import { BoldTagStrategy } from '../src/strategies';

describe('HTMLParser', () => {
  let parser: HTMLParser;

  beforeEach(() => {
    parser = new HTMLParser();
  });

  describe('parseHTML', () => {
    it('should parse simple text', () => {
      const result = parser.parseHTML('Hello World');
      
      expect(result.segments).toHaveLength(1);
      expect(result.segments[0].text).toBe('Hello World');
      expect(result.segments[0].fontWeight).toBe('normal');
    });

    it('should parse bold tags', () => {
      const result = parser.parseHTML('<b>Bold text</b>');
      
      expect(result.segments).toHaveLength(1);
      expect(result.segments[0].text).toBe('Bold text');
      expect(result.segments[0].fontWeight).toBe('bold');
    });

    it('should handle nested tags', () => {
      const result = parser.parseHTML('<b><i>Bold italic</i></b>');
      
      expect(result.segments).toHaveLength(1);
      expect(result.segments[0].text).toBe('Bold italic');
      expect(result.segments[0].fontWeight).toBe('bold');
      expect(result.segments[0].fontStyle).toBe('italic');
    });

    it('should handle mixed content', () => {
      const result = parser.parseHTML('Normal <b>bold</b> normal');
      
      expect(result.segments).toHaveLength(3);
      expect(result.segments[0].text).toBe('Normal ');
      expect(result.segments[0].fontWeight).toBe('normal');
      expect(result.segments[1].text).toBe('bold');
      expect(result.segments[1].fontWeight).toBe('bold');
      expect(result.segments[2].text).toBe(' normal');
      expect(result.segments[2].fontWeight).toBe('normal');
    });

    it('should handle malformed HTML gracefully', () => {
      const result = parser.parseHTML('<b>Unclosed bold');
      
      expect(result.segments).toHaveLength(1);
      expect(result.segments[0].text).toBe('Unclosed bold');
      expect(result.segments[0].fontWeight).toBe('bold');
    });

    it('should collect validation errors', () => {
      const result = parser.parseHTML('<a href="">Empty link</a>');
      
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('href');
    });
  });

  describe('strategy management', () => {
    it('should register custom strategy', () => {
      const strategy = new BoldTagStrategy();
      parser.registerTagStrategy(strategy);
      
      expect(parser.isTagSupported('b')).toBe(true);
      expect(parser.isTagSupported('strong')).toBe(true);
    });

    it('should remove strategy', () => {
      expect(parser.removeTagStrategy('b')).toBe(true);
      expect(parser.isTagSupported('b')).toBe(false);
    });
  });
});
```

### TextLayoutEngine

**File**: `tests/layout.test.ts`

```typescript
import { TextLayoutEngine } from '../src/layout';
import { TextSegment } from '../src/types';

describe('TextLayoutEngine', () => {
  let layoutEngine: TextLayoutEngine;

  beforeEach(() => {
    layoutEngine = new TextLayoutEngine({
      fontSize: 14,
      fontFamily: 'Arial',
      startX: 10,
      startY: 30,
      lineHeight: 20
    });
  });

  describe('measureText', () => {
    it('should measure text dimensions', () => {
      const measurement = layoutEngine.measureText('Hello', {
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000'
      });

      expect(measurement.width).toBeGreaterThan(0);
      expect(measurement.height).toBeGreaterThan(0);
    });

    it('should handle different font weights', () => {
      const normal = layoutEngine.measureText('Test', {
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000'
      });

      const bold = layoutEngine.measureText('Test', {
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: '#000000'
      });

      // Bold text should be wider
      expect(bold.width).toBeGreaterThanOrEqual(normal.width);
    });
  });

  describe('layoutSegments', () => {
    it('should position single segment', () => {
      const segments: TextSegment[] = [{
        text: 'Hello',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000'
      }];

      const positioned = layoutEngine.layoutSegments(segments);

      expect(positioned).toHaveLength(1);
      expect(positioned[0].x).toBe(10);
      expect(positioned[0].y).toBe(30);
      expect(positioned[0].width).toBeGreaterThan(0);
      expect(positioned[0].height).toBeGreaterThan(0);
    });

    it('should position multiple segments horizontally', () => {
      const segments: TextSegment[] = [
        {
          text: 'Hello ',
          fontWeight: 'normal',
          fontStyle: 'normal',
          color: '#000000'
        },
        {
          text: 'World',
          fontWeight: 'bold',
          fontStyle: 'normal',
          color: '#000000'
        }
      ];

      const positioned = layoutEngine.layoutSegments(segments);

      expect(positioned).toHaveLength(2);
      expect(positioned[0].x).toBe(10);
      expect(positioned[1].x).toBeGreaterThan(positioned[0].x);
      expect(positioned[0].y).toBe(positioned[1].y); // Same line
    });

    it('should handle line wrapping', () => {
      const longText = 'This is a very long text that should wrap to the next line when it exceeds the maximum width';
      const segments: TextSegment[] = [{
        text: longText,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000'
      }];

      const positioned = layoutEngine.layoutSegments(segments, 200);

      // Text should be split into multiple positioned segments
      expect(positioned.length).toBeGreaterThan(1);
      
      // Second line should be below first
      if (positioned.length > 1) {
        expect(positioned[1].y).toBeGreaterThan(positioned[0].y);
      }
    });
  });

  describe('calculateBounds', () => {
    it('should calculate correct bounds', () => {
      const positioned = [
        { text: 'A', x: 10, y: 30, width: 50, height: 14, fontWeight: 'normal' as const, fontStyle: 'normal' as const, color: '#000' },
        { text: 'B', x: 60, y: 50, width: 30, height: 14, fontWeight: 'normal' as const, fontStyle: 'normal' as const, color: '#000' }
      ];

      const bounds = layoutEngine.calculateBounds(positioned);

      expect(bounds.width).toBe(90); // 60 + 30
      expect(bounds.height).toBe(64); // 50 + 14
    });
  });
});
```

### VegaLiteGenerator

**File**: `tests/vega-generator.test.ts`

```typescript
import { VegaLiteGenerator } from '../src/vega-generator';
import { PositionedTextSegment } from '../src/types';

describe('VegaLiteGenerator', () => {
  let generator: VegaLiteGenerator;

  beforeEach(() => {
    generator = new VegaLiteGenerator({ fontSize: 14, fontFamily: 'Arial' });
  });

  describe('generateSpec', () => {
    it('should generate basic Vega-Lite spec', () => {
      const segments: PositionedTextSegment[] = [{
        text: 'Hello',
        x: 10,
        y: 30,
        width: 50,
        height: 14,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000',
        textDecoration: 'none'
      }];

      const bounds = { width: 200, height: 50 };
      const spec = generator.generateSpec(segments, bounds);

      expect(spec.$schema).toBe('https://vega.github.io/schema/vega-lite/v5.json');
      expect(spec.width).toBe(200);
      expect(spec.height).toBe(50);
      expect(spec.layer).toHaveLength(1);
    });

    it('should group segments by style', () => {
      const segments: PositionedTextSegment[] = [
        {
          text: 'Normal1',
          x: 10, y: 30, width: 50, height: 14,
          fontWeight: 'normal', fontStyle: 'normal', color: '#000000', textDecoration: 'none'
        },
        {
          text: 'Bold',
          x: 70, y: 30, width: 40, height: 14,
          fontWeight: 'bold', fontStyle: 'normal', color: '#000000', textDecoration: 'none'
        },
        {
          text: 'Normal2',
          x: 120, y: 30, width: 50, height: 14,
          fontWeight: 'normal', fontStyle: 'normal', color: '#000000', textDecoration: 'none'
        }
      ];

      const bounds = { width: 200, height: 50 };
      const spec = generator.generateSpec(segments, bounds);

      // Should create 2 layers: one for normal, one for bold
      expect(spec.layer).toHaveLength(2);
      
      const normalLayer = spec.layer.find(l => l.mark.fontWeight === 'normal');
      const boldLayer = spec.layer.find(l => l.mark.fontWeight === 'bold');
      
      expect(normalLayer?.data.values).toHaveLength(2); // Normal1 and Normal2
      expect(boldLayer?.data.values).toHaveLength(1);   // Bold
    });

    it('should handle text decorations', () => {
      const segments: PositionedTextSegment[] = [{
        text: 'Underlined',
        x: 10, y: 30, width: 80, height: 14,
        fontWeight: 'normal', fontStyle: 'normal', color: '#000000',
        textDecoration: 'underline'
      }];

      const bounds = { width: 200, height: 50 };
      const spec = generator.generateSpec(segments, bounds);

      // Should create 2 layers: text layer + underline layer
      expect(spec.layer).toHaveLength(2);
      expect(spec.layer[0].mark.type).toBe('text');
      expect(spec.layer[1].mark.type).toBe('rule');
    });

    it('should apply override options', () => {
      const segments: PositionedTextSegment[] = [{
        text: 'Test',
        x: 10, y: 30, width: 40, height: 14,
        fontWeight: 'normal', fontStyle: 'normal', color: '#000000', textDecoration: 'none'
      }];

      const bounds = { width: 200, height: 50 };
      const options = { background: '#ffffff', fontSize: 18 };
      const spec = generator.generateSpec(segments, bounds, options);

      expect(spec.background).toBe('#ffffff');
      expect(spec.layer[0].mark.fontSize).toBe(18);
    });
  });

  describe('generateMinimalSpec', () => {
    it('should generate minimal spec', () => {
      const spec = generator.generateMinimalSpec('Test');

      expect(spec.layer).toHaveLength(1);
      expect(spec.layer[0].data.values[0].text).toBe('Test');
      expect(spec.layer[0].mark.fontSize).toBe(14);
    });
  });
});
```

## Strategy Testing

### Individual Strategy Tests

**File**: `tests/strategies.test.ts`

```typescript
import { BoldTagStrategy, HeadingTagStrategy } from '../src/strategies';
import { TextStyle } from '../src/types';

describe('Tag Strategies', () => {
  describe('BoldTagStrategy', () => {
    let strategy: BoldTagStrategy;

    beforeEach(() => {
      strategy = new BoldTagStrategy();
    });

    it('should return correct tag names', () => {
      expect(strategy.getTagNames()).toEqual(['b', 'strong']);
    });

    it('should apply bold font weight', () => {
      const currentStyle: TextStyle = {
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000'
      };

      const result = strategy.applyStyle(currentStyle, '');
      expect(result.fontWeight).toBe('bold');
      expect(result.fontStyle).toBe('normal'); // Preserve other properties
    });

    it('should validate empty attributes', () => {
      const validation = strategy.validateAttributes('');
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('HeadingTagStrategy', () => {
    let strategy: HeadingTagStrategy;

    beforeEach(() => {
      strategy = new HeadingTagStrategy();
    });

    it('should return correct tag names', () => {
      expect(strategy.getTagNames()).toEqual(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
    });

    it('should apply correct font sizes', () => {
      const currentStyle: TextStyle = {
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000'
      };

      const h1Style = strategy.applyStyle(currentStyle, '', 'h1');
      expect(h1Style.fontSize).toBe(32);
      expect(h1Style.fontWeight).toBe('bold');

      const h2Style = strategy.applyStyle(currentStyle, '', 'h2');
      expect(h2Style.fontSize).toBe(24);

      const h3Style = strategy.applyStyle(currentStyle, '', 'h3');
      expect(h3Style.fontSize).toBe(18.72);
    });
  });
});
```

### Strategy Registry Tests

```typescript
describe('TagStrategyRegistry', () => {
  let registry: TagStrategyRegistry;

  beforeEach(() => {
    registry = new TagStrategyRegistry();
  });

  it('should register and retrieve strategies', () => {
    const strategy = new BoldTagStrategy();
    registry.registerStrategy(strategy);

    expect(registry.isSupported('b')).toBe(true);
    expect(registry.getStrategy('b')).toBe(strategy);
  });

  it('should handle multiple tags per strategy', () => {
    const strategy = new BoldTagStrategy();
    registry.registerStrategy(strategy);

    expect(registry.isSupported('b')).toBe(true);
    expect(registry.isSupported('strong')).toBe(true);
    expect(registry.getStrategy('b')).toBe(strategy);
    expect(registry.getStrategy('strong')).toBe(strategy);
  });

  it('should remove strategies correctly', () => {
    const strategy = new BoldTagStrategy();
    registry.registerStrategy(strategy);

    expect(registry.removeStrategy('b')).toBe(true);
    expect(registry.isSupported('b')).toBe(false);
    expect(registry.isSupported('strong')).toBe(false); // All tags removed
  });
});
```

## Integration Testing

### End-to-End Pipeline Tests

**File**: `tests/integration.test.ts`

```typescript
import { HTMLToVegaLite } from '../src/index';

describe('Integration Tests', () => {
  let converter: HTMLToVegaLite;

  beforeEach(() => {
    converter = new HTMLToVegaLite();
  });

  describe('Complex HTML Conversion', () => {
    it('should handle nested formatting', () => {
      const html = '<h1>Title</h1><p>This is <b>bold <i>and italic</i></b> text.</p>';
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThan(1);
      
      // Find the h1 layer
      const h1Layer = spec.layer.find(layer => 
        layer.mark.fontSize === 32 && layer.mark.fontWeight === 'bold'
      );
      expect(h1Layer).toBeDefined();
      expect(h1Layer?.data.values[0].text).toBe('Title');

      // Find the bold italic layer
      const boldItalicLayer = spec.layer.find(layer =>
        layer.mark.fontWeight === 'bold' && layer.mark.fontStyle === 'italic'
      );
      expect(boldItalicLayer).toBeDefined();
      expect(boldItalicLayer?.data.values[0].text).toBe('and italic');
    });

    it('should handle links with validation', () => {
      const html = '<a href="https://example.com">Valid link</a>';
      const spec = converter.convert(html);

      const linkLayer = spec.layer.find(layer =>
        layer.mark.color === '#0066cc' && layer.mark.textDecoration === 'underline'
      );
      expect(linkLayer).toBeDefined();
    });

    it('should collect validation errors for invalid links', () => {
      const html = '<a href="">Empty link</a>';
      const validation = converter.validateHTML(html);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Option Override Integration', () => {
    it('should respect global and override options correctly', () => {
      const converter = new HTMLToVegaLite({
        fontSize: 16,
        fontFamily: 'Arial'
      });

      const html = '<p>Test content</p>';
      const spec = converter.convert(html, {
        fontSize: 18,
        background: 'blue',
        maxWidth: 500
      });

      expect(spec.layer[0].mark.fontSize).toBe(18); // Overridden
      expect(spec.layer[0].mark.fontFamily).toBe('Arial'); // From constructor
      expect(spec.background).toBe('blue'); // Overridden
      expect(spec.width).toBeLessThanOrEqual(500); // Overridden maxWidth
    });
  });

  describe('Performance Tests', () => {
    it('should handle large documents efficiently', () => {
      const largeHtml = Array(1000).fill('<b>Bold text</b> normal text ').join('');
      
      const startTime = Date.now();
      const spec = converter.convert(largeHtml);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(spec.layer.length).toBeGreaterThan(0);
    });

    it('should optimize layer creation', () => {
      // Many segments with same style should be grouped
      const repeatedHtml = Array(100).fill('<b>Bold</b>').join(' ');
      const spec = converter.convert(repeatedHtml);

      // Should create minimal layers despite many segments
      expect(spec.layer.length).toBeLessThan(10);
    });
  });
});
```

## Testing Patterns

### Mocking Dependencies

```typescript
// Mock canvas for testing in Node.js environment
jest.mock('canvas', () => ({
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      measureText: jest.fn(() => ({ width: 50 })),
      font: ''
    }))
  }))
}));
```

### Custom Matchers

```typescript
// jest.setup.ts
expect.extend({
  toBeValidVegaLiteSpec(received) {
    const hasSchema = received.$schema && received.$schema.includes('vega-lite');
    const hasLayer = Array.isArray(received.layer);
    const hasWidth = typeof received.width === 'number';
    const hasHeight = typeof received.height === 'number';

    const pass = hasSchema && hasLayer && hasWidth && hasHeight;

    return {
      message: () => `Expected ${received} to be a valid Vega-Lite specification`,
      pass
    };
  }
});

// Usage in tests
expect(spec).toBeValidVegaLiteSpec();
```

### Test Data Factories

```typescript
// test-helpers.ts
export function createTextSegment(overrides: Partial<TextSegment> = {}): TextSegment {
  return {
    text: 'Sample text',
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: '#000000',
    textDecoration: 'none',
    ...overrides
  };
}

export function createPositionedSegment(overrides: Partial<PositionedTextSegment> = {}): PositionedTextSegment {
  return {
    ...createTextSegment(),
    x: 10,
    y: 30,
    width: 80,
    height: 14,
    ...overrides
  };
}

// Usage in tests
const segment = createPositionedSegment({ fontWeight: 'bold', color: 'red' });
```

## Performance Testing

### Benchmark Tests

```typescript
describe('Performance Benchmarks', () => {
  it('should convert simple HTML quickly', () => {
    const converter = new HTMLToVegaLite();
    const html = '<b>Bold</b> normal <i>italic</i>';

    const start = process.hrtime.bigint();
    converter.convert(html);
    const end = process.hrtime.bigint();

    const durationMs = Number(end - start) / 1000000;
    expect(durationMs).toBeLessThan(10); // Should complete in under 10ms
  });

  it('should scale linearly with content size', () => {
    const converter = new HTMLToVegaLite();
    
    const timings: number[] = [];
    for (const size of [100, 200, 400, 800]) {
      const html = Array(size).fill('<b>text</b>').join(' ');
      
      const start = process.hrtime.bigint();
      converter.convert(html);
      const end = process.hrtime.bigint();
      
      timings.push(Number(end - start) / 1000000);
    }

    // Each doubling should not more than double the time
    expect(timings[1] / timings[0]).toBeLessThan(3);
    expect(timings[2] / timings[1]).toBeLessThan(3);
    expect(timings[3] / timings[2]).toBeLessThan(3);
  });
});
```

### Memory Testing

```typescript
describe('Memory Usage', () => {
  it('should not leak memory with repeated conversions', () => {
    const converter = new HTMLToVegaLite();
    const html = '<b>Test</b>';

    const initialMemory = process.memoryUsage().heapUsed;
    
    // Perform many conversions
    for (let i = 0; i < 1000; i++) {
      converter.convert(html);
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;

    // Memory increase should be minimal (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
```

## Test Configuration

### Jest Configuration

**File**: `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/examples/**/*' // Exclude example files
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};
```

### Test Scripts

**File**: `package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern='src/.*\\.test\\.ts$'",
    "test:strategies": "jest --testPathPattern=strategies"
  }
}
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - run: npm ci
    - run: npm run build
    - run: npm run test:ci
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
```

## Testing Best Practices

### Test Organization

1. **Descriptive Names**: Use clear, descriptive test names
2. **AAA Pattern**: Arrange, Act, Assert structure
3. **Single Assertion**: One logical assertion per test
4. **Test Independence**: Tests should not depend on each other

### Test Data

1. **Minimal Examples**: Use the smallest possible test data
2. **Edge Cases**: Test boundary conditions and error cases
3. **Real Examples**: Include tests with realistic HTML content

### Performance

1. **Fast Tests**: Unit tests should run in milliseconds
2. **Focused Testing**: Only test the component being tested
3. **Setup/Teardown**: Minimize expensive setup operations

### Coverage

1. **High Coverage**: Aim for >90% line and branch coverage
2. **Quality Over Quantity**: Focus on testing important code paths
3. **Integration Gaps**: Use integration tests to cover component interactions

---

For more information, see:
- [Architecture Documentation](./ARCHITECTURE.md)
- [Extension Guide](./EXTENSIONS.md)
- [Strategy System Documentation](./STRATEGIES.md)
