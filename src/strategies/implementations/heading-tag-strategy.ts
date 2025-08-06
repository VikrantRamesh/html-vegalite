import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';
import { headingSizes } from '../../constants';

/**
 * Strategy for heading tags: <h1>, <h2>, <h3>, <h4>, <h5>, <h6>
 */
export class HeadingTagStrategy extends BaseTagStrategy {

  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    // Extract tag name from the attributes or context
    const fontSize = tagName ? headingSizes[tagName.toLowerCase()] || 16 : (currentStyle.fontSize || 16);
    
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
    return headingSizes[tagName.toLowerCase()] || 16;
  }
}
