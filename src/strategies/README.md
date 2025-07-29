# Tag Strategies Documentation

## Overview

The tag strategies system provides an extensible way to handle HTML tag parsing and styling. The system uses the Strategy Pattern to allow for flexible and modular tag handling.

## Directory Structure

```
src/strategies/
├── index.ts                    # Main export file
├── interfaces/                 # Interfaces and base classes
│   ├── index.ts
│   ├── tag-strategy.interface.ts
│   └── base-tag-strategy.ts
├── implementations/            # Strategy implementations
│   ├── index.ts
│   ├── bold-tag-strategy.ts
│   ├── italic-tag-strategy.ts
│   ├── underline-tag-strategy.ts
│   ├── span-tag-strategy.ts
│   ├── heading-tag-strategy.ts
│   ├── paragraph-tag-strategy.ts
│   ├── hyperlink-tag-strategy.ts
│   ├── line-break-tag-strategy.ts
│   ├── code-tag-strategy.ts
│   ├── small-text-tag-strategy.ts
│   ├── highlight-tag-strategy.ts
│   ├── strikethrough-tag-strategy.ts
│   └── color-tag-strategy.ts
└── registry/                   # Strategy registry
    ├── index.ts
    └── tag-strategy-registry.ts
```

## Core Interfaces

### TagStrategy Interface

All tag strategies must implement the `TagStrategy` interface:

```typescript
interface TagStrategy {
  applyStyle(currentStyle: TextStyle, attributes: string): TextStyle;
  getTagNames(): string[];
  validateAttributes?(attributes: string): { isValid: boolean; errors: string[] };
}
```

### BaseTagStrategy Class

The `BaseTagStrategy` abstract class provides a default implementation of `validateAttributes`:

```typescript
abstract class BaseTagStrategy implements TagStrategy {
  abstract applyStyle(currentStyle: TextStyle, attributes: string): TextStyle;
  abstract getTagNames(): string[];
  
  public validateAttributes(attributes: string): { isValid: boolean; errors: string[] } {
    return { isValid: true, errors: [] };
  }
}
```

## Available Strategies

### Core Text Formatting
- **BoldTagStrategy**: Handles `<b>`, `<strong>` tags
- **ItalicTagStrategy**: Handles `<i>`, `<em>` tags
- **UnderlineTagStrategy**: Handles `<u>` tags
- **SpanTagStrategy**: Handles `<span>` tags with style attributes

### HTML Structure
- **HeadingTagStrategy**: Handles `<h1>` through `<h6>` tags
- **ParagraphTagStrategy**: Handles `<p>` tags
- **HyperlinkTagStrategy**: Handles `<a>` tags with href validation
- **LineBreakTagStrategy**: Handles `<br>` tags

### Additional Text Formatting
- **CodeTagStrategy**: Handles `<code>`, `<pre>`, `<kbd>`, `<samp>` tags
- **SmallTextTagStrategy**: Handles `<small>`, `<sub>`, `<sup>` tags
- **HighlightTagStrategy**: Handles `<mark>` tags

### Custom/Example Strategies
- **StrikethroughTagStrategy**: Handles `<s>`, `<strike>`, `<del>` tags
- **ColorTagStrategy**: Handles custom color shortcut tags (`<red>`, `<blue>`, etc.)

## Usage

### Basic Usage

```typescript
import { createDefaultTagStrategyRegistry, HTMLParser } from './strategies';

// Create parser with default strategies
const parser = new HTMLParser();

// Parse HTML
const result = parser.parseHTML('<b>Bold text</b> and <i>italic text</i>');
```

### Custom Strategy Registration

```typescript
import { 
  HTMLParser, 
  createMinimalTagStrategyRegistry,
  StrikethroughTagStrategy 
} from './strategies';

// Create parser with minimal strategies
const registry = createMinimalTagStrategyRegistry();
registry.registerStrategy(new StrikethroughTagStrategy());

const parser = new HTMLParser();
parser.getStrategyRegistry().registerStrategy(new StrikethroughTagStrategy());
```

### Creating Custom Strategies

```typescript
import { BaseTagStrategy, TextStyle } from './strategies';

class CustomTagStrategy extends BaseTagStrategy {
  public applyStyle(currentStyle: TextStyle, attributes: string): TextStyle {
    return {
      ...currentStyle,
      color: '#custom-color'
    };
  }

  public getTagNames(): string[] {
    return ['custom'];
  }

  public validateAttributes(attributes: string): { isValid: boolean; errors: string[] } {
    // Custom validation logic
    return { isValid: true, errors: [] };
  }
}
```

## Registry Management

### TagStrategyRegistry

The registry manages all tag strategies:

```typescript
import { TagStrategyRegistry, BoldTagStrategy } from './strategies';

const registry = new TagStrategyRegistry();

// Register a strategy
registry.registerStrategy(new BoldTagStrategy());

// Check if a tag is supported
const isSupported = registry.isSupported('b'); // true

// Get a strategy
const strategy = registry.getStrategy('b');

// Get all supported tags
const supportedTags = registry.getSupportedTags();

// Remove a strategy
registry.removeStrategy('b');

// Clear all strategies
registry.clearStrategies();
```

### Factory Functions

Two factory functions are provided for convenience:

```typescript
import { 
  createDefaultTagStrategyRegistry, 
  createMinimalTagStrategyRegistry 
} from './strategies';

// Full registry with all default strategies
const fullRegistry = createDefaultTagStrategyRegistry();

// Minimal registry with only basic formatting
const minimalRegistry = createMinimalTagStrategyRegistry();
```

## Extending the System

### Adding New Properties to TextStyle

If you need additional styling properties, extend the `TextStyle` interface in `types.ts`:

```typescript
interface TextStyle {
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: string;
  textDecoration?: 'none' | 'underline';
  fontSize?: number;        // New property
  fontFamily?: string;      // New property
  backgroundColor?: string; // New property
}
```

### Creating Strategy Collections

You can create collections of related strategies:

```typescript
// semantic-strategies.ts
export function createSemanticStrategies(): TagStrategy[] {
  return [
    new BoldTagStrategy(),
    new ItalicTagStrategy(),
    new CodeTagStrategy(),
    new HighlightTagStrategy()
  ];
}
```

## Testing

Each strategy should be tested independently:

```typescript
import { BoldTagStrategy } from './strategies';

const strategy = new BoldTagStrategy();
const result = strategy.applyStyle(
  { fontWeight: 'normal', fontStyle: 'normal', color: '#000' },
  ''
);

expect(result.fontWeight).toBe('bold');
```
