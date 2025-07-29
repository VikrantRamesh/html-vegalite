# Extension Guide

## Overview

This guide provides comprehensive instructions for extending the HTML-to-Vega-Lite converter with new functionality, including adding new tag strategies, modifying the pipeline, and implementing custom features.

## Adding New Tag Strategies

### Quick Start: Simple Strategy

Here's how to add a new strategy for a `<highlight>` tag that makes text yellow:

#### 1. Create the Strategy File

**Location**: `src/strategies/implementations/highlight-custom-strategy.ts`

```typescript
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';
import { TextStyle } from '../../types';

export class HighlightCustomStrategy extends BaseTagStrategy {
  public applyStyle(currentStyle: TextStyle, attributes: string): TextStyle {
    return {
      ...currentStyle,
      color: '#000000',
      // Note: backgroundColor would require extending TextStyle interface
    };
  }

  public getTagNames(): string[] {
    return ['highlight'];
  }

  public validateAttributes(attributes: string): { isValid: boolean; errors: string[] } {
    // No attributes expected for this simple strategy
    if (attributes.trim()) {
      return {
        isValid: false,
        errors: ['<highlight> tag does not accept attributes']
      };
    }
    return { isValid: true, errors: [] };
  }
}
```

#### 2. Export the Strategy

**Add to**: `src/strategies/implementations/index.ts`

```typescript
// Add this line to the existing exports
export { HighlightCustomStrategy } from './highlight-custom-strategy';
```

#### 3. Register the Strategy

**Option A: Modify Default Registry**

Edit `src/strategies/index.ts`:

```typescript
import { HighlightCustomStrategy } from './implementations/index';

export function createDefaultTagStrategyRegistry(): TagStrategyRegistry {
  const registry = new TagStrategyRegistry();
  
  // ... existing strategies ...
  registry.registerStrategy(new HighlightCustomStrategy());
  
  return registry;
}
```

**Option B: Register at Runtime**

```typescript
import { HTMLToVegaLite, HighlightCustomStrategy } from 'html-vegalite';

const converter = new HTMLToVegaLite();
converter.registerTagStrategy(new HighlightCustomStrategy());
```

#### 4. Add Tests

**Create**: `tests/highlight-custom-strategy.test.ts`

```typescript
import { HighlightCustomStrategy } from '../src/strategies/implementations/highlight-custom-strategy';
import { TextStyle } from '../src/types';

describe('HighlightCustomStrategy', () => {
  let strategy: HighlightCustomStrategy;

  beforeEach(() => {
    strategy = new HighlightCustomStrategy();
  });

  it('should return correct tag names', () => {
    expect(strategy.getTagNames()).toEqual(['highlight']);
  });

  it('should apply highlight styling', () => {
    const currentStyle: TextStyle = {
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#666666'
    };

    const result = strategy.applyStyle(currentStyle, '');
    expect(result.color).toBe('#000000');
    expect(result.fontWeight).toBe('normal'); // Preserve other properties
  });

  it('should reject attributes', () => {
    const validation = strategy.validateAttributes('class="test"');
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('<highlight> tag does not accept attributes');
  });

  it('should accept empty attributes', () => {
    const validation = strategy.validateAttributes('');
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});
```

**Add to main test suite**: `tests/strategies.test.ts`

```typescript
// Add import
import { HighlightCustomStrategy } from '../src/strategies/implementations/highlight-custom-strategy';

// Add test group
describe('HighlightCustomStrategy', () => {
  // Copy tests from above
});
```

### Advanced Strategy: Attribute-Based

Here's a more complex strategy for `<font>` tags with size and color attributes:

