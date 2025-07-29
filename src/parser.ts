import { TextStyle, TextSegment, ParseResult } from './types';
import { TagStrategy, TagStrategyRegistry, createDefaultTagStrategyRegistry } from './strategies/index';

/**
 * HTML Parser with extensible tag strategy system
 */
export class HTMLParser {
  private strategyRegistry: TagStrategyRegistry;

  constructor(customStrategies: TagStrategy[] = []) {
    this.strategyRegistry = createDefaultTagStrategyRegistry();
    
    // Register any custom strategies
    for (const strategy of customStrategies) {
      this.strategyRegistry.registerStrategy(strategy);
    }
  }

  /**
   * Parse HTML string into text segments with styling information
   * Uses strategy pattern for extensible tag handling
   */
  public parseHTML(html: string): ParseResult {
    const segments: TextSegment[] = [];
    const errors: string[] = [];
    
    // First, validate the HTML structure
    const validation = this.validateHTML(html);
    if (!validation.isValid) {
      errors.push(...validation.errors);
    }
    
    try {
      // Enhanced regex pattern to capture more tag types
      const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/gi;
      const parts = html.split(tagPattern);
      
      let currentStyle: TextStyle = this.getDefaultStyle();
      const styleStack: TextStyle[] = [{ ...currentStyle }];
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (!part) continue;
        
        // Check if this is a tag
        if (i % 4 === 1) { // Closing tag indicator
          if (part === '/') {
            // Pop style stack for closing tag
            if (styleStack.length > 1) {
              styleStack.pop();
              const prevStyle = styleStack[styleStack.length - 1];
              if (prevStyle) {
                currentStyle = {
                  fontWeight: prevStyle.fontWeight,
                  fontStyle: prevStyle.fontStyle,
                  color: prevStyle.color,
                  textDecoration: prevStyle.textDecoration ?? 'none'
                };
              }
            }
          }
        } else if (i % 4 === 2) { // Tag name
          if (parts[i - 1] !== '/') { // Opening tag
            const tagName = part.toLowerCase();
            const attributes = parts[i + 1] || '';
            
            const strategy = this.strategyRegistry.getStrategy(tagName);
            
            if (strategy) {
              // Validate attributes if strategy supports it
              if (strategy.validateAttributes) {
                const validation = strategy.validateAttributes(attributes);
                if (!validation.isValid) {
                  errors.push(...validation.errors);
                }
              }
              
              // Check if this is a line break strategy
              if (strategy.isLineBreak && strategy.isLineBreak()) {
                // Insert a newline character for line breaks
                segments.push({
                  text: '\n',
                  ...currentStyle
                });
              } else {
                // Apply styling using strategy
                const newStyle = strategy.applyStyle(currentStyle, attributes, tagName);
                styleStack.push(newStyle);
                currentStyle = newStyle;
              }
            } else {
              errors.push(`Unsupported tag: ${tagName}`);
              // Continue with current style for unsupported tags
            }
          }
        } else if (i % 4 === 0) { // Text content
          if (part.trim()) {
            segments.push({
              text: part,
              ...currentStyle
            });
          }
        }
      }
      
      const result: ParseResult = { 
        segments,
        errors: errors.length > 0 ? errors : []
      };
      return result;
      
    } catch (error) {
      return {
        segments: [{
          text: html,
          ...this.getDefaultStyle()
        }],
        errors: [`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Register a custom tag strategy
   */
  public registerTagStrategy(strategy: TagStrategy): void {
    this.strategyRegistry.registerStrategy(strategy);
  }

  /**
   * Remove a tag strategy
   */
  public removeTagStrategy(tagName: string): boolean {
    return this.strategyRegistry.removeStrategy(tagName);
  }

  /**
   * Get all supported tags
   */
  public getSupportedTags(): string[] {
    return this.strategyRegistry.getSupportedTags();
  }

  /**
   * Check if a tag is supported
   */
  public isTagSupported(tagName: string): boolean {
    return this.strategyRegistry.isSupported(tagName);
  }

  /**
   * Get default text style
   */
  private getDefaultStyle(): TextStyle {
    return {
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      textDecoration: 'none'
      // fontSize is optional and will be set by strategies when needed
    };
  }

  /**
   * Validate HTML input with enhanced validation
   */
  public validateHTML(html: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for basic structure issues
    if (!html || typeof html !== 'string') {
      errors.push('Input must be a non-empty string');
      return { isValid: false, errors };
    }
    
    // Check for unclosed tags
    const openTags: string[] = [];
    const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    let match;
    
    while ((match = tagPattern.exec(html)) !== null) {
      const isClosing = match[1] === '/';
      const tagName = match[2]?.toLowerCase();
      
      if (!tagName) continue;
      
      if (isClosing) {
        if (openTags.length === 0 || openTags[openTags.length - 1] !== tagName) {
          errors.push(`Mismatched closing tag: </${tagName}>`);
        } else {
          openTags.pop();
        }
      } else {
        // Self-closing tags don't need to be tracked
        if (!this.isSelfClosingTag(tagName)) {
          openTags.push(tagName);
        }
        
        // Check if tag is supported
        if (!this.strategyRegistry.isSupported(tagName)) {
          errors.push(`Unsupported tag: ${tagName}`);
        }
      }
    }
    
    if (openTags.length > 0) {
      errors.push(`Unclosed tags: ${openTags.join(', ')}`);
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Check if a tag is self-closing
   */
  private isSelfClosingTag(tagName: string): boolean {
    const selfClosingTags = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);
    return selfClosingTags.has(tagName.toLowerCase());
  }

  /**
   * Parse HTML with detailed information for debugging
   */
  public parseWithDetails(html: string): {
    segments: TextSegment[];
    errors: string[];
    warnings: string[];
    supportedTags: string[];
    usedTags: string[];
  } {
    const result = this.parseHTML(html);
    const usedTags = this.extractUsedTags(html);
    
    return {
      segments: result.segments,
      errors: result.errors || [],
      warnings: [], // Could add warnings for deprecated tags, etc.
      supportedTags: this.getSupportedTags(),
      usedTags
    };
  }

  /**
   * Extract all tags used in HTML
   */
  private extractUsedTags(html: string): string[] {
    const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    const tags = new Set<string>();
    let match;
    
    while ((match = tagPattern.exec(html)) !== null) {
      const tagName = match[1]?.toLowerCase();
      if (tagName) {
        tags.add(tagName);
      }
    }
    
    return Array.from(tags);
  }

  /**
   * Get strategy registry (for advanced usage)
   */
  public getStrategyRegistry(): TagStrategyRegistry {
    return this.strategyRegistry;
  }
}