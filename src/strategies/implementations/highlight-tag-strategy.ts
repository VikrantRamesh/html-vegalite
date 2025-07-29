import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';

/**
 * Strategy for highlight tags: <mark>
 */
export class HighlightTagStrategy extends BaseTagStrategy {
  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    return {
      ...currentStyle,
      color: '#212529' // Highlight text color
      // We may further add below properties if needed:
      // backgroundColor: '#ffff00',
      // padding: '0.125rem'
    };
  }

  public getTagNames(): string[] {
    return ['mark'];
  }
}
