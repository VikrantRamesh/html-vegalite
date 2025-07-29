import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';

/**
 * Example of custom strategy for strike-through text
 */
export class StrikethroughTagStrategy extends BaseTagStrategy {
  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    return {
      ...currentStyle,
      textDecoration: 'line-through' as any, // Would need to extend TextStyle type
      color: '#6c757d' // Muted color
    };
  }

  public getTagNames(): string[] {
    return ['s', 'strike', 'del'];
  }
}