```typescript
export class FontTagStrategy extends BaseTagStrategy {
  public applyStyle(currentStyle: TextStyle, attributes: string): TextStyle {
    const style = { ...currentStyle };
    
    // Parse color attribute
    const colorMatch = attributes.match(/color=['"]([^'"]+)['"]/i);
    if (colorMatch) {
      style.color = colorMatch[1];
    }
    
    // Parse size attribute
    const sizeMatch = attributes.match(/size=['"]([^'"]+)['"]/i);
    if (sizeMatch) {
      const size = this.parseSize(sizeMatch[1]);
      if (size) {
        style.fontSize = size;
      }
    }
    
    return style;
  }

  public getTagNames(): string[] {
    return ['font'];
  }

  public validateAttributes(attributes: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate color attribute
    const colorMatch = attributes.match(/color=['"]([^'"]+)['"]/i);
    if (colorMatch && !this.isValidColor(colorMatch[1])) {
      errors.push(`Invalid color value: ${colorMatch[1]}`);
    }
    
    // Validate size attribute
    const sizeMatch = attributes.match(/size=['"]([^'"]+)['"]/i);
    if (sizeMatch && !this.isValidSize(sizeMatch[1])) {
      errors.push(`Invalid size value: ${sizeMatch[1]}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private parseSize(sizeStr: string): number | null {
    // Handle relative sizes: 1-7
    const numSize = parseInt(sizeStr, 10);
    if (numSize >= 1 && numSize <= 7) {
      const sizes = [8, 10, 12, 14, 18, 24, 32];
      return sizes[numSize - 1];
    }
    
    // Handle pixel values: "16px"
    const pxMatch = sizeStr.match(/^(\d+)px$/i);
    if (pxMatch) {
      return parseInt(pxMatch[1], 10);
    }
    
    return null;
  }

  private isValidColor(color: string): boolean {
    // Basic color validation
    return /^(#[0-9a-f]{3,6}|[a-z]+)$/i.test(color);
  }

  private isValidSize(size: string): boolean {
    return this.parseSize(size) !== null;
  }
}
```

### Multi-Tag Strategy

Strategy that handles multiple related tags:

```typescript
export class ListTagStrategy extends BaseTagStrategy {
  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    const style = { ...currentStyle };
    
    switch (tagName) {
      case 'ul':
      case 'ol':
        // List containers might have different styling
        break;
      case 'li':
        // List items get a bullet-like prefix (we can't add bullets in text, 
        // but we could modify the text content)
        style.color = currentStyle.color; // Preserve current color
        break;
    }
    
    return style;
  }

  public getTagNames(): string[] {
    return ['ul', 'ol', 'li'];
  }

  public isLineBreak(): boolean {
    // List items should create line breaks
    return true;
  }
}
```

## Extending Core Interfaces

### Adding New Style Properties

To add new styling capabilities, extend the `TextStyle` interface:

**Edit**: `src/types.ts`

```typescript
export interface TextStyle {
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: string;
  textDecoration?: 'none' | 'underline' | 'line-through';
  fontSize?: number;
  
  // New properties
  backgroundColor?: string;
  fontFamily?: string;
  opacity?: number;
  textAlign?: 'left' | 'center' | 'right';
}
```

**Update VegaLiteGenerator**: `src/vega-generator.ts`

```typescript
private createLayer(group: StyleGroup, bounds: any, options: any): VegaLiteLayer {
  // ... existing code ...
  
  return {
    data: { values: group.data },
    mark: {
      type: 'text',
      fontSize: fontSize,
      fontFamily: group.style.fontFamily || fontFamily, // Use new property
      fontWeight: group.style.fontWeight,
      fontStyle: group.style.fontStyle,
      color: group.style.color,
      opacity: group.style.opacity, // Use new property
      align: group.style.textAlign || 'left', // Use new property
      baseline: 'top'
    },
    encoding: { /* ... */ }
  };
}
```

**Update Style Grouping Key**: `src/vega-generator.ts`

```typescript
private createStyleKey(segment: PositionedTextSegment): string {
  return `${segment.fontWeight}-${segment.fontStyle}-${segment.color}-${segment.textDecoration ?? 'none'}-${segment.fontSize ?? 'default'}-${segment.backgroundColor ?? 'none'}-${segment.opacity ?? '1'}`;
}
```

### Adding Background Color Support

Since Vega-Lite doesn't natively support text background colors, you'd need to create a background rectangle layer:

```typescript
// In VegaLiteGenerator
private createBackgroundLayer(group: StyleGroup, bounds: any): VegaLiteLayer | null {
  if (!group.style.backgroundColor) return null;
  
  return {
    data: { values: group.data },
    mark: {
      type: 'rect',
      fill: group.style.backgroundColor,
      stroke: null
    },
    encoding: {
      x: { field: 'x', type: 'quantitative', axis: null },
      y: { field: 'y', type: 'quantitative', axis: null },
      width: { field: 'width', type: 'quantitative' },
      height: { field: 'height', type: 'quantitative' }
    }
  };
}

