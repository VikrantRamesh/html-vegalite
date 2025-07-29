import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';

/**
 * Strategy for line break tags: <br>
 */
export class LineBreakTagStrategy extends BaseTagStrategy {
  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    // Line breaks don't change text styling, but we need to signal a line break
    return {
      ...currentStyle
    };
  }

  public getTagNames(): string[] {
    return ['br'];
  }

  /**
   * Line break tags are self-closing and should insert a line break character
   */
  public isLineBreak(): boolean {
    return true;
  }
}
