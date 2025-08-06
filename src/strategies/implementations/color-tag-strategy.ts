import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';
import { colorMap } from '../../constants';

/**
 * Example custom strategy for color tags like <red>, <green>, <blue>
 */
export class ColorTagStrategy extends BaseTagStrategy {

  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    const color = colorMap[tagName || ''];
    
    return {
      ...currentStyle,
      color: color || currentStyle.color
    };
  }

  public getTagNames(): string[] {
    return Object.keys(colorMap);
  }
}
