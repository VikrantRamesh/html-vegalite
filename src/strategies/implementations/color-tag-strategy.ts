import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';

/**
 * Example custom strategy for color tags like <red>, <green>, <blue>
 */
export class ColorTagStrategy extends BaseTagStrategy {
  private colorMap: Record<string, string> = {
    'red': '#FF0000',
    'green': '#00FF00',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    // TODO Add more colors as needed
  };

  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    const color = this.colorMap[tagName || ''];
    
    return {
      ...currentStyle,
      color: color || currentStyle.color
    };
  }

  public getTagNames(): string[] {
    return Object.keys(this.colorMap);
  }
}
