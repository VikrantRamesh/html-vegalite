import { TextStyle } from '../../types';
import { BaseTagStrategy } from '../interfaces/base-tag-strategy';

/**
 * Strategy for span tags with style attributes: <span style="...">
 */
export class SpanTagStrategy extends BaseTagStrategy {
  public applyStyle(currentStyle: TextStyle, attributes: string, tagName?: string): TextStyle {
    const newStyle = { ...currentStyle };
    
    const styleMatch = attributes.match(/style=['"](.*?)['"]/);
    if (!styleMatch || !styleMatch[1]) return newStyle;
    
    const styleStr = styleMatch[1];
    
    // Parse individual CSS properties
    this.parseColor(styleStr, newStyle);
    this.parseFontWeight(styleStr, newStyle);
    this.parseFontStyle(styleStr, newStyle);
    this.parseTextDecoration(styleStr, newStyle);
    
    return newStyle;
  }

  public getTagNames(): string[] {
    return ['span'];
  }

  public validateAttributes(attributes: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const styleMatch = attributes.match(/style=['"](.*?)['"]/);
    if (!styleMatch || !styleMatch[1]) {
      return { isValid: true, errors: [] }; // No style attribute is valid
    }
    
    const styleStr = styleMatch[1];
    
    // Validate CSS syntax (basic)
    const cssPropertyPattern = /([a-zA-Z-]+)\s*:\s*([^;]+)/g;
    let match;
    const validProperties = new Set(['color', 'font-weight', 'font-style', 'text-decoration']);
    
    while ((match = cssPropertyPattern.exec(styleStr)) !== null) {
      if (!match[1] || !match[2]) continue;
      
      const property = match[1].trim();
      const value = match[2].trim();
      
      if (!validProperties.has(property)) {
        errors.push(`Unsupported CSS property: ${property}`);
      }
      
      // Validate specific property values
      if (property === 'font-weight' && !['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'].includes(value)) {
        errors.push(`Invalid font-weight value: ${value}`);
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  private parseColor(styleStr: string, style: TextStyle): void {
    const colorMatch = styleStr.match(/color:\s*([^;]+)/);
    if (colorMatch && colorMatch[1]) {
      style.color = colorMatch[1].trim();
    }
  }

  private parseFontWeight(styleStr: string, style: TextStyle): void {
    const fontWeightMatch = styleStr.match(/font-weight:\s*([^;]+)/);
    if (fontWeightMatch && fontWeightMatch[1]) {
      const weight = fontWeightMatch[1].trim();
      if (weight === 'bold' || parseInt(weight) >= 600) {
        style.fontWeight = 'bold';
      } else {
        style.fontWeight = 'normal';
      }
    }
  }

  private parseFontStyle(styleStr: string, style: TextStyle): void {
    const fontStyleMatch = styleStr.match(/font-style:\s*([^;]+)/);
    if (fontStyleMatch && fontStyleMatch[1]) {
      const fontStyle = fontStyleMatch[1].trim();
      if (fontStyle === 'italic' || fontStyle === 'oblique') {
        style.fontStyle = 'italic';
      } else {
        style.fontStyle = 'normal';
      }
    }
  }

  private parseTextDecoration(styleStr: string, style: TextStyle): void {
    const textDecorationMatch = styleStr.match(/text-decoration:\s*([^;]+)/);
    if (textDecorationMatch && textDecorationMatch[1]) {
      const decoration = textDecorationMatch[1].trim();
      if (decoration.includes('underline')) {
        style.textDecoration = 'underline';
      } else {
        style.textDecoration = 'none';
      }
    }
  }
}
