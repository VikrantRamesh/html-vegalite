import { TextStyle, TextSegment, PositionedTextSegment, TextMeasurement, HTMLToVegaLiteOptions } from './types';
import { colorMap, inverseHeadingSizes } from './constants';

/**
 * Text layout engine that positions text segments
 */
export class TextLayoutEngine {
  private fontSize: number;
  private fontFamily: string;
  private startX: number;
  private startY: number;
  private lineHeight: number;
  private canvasContext: CanvasRenderingContext2D | null = null;

  constructor(options: HTMLToVegaLiteOptions = {}) {
    this.fontSize = options.fontSize ?? 14;
    this.fontFamily = options.fontFamily ?? 'Arial, sans-serif';
    this.startX = options.startX ?? 10;
    this.startY = options.startY ?? 30;
    this.lineHeight = options.lineHeight ?? this.fontSize * 1.4;
    
    this.initializeCanvas();
  }

  /**
   * Initialize canvas for text measurement
   */
  private initializeCanvas(): void {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      this.canvasContext = canvas.getContext('2d');
    }
  }

  /**
   * Measure text dimensions using canvas API or fallback
   */
  public measureText(text: string, style: TextStyle): TextMeasurement {
    if (this.canvasContext) {
      return this.measureTextWithCanvas(text, style);
    } else {
      return this.measureTextFallback(text, style);
    }
  }

  /**
   * Measure text using canvas API (browser environment)
   */
  private measureTextWithCanvas(text: string, style: TextStyle): TextMeasurement {
    if (!this.canvasContext) {
      return this.measureTextFallback(text, style);
    }

    const weight = style.fontWeight === 'bold' ? 'bold' : 'normal';
    const fontStyle = style.fontStyle === 'italic' ? 'italic' : 'normal';
    const fontSize = style.fontSize || this.fontSize;
    
    this.canvasContext.font = `${fontStyle} ${weight} ${fontSize}px ${this.fontFamily}`;
    
    const metrics = this.canvasContext.measureText(text);
    
    return {
      width: metrics.width,
      height: fontSize
    };
  }

  /**
   * Fallback text measurement (server-side or when canvas unavailable)
   */
  private measureTextFallback(text: string, style: TextStyle): TextMeasurement {
    // Approximate character width based on font properties
    const fontSize = style.fontSize || this.fontSize;
    let charWidth = fontSize * 0.6; // Base character width
    
    // Adjust for bold text (wider)
    if (style.fontWeight === 'bold') {
      charWidth *= 1.15;
    }
    
    // Adjust for italic text (slightly wider due to slant)
    if (style.fontStyle === 'italic') {
      charWidth *= 1.05;
    }
    
    return {
      width: text.length * charWidth,
      height: fontSize
    };
  }

   /**
   * Check if a text segment is a heading style
   */
  private isHeadingStyle(segment: TextSegment, measurement: { height: number }): boolean {
    const size = measurement.height;

    return segment.fontWeight === 'bold' && inverseHeadingSizes[segment.fontSize ?? 0] !== undefined;
  }

  /**
   * Check if a text segment is unstyled (No HTML Tag applied)
   */
  private isUnstyledSegment(segment: TextSegment): boolean {
    const color = segment.color?.toLowerCase();

    return (
      segment.fontWeight === 'normal' &&
      segment.fontStyle === 'normal' &&
      segment.textDecoration === 'none' &&
      (!color || color === colorMap['black'])
    );
  }


  /**
   * Layout text segments with positioning and line wrapping
   */
  public layoutSegments(segments: TextSegment[], maxWidth?: number): PositionedTextSegment[] {
    const positioned: PositionedTextSegment[] = [];
    let currentX = this.startX;
    let currentY = this.startY;
    const wrapWidth = maxWidth ?? 400;

    for (const segment of segments) {
      // Handle explicit line breaks
      if (segment.text === '\n') {
        currentX = this.startX;
        currentY += this.lineHeight;
        continue;
      }
      
      // Check if this segment needs word wrapping
      const measurement = this.measureText(segment.text, segment);
      const segmentLineHeight = Math.max(this.lineHeight, measurement.height);

      const isHeading = this.isHeadingStyle(segment, measurement);

      // Add spacing before heading if not already at new line
      if (isHeading && currentX > this.startX) {
        currentX = this.startX;
        currentY += segmentLineHeight * 0.75;
      }
      
      if (measurement.width > wrapWidth && segment.text.includes(' ')) {
        // Word wrap this segment
        const words = segment.text.split(' ');
        let currentLine = '';
        
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          if (!word) continue; // Skip empty words
          
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testMeasurement = this.measureText(testLine, segment);
          
          if (testMeasurement.width > wrapWidth && currentLine) {
            // Add current line if it has content
            const lineMeasurement = this.measureText(currentLine, segment);
            positioned.push({
              ...segment,
              text: currentLine,
              x: currentX,
              y: currentY,
              width: lineMeasurement.width,
              height: lineMeasurement.height
            });
            currentX = this.startX;
            currentY += this.lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        // Add remaining text
        if (currentLine) {
          const lineMeasurement = this.measureText(currentLine, segment);
          positioned.push({
            ...segment,
            text: currentLine,
            x: currentX,
            y: currentY, // Keep as top-based for internal layout
            width: lineMeasurement.width,
            height: lineMeasurement.height
          });
          currentX += lineMeasurement.width;
        }
      } else {
        // Line wrapping logic for segments that don't need word wrapping
        if (currentX > this.startX && currentX + measurement.width > wrapWidth) {
          currentX = this.startX;
          currentY += segmentLineHeight;
        }

        const isUnstyled = this.isUnstyledSegment(segment);

        // Apply small offset for unstyled text (e.g., 2px)
        const offsetX = isUnstyled ? 2 : 0;

        positioned.push({
          ...segment,
          x: currentX + offsetX, 
          y: currentY + (segmentLineHeight - measurement.height), // Keep as top-based for internal layout
          width: measurement.width,
          height: measurement.height
        });

        currentX += measurement.width;
        const spaceMeasurement = this.measureText(' ', segment);
        currentX += spaceMeasurement.width;

        // Add vertical spacing after heading
        if (isHeading) {
          currentX = this.startX;
          currentY += segmentLineHeight * 1.2;
        }
      }
    }

    return positioned;
  }

  /**
   * Calculate bounding box for positioned segments
   */
  public calculateBounds(segments: PositionedTextSegment[]): { width: number; height: number } {
    if (segments.length === 0) {
      return { width: 0, height: 0 };
    }

    const maxX = Math.max(...segments.map(s => s.x + s.width));
    const maxY = Math.max(...segments.map(s => s.y + s.height));
    
    return {
      width: maxX + 20, // Add padding
      height: maxY + 10  // Add padding
    };
  }

  /**
   * Update layout options
   */
  public updateOptions(options: Partial<HTMLToVegaLiteOptions>): void {
    if (options.fontSize !== undefined) {
      this.fontSize = options.fontSize;
      this.lineHeight = options.lineHeight ?? this.fontSize * 1.4;
    }
    if (options.fontFamily !== undefined) {
      this.fontFamily = options.fontFamily;
    }
    if (options.startX !== undefined) {
      this.startX = options.startX;
    }
    if (options.startY !== undefined) {
      this.startY = options.startY;
    }
    if (options.lineHeight !== undefined) {
      this.lineHeight = options.lineHeight;
    }
  }

  /**
   * Get current layout options
   */
  public getOptions(): HTMLToVegaLiteOptions {
    return {
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      startX: this.startX,
      startY: this.startY,
      lineHeight: this.lineHeight
    };
  }
}