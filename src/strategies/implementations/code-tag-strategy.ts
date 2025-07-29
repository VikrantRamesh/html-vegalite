import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';

/**
 * Strategy for code tags: <code>, <pre>, <kbd>, <samp>
 */
export class CodeTagStrategy extends BaseTagStrategy {
  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    return {
      ...currentStyle,
      // For now, we'll use a different color to indicate code
      color: '#d63384' // Bootstrap's code color
      // In a real implementation, we might also add:
      // fontFamily: 'monospace',
      // backgroundColor: '#f8f9fa',
      // padding: '0.125rem 0.25rem',
      // borderRadius: '0.25rem'
    };
  }

  public getTagNames(): string[] {
    return ['code', 'pre', 'kbd', 'samp'];
  }
}