private createLayers(styleGroups: Record<string, StyleGroup>, bounds: any, options: any): any[] {
  const layers: any[] = [];
  
  Object.values(styleGroups).forEach(group => {
    // Add background layer first (behind text)
    const backgroundLayer = this.createBackgroundLayer(group, bounds);
    if (backgroundLayer) {
      layers.push(backgroundLayer);
    }
    
    // Add text layer
    layers.push(this.createLayer(group, bounds, options));
    
    // Add decoration layers
    if (group.style.textDecoration === 'underline') {
      layers.push(this.createUnderlineLayer(group, bounds, options));
    }
  });
  
  return layers;
}
```

## Custom Layout Engine

### Extending TextLayoutEngine

```typescript
import { TextLayoutEngine } from './layout';

export class CustomLayoutEngine extends TextLayoutEngine {
  constructor(options: HTMLToVegaLiteOptions = {}) {
    super(options);
  }

  // Override positioning logic
  public layoutSegments(segments: TextSegment[], maxWidth?: number): PositionedTextSegment[] {
    const positioned: PositionedTextSegment[] = [];
    let currentX = this.startX;
    let currentY = this.startY;
    let lineHeight = this.lineHeight;

    for (const segment of segments) {
      const measurement = this.measureText(segment.text, segment);
      
      // Custom logic: Center-align text
      const centeredX = (maxWidth || 400) / 2 - measurement.width / 2;
      
      positioned.push({
        ...segment,
        x: centeredX,
        y: currentY,
        width: measurement.width,
        height: measurement.height
      });

      // Move to next line
      currentY += lineHeight;
    }

    return positioned;
  }
}

// Usage
const customConverter = new HTMLToVegaLite();
// Replace the layout engine (you'd need to expose this in the main class)
```

### Adding Layout Engine Support

**Modify HTMLToVegaLite**: `src/index.ts`

```typescript
export class HTMLToVegaLite {
  private layoutEngine: TextLayoutEngine;
  
  constructor(options: HTMLToVegaLiteOptions = {}, customLayoutEngine?: TextLayoutEngine) {
    // ... existing initialization ...
    
    this.layoutEngine = customLayoutEngine || new TextLayoutEngine(this.options);
  }
  
  // Add method to replace layout engine
  public setLayoutEngine(layoutEngine: TextLayoutEngine): void {
    this.layoutEngine = layoutEngine;
  }
}
```

## Custom Vega-Lite Generation

### Custom Generator

```typescript
import { VegaLiteGenerator } from './vega-generator';

export class CustomVegaLiteGenerator extends VegaLiteGenerator {
  constructor(options: HTMLToVegaLiteOptions = {}) {
    super(options);
  }

  // Override spec generation to add custom features
  public generateSpec(
    segments: PositionedTextSegment[], 
    bounds: { width: number; height: number },
    options: Partial<HTMLToVegaLiteOptions> = {}
  ): VegaLiteSpec {
    const baseSpec = super.generateSpec(segments, bounds, options);
    
    // Add custom interactions
    baseSpec.selection = {
      highlight: {
        type: 'single',
        on: 'mouseover',
        empty: 'all'
      }
    };
    
    // Modify layers to support highlighting
    baseSpec.layer = baseSpec.layer.map(layer => ({
      ...layer,
      mark: {
        ...layer.mark,
        opacity: {
          condition: { selection: 'highlight', value: 1.0 },
          value: 0.7
        }
      }
    }));
    
    return baseSpec;
  }
}
```

## Testing Extensions

### Strategy Testing Template

```typescript
// tests/custom-strategy.test.ts
import { CustomStrategy } from '../src/strategies/implementations/custom-strategy';
import { TextStyle } from '../src/types';

