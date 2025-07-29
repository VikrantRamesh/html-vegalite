import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';

/**
 * Strategy for underline tags: <u>
 */
export class UnderlineTagStrategy extends BaseTagStrategy {
  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    return {
      ...currentStyle,
      textDecoration: 'underline'
    };
  }

  public getTagNames(): string[] {
    return ['u'];
  }
}
