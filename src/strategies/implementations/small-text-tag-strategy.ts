import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';

/**
 * Strategy for small text tags: <small>, <sub>, <sup>
 */
export class SmallTextTagStrategy extends BaseTagStrategy {
  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    return {
      ...currentStyle,
      color: '#6c757d' // Muted color for small text
      // We may further add fontSize support if needed:
      // fontSize: currentStyle.fontSize * 0.875 // smaller text
    };
  }

  public getTagNames(): string[] {
    return ['small', 'sub', 'sup'];
  }
}
