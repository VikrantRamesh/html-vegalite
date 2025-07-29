import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';

/**
 * Strategy for heading tags: <h1>, <h2>, <h3>, <h4>, <h5>, <h6>
 */
export class HeadingTagStrategy extends BaseTagStrategy {
  private headingSizes: Record<string, number> = {
    'h1': 32,
    'h2': 24,
    'h3': 18.72,
    'h4': 16,
    'h5': 13.28,
    'h6': 10.72
  };

  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    // Extract tag name from the attributes or context
    const fontSize = tagName ? this.headingSizes[tagName.toLowerCase()] || 16 : (currentStyle.fontSize || 16);
    
    return {
      ...currentStyle,
      fontWeight: 'bold',
      fontSize: fontSize
    };
  }

  public getTagNames(): string[] {
    return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  }

  /**
   * Get font size for a specific heading level
   */
  public getFontSize(tagName: string): number {
    return this.headingSizes[tagName.toLowerCase()] || 16;
  }
}
