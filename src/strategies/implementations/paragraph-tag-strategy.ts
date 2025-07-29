import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';

/**
 * Strategy for paragraph tags: <p>
 */
export class ParagraphTagStrategy extends BaseTagStrategy {
  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    // Paragraphs typically maintain current styling but could add spacing
    // For now, we'll just return the current style unchanged
    return {
      ...currentStyle
      // We may further add margin/padding properties if needed
      // marginTop: '1em',
      // marginBottom: '1em'
    };
  }

  public getTagNames(): string[] {
    return ['p'];
  }
}
