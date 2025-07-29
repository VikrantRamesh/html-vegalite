import { TextStyle } from '../../types';
import { TagStrategy } from './tag-strategy.interface';

/**
 * Abstract base class implementing common tag strategy functionality
 */
export abstract class BaseTagStrategy implements TagStrategy {
  abstract applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle;
  abstract getTagNames(): string[];
  
  public validateAttributes(attributes: string): { isValid: boolean; errors: string[] } {
    // Default implementation - no validation
    // TODO will add in further implementations
    return { isValid: true, errors: [] };
  }
  
  public isLineBreak(): boolean {
    // Default implementation - most tags are not line breaks
    return false;
  }
}