describe('CustomStrategy', () => {
  let strategy: CustomStrategy;

  beforeEach(() => {
    strategy = new CustomStrategy();
  });

  describe('getTagNames', () => {
    it('should return correct tag names', () => {
      expect(strategy.getTagNames()).toEqual(['expected', 'tags']);
    });
  });

  describe('applyStyle', () => {
    it('should apply expected styling', () => {
      const currentStyle: TextStyle = {
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000'
      };

      const result = strategy.applyStyle(currentStyle, 'attributes');
      
      // Test specific style changes
      expect(result.color).toBe('expected-color');
      // Test that other properties are preserved
      expect(result.fontWeight).toBe('normal');
    });
    
    it('should handle complex attributes', () => {
      const currentStyle: TextStyle = {
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000'
      };

      const result = strategy.applyStyle(currentStyle, 'complex="value" other="value2"');
      // Test attribute parsing
    });
  });

  describe('validateAttributes', () => {
    it('should accept valid attributes', () => {
      const validation = strategy.validateAttributes('valid="attribute"');
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid attributes', () => {
      const validation = strategy.validateAttributes('invalid="value"');
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Expected error message');
    });
  });
});
```

### Integration Testing

```typescript
// tests/extension-integration.test.ts
import { HTMLToVegaLite } from '../src/index';
import { CustomStrategy } from '../src/strategies/implementations/custom-strategy';

describe('Extension Integration', () => {
  let converter: HTMLToVegaLite;

  beforeEach(() => {
    converter = new HTMLToVegaLite();
    converter.registerTagStrategy(new CustomStrategy());
  });

  it('should use custom strategy in conversion', () => {
    const html = '<customtag>Test content</customtag>';
    const spec = converter.convert(html);
    
    // Verify the custom strategy was applied
    expect(spec.layer).toHaveLength(1);
    expect(spec.layer[0].mark.color).toBe('expected-color');
  });

  it('should handle custom strategy with other strategies', () => {
    const html = '<b><customtag>Bold custom</customtag></b>';
    const spec = converter.convert(html);
    
    // Should have combined styling
    const layer = spec.layer[0];
    expect(layer.mark.fontWeight).toBe('bold');
    expect(layer.mark.color).toBe('expected-color');
  });
});
```

## File Change Summary

When adding a new strategy, you'll typically need to modify these files:

### Required Changes

1. **Create Strategy Implementation**
   - `src/strategies/implementations/your-strategy.ts`

2. **Export Strategy**
   - `src/strategies/implementations/index.ts`

3. **Add Tests**
   - `tests/your-strategy.test.ts`
   - Update `tests/strategies.test.ts`

### Optional Changes

4. **Default Registry** (if strategy should be included by default)
   - `src/strategies/index.ts` - Update `createDefaultTagStrategyRegistry()`

5. **Type Extensions** (if adding new style properties)
   - `src/types.ts` - Extend `TextStyle` interface
   - `src/vega-generator.ts` - Update style grouping and layer creation

6. **Documentation**
   - `src/strategies/README.md` - Add strategy documentation
   - `docs/STRATEGIES.md` - Update strategy list

### Example Pull Request Structure

```
feat: Add CustomTagStrategy for <custom> tags

Files changed:
- src/strategies/implementations/custom-tag-strategy.ts (new)
- src/strategies/implementations/index.ts (export added)
- src/strategies/index.ts (added to default registry)
- tests/strategies.test.ts (tests added)
- tests/integration.test.ts (integration test added)
- docs/STRATEGIES.md (documentation updated)

Changes:
- Adds support for <custom> tags with color styling
- Includes attribute validation for color values
- Full test coverage for new functionality
```

## Best Practices

### Strategy Design

1. **Single Responsibility**: Each strategy should handle one type of styling concern
2. **Attribute Validation**: Always validate attributes when they're expected
3. **Graceful Degradation**: Handle malformed attributes gracefully
4. **Property Preservation**: Only modify the style properties you need to change

### Testing

1. **Unit Tests**: Test each method independently
2. **Integration Tests**: Test strategy within the full pipeline
3. **Edge Cases**: Test with malformed HTML and attributes
4. **Performance**: Test with large documents if applicable

### Documentation

1. **Clear Examples**: Provide code examples for usage
2. **Attribute Documentation**: Document all supported attributes
3. **Validation Rules**: Document what constitutes valid attributes

### Backward Compatibility

1. **Optional Features**: New features should not break existing functionality
2. **Default Behavior**: Preserve existing default behavior
3. **Migration Guide**: Provide migration instructions for breaking changes

---

For more information, see:
- [Strategy System Documentation](./STRATEGIES.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Testing Guide](./TESTING.md)
