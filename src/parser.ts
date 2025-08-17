import { TextStyle, TextSegment, ParseResult } from './types';
import { TagStrategy, TagStrategyRegistry, createDefaultTagStrategyRegistry } from './strategies/index';
import { ListTagStrategy } from './strategies/implementations/list-tag-strategy';
import { SpacingAnalyzer } from './spacing-analyzer';

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
   * Check if we need a line break before this segment
   */
  private needsLineBreak(segments: TextSegment[]): boolean {
    if (segments.length === 0) return false;
    
    const lastSegment = segments[segments.length - 1];
    return lastSegment !== undefined && 
           lastSegment.text !== '\n' && 
           lastSegment.text.trim() !== '';
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
      // Reset list state for clean parsing
      ListTagStrategy.resetListState();
      
      // Enhanced regex pattern to capture more tag types
      const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/gi;
      const parts = html.split(tagPattern);
      
      let currentStyle: TextStyle = this.getDefaultStyle();
      const styleStack: TextStyle[] = [{ ...currentStyle }];
      let isInListItem = false;
      let listItemPrefixAdded = false;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (!part) continue;
        
        // Check if this is a tag
        if (i % 4 === 1) { // Closing tag indicator
          if (part === '/') {
            // Get the closing tag name
            const closingTagName = parts[i + 1]?.toLowerCase();
            
            // Handle list tag cleanup
            if (closingTagName && (closingTagName === 'ul' || closingTagName === 'ol')) {
              ListTagStrategy.handleClosingTag(closingTagName);
            }
            
            // Reset list item state when closing li tag
            if (closingTagName === 'li') {
              isInListItem = false;
              listItemPrefixAdded = false;
            }
            
            // Add line breaks after closing block-level tags
            if (closingTagName) {
              const isBlockElement = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol'].includes(closingTagName);
              
              if (isBlockElement) {
                // Check if there's more meaningful content coming after this element
                const remainingContent = parts.slice(i + 2).join('');
                const hasMoreContent = remainingContent.trim().length > 0;
                
                if (hasMoreContent) {
                  segments.push({
                    text: '\n',
                    ...currentStyle
                  });
                }
              }
            }
            
            // Pop style stack for closing tag
            if (styleStack.length > 1) {
              styleStack.pop();
              const prevStyle = styleStack[styleStack.length - 1];
              if (prevStyle) {
                // Restore all properties from previous style
                currentStyle = { ...prevStyle };
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
                // Special handling for list items - they need line breaks but also track state
                if (tagName === 'li') {
                  isInListItem = true;
                  listItemPrefixAdded = false;
                  
                  // Add line break before list item if needed
                  if (this.needsLineBreak(segments)) {
                    segments.push({
                      text: '\n',
                      ...currentStyle
                    });
                  }
                  
                  // Apply styling for list item
                  const newStyle = strategy.applyStyle(currentStyle, attributes, tagName);
                  styleStack.push(newStyle);
                  currentStyle = newStyle;
                } else if (tagName === 'ul' || tagName === 'ol') {
                  // Add line break before list container if needed
                  if (this.needsLineBreak(segments)) {
                    segments.push({
                      text: '\n',
                      ...currentStyle
                    });
                  }
                  
                  // Apply styling for list container
                  const newStyle = strategy.applyStyle(currentStyle, attributes, tagName);
                  styleStack.push(newStyle);
                  currentStyle = newStyle;
                } else if (tagName === 'p') {
                  // Add line break before paragraph if needed
                  if (this.needsLineBreak(segments)) {
                    segments.push({
                      text: '\n',
                      ...currentStyle
                    });
                  }
                  
                  // Apply styling for paragraph
                  const newStyle = strategy.applyStyle(currentStyle, attributes, tagName);
                  styleStack.push(newStyle);
                  currentStyle = newStyle;
                } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
                  // Add line break before heading if needed
                  if (this.needsLineBreak(segments)) {
                    segments.push({
                      text: '\n',
                      ...currentStyle
                    });
                  }
                  
                  // Apply styling for heading
                  const newStyle = strategy.applyStyle(currentStyle, attributes, tagName);
                  styleStack.push(newStyle);
                  currentStyle = newStyle;
                } else {
                  // Regular line break elements (like <br>)
                  segments.push({
                    text: '\n',
                    ...currentStyle
                  });
                }
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
            let textContent = part;
            
            // Add list item prefix if we're in a list item and haven't added it yet
            if (isInListItem && !listItemPrefixAdded) {
              const prefix = ListTagStrategy.getListItemPrefix('li');
              
              // Create separate segment for prefix with clean list item style (no inherited decorations)
              const prefixStyle = { ...currentStyle };
              prefixStyle.textDecoration = 'none'; // No text decoration for prefix
              prefixStyle.fontWeight = 'normal'; // No bold/font weight inheritance
              prefixStyle.fontStyle = 'normal'; // No italic inheritance
              prefixStyle.color = '#000000'; // Reset color to default black
              
              segments.push({
                text: prefix,
                ...prefixStyle,
                hasSpaceAfter: true, // Always add consistent space after prefix
                spacingContext: 'list-prefix' // Special context for consistent spacing
              });
              
              // Trim the content since prefix handles the spacing
              textContent = textContent.trimStart();
              listItemPrefixAdded = true;
            }
            
            // Create segment for the actual content with current style (including any text decoration)
            segments.push({
              text: textContent,
              ...currentStyle
            });
          }
        }
      }
      
              // Apply intelligent spacing analysis to segments
        const spacedSegments = SpacingAnalyzer.analyzeAndAssignSpacing(segments, html);
        
        const result: ParseResult = { 
          segments: spacedSegments,
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