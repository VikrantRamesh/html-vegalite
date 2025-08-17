import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';

/**
 * Strategy for HTML list tags: <ul>, <ol>, <li>
 * 
 * Handles:
 * - <ul>: Unordered list container
 * - <ol>: Ordered list container  
 * - <li>: List item with bullet/number prefix
 * 
 * Note: Since strategies are stateless and the parser processes tags sequentially,
 * we use a simplified approach for list item prefixes. For more advanced numbering,
 * preprocessing the HTML would be needed.
 */
export class ListTagStrategy extends BaseTagStrategy {
  // Static counters for simple ordered list numbering
  // Note: This is a simplified approach for demonstration
  private static listCounters: Map<string, number> = new Map();
  private static listStack: string[] = []; // Track nested list types

  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    const style = { ...currentStyle };
    
    switch (tagName?.toLowerCase()) {
      case 'ul':
        // Unordered list container - push to stack
        ListTagStrategy.listStack.push('ul');
        break;
      case 'ol':
        // Ordered list container - push to stack and reset counter
        ListTagStrategy.listStack.push('ol');
        const olKey = `ol-${ListTagStrategy.listStack.length}`;
        ListTagStrategy.listCounters.set(olKey, 0);
        break;
      case 'li':
        // List item - determine prefix based on parent list type
        const parentListType = ListTagStrategy.listStack[ListTagStrategy.listStack.length - 1];
        if (parentListType === 'ol') {
          // Ordered list item - increment counter and add number
          const olKey = `ol-${ListTagStrategy.listStack.length}`;
          const currentCount = (ListTagStrategy.listCounters.get(olKey) || 0) + 1;
          ListTagStrategy.listCounters.set(olKey, currentCount);
        }
        
        // Set list context properties for layout engine
        style.isListItem = true;
        style.listNestingLevel = ListTagStrategy.listStack.length;
        style.listType = parentListType as 'ul' | 'ol';
        break;
    }
    
    return style;
  }

  public getTagNames(): string[] {
    return ['ul', 'ol', 'li'];
  }

  /**
   * All list-related tags create line breaks for proper formatting
   */
  public isLineBreak(): boolean {
    return true;
  }

  /**
   * Get the appropriate prefix for a list item
   * This is a utility method that can be used by the parser
   */
  public static getListItemPrefix(tagName: string): string {
    if (tagName?.toLowerCase() === 'li') {
      const parentListType = ListTagStrategy.listStack[ListTagStrategy.listStack.length - 1];
      if (parentListType === 'ol') {
        const olKey = `ol-${ListTagStrategy.listStack.length}`;
        const currentCount = ListTagStrategy.listCounters.get(olKey) || 1;
        return `${currentCount}. `;
      } else if (parentListType === 'ul') {
        return '• ';
      }
    }
    return '';
  }

  /**
   * Clean up list state when closing list containers
   * This should be called by the parser when closing ul/ol tags
   */
  public static handleClosingTag(tagName: string): void {
    const tag = tagName?.toLowerCase();
    if (tag === 'ul' || tag === 'ol') {
      if (tag === 'ol') {
        const olKey = `ol-${ListTagStrategy.listStack.length}`;
        ListTagStrategy.listCounters.delete(olKey);
      }
      ListTagStrategy.listStack.pop();
    }
  }

  /**
   * Reset all list state - useful for testing or new document processing
   */
  public static resetListState(): void {
    ListTagStrategy.listCounters.clear();
    ListTagStrategy.listStack = [];
  }

  /**
   * Get current list context for debugging/testing
   */
  public static getListContext(): { stack: string[], counters: Map<string, number> } {
    return {
      stack: [...ListTagStrategy.listStack],
      counters: new Map(ListTagStrategy.listCounters)
    };
  }

  public validateAttributes(attributes: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic validation - list tags generally don't require specific attributes
    // but we should allow common HTML attributes like class, id, style
    if (attributes.trim()) {
      // Allow common attributes, just validate basic structure
      const validAttributePattern = /^(\s*(class|id|style|type|start)\s*=\s*["'][^"']*["']\s*)*$/i;
      if (!validAttributePattern.test(attributes.trim())) {
        errors.push('Invalid or unsupported attributes for list tag');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
