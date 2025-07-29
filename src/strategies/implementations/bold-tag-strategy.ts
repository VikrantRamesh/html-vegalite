import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';

/**
 * Strategy for bold tags: <b>, <strong>
 */
export class BoldTagStrategy extends BaseTagStrategy {
  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    return {
      ...currentStyle,
      fontWeight: 'bold'
    };
  }

  public getTagNames(): string[] {
    return ['b', 'strong'];
  }
}
