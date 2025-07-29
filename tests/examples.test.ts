import fs from 'fs';
import path from 'path';
import { HTMLToVegaLite } from '../src/index';

describe('Examples Integration Tests', () => {
  let converter: HTMLToVegaLite;

  beforeEach(() => {
    converter = new HTMLToVegaLite();
  });

  describe('Basic HTML Examples', () => {
    it('should handle simple bold text example', () => {
      const html = '<b>Bold text</b>';
      const spec = converter.convert(html);

      expect(spec).toHaveProperty('$schema');
      expect(spec.layer).toHaveLength(1);
      expect(spec.layer[0].data.values[0].text).toBe('Bold text');
      expect(spec.layer[0].mark.fontWeight).toBe('bold');
    });

    it('should handle mixed formatting example', () => {
      const html = '<b>Bold</b> and <i>italic</i> text';
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThanOrEqual(2);
      
      const boldLayer = spec.layer.find(layer => layer.mark.fontWeight === 'bold');
      const italicLayer = spec.layer.find(layer => layer.mark.fontStyle === 'italic');
      
      expect(boldLayer).toBeDefined();
      expect(italicLayer).toBeDefined();
    });

    it('should handle nested formatting example', () => {
      const html = '<b>Bold <i>and italic</i></b>';
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThan(0);
      
      // Should have segments with combined styles
      const boldItalicLayer = spec.layer.find(layer => 
        layer.mark.fontWeight === 'bold' && layer.mark.fontStyle === 'italic'
      );
      expect(boldItalicLayer).toBeDefined();
    });

    it('should handle span with color styling', () => {
      const html = '<span style="color: red; font-weight: bold">Red bold text</span>';
      const spec = converter.convert(html);

      expect(spec.layer).toHaveLength(1);
      expect(spec.layer[0].mark.color).toBe('red');
      expect(spec.layer[0].mark.fontWeight).toBe('bold');
    });
  });

  describe('HTML Structure Examples', () => {
    it('should handle heading tags', () => {
      const html = '<h1>Main Title</h1><h2>Subtitle</h2>';
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThan(0);
      
      // All heading layers should be bold
      const headingLayers = spec.layer.filter(layer => layer.mark.fontWeight === 'bold');
      expect(headingLayers.length).toBeGreaterThan(0);
    });

    it('should apply different font sizes to heading levels', () => {
      const html = '<h1>Big Title</h1><h2>Medium Title</h2><h3>Small Title</h3><p>Normal text</p>';
      const spec = converter.convert(html);

      expect(spec.layer.length).toBe(4); // Should have 4 layers for different styles
      
      // Check that we have different fontSize values
      const fontSizes = spec.layer.map(layer => layer.mark.fontSize);
      const uniqueFontSizes = [...new Set(fontSizes)];
      
      expect(uniqueFontSizes.length).toBeGreaterThan(1); // Should have at least 2 different sizes
      expect(fontSizes).toContain(32); // H1 should be 32px
      expect(fontSizes).toContain(24); // H2 should be 24px
      expect(fontSizes).toContain(18.72); // H3 should be 18.72px
    });

    it('should handle paragraph tags', () => {
      const html = '<p>This is a paragraph with normal text.</p>';
      const spec = converter.convert(html);

      expect(spec.layer).toHaveLength(1);
      expect(spec.layer[0].data.values[0].text).toBe('This is a paragraph with normal text.');
    });

    it('should handle hyperlinks', () => {
      const html = '<a href="https://example.com">Link text</a>';
      const spec = converter.convert(html);

      expect(spec.layer).toHaveLength(2); // Text layer + underline layer for link
      expect(spec.layer[0].data.values[0].text).toBe('Link text');
      expect(spec.layer[0].mark.color).toBe('#0066CC');
      expect(spec.layer[1].mark.type).toBe('rule'); // Underline decoration
    });

    it('should handle line breaks', () => {
      const html = 'Line 1<br>Line 2';
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThan(0);
      
      // Should have text segments with different Y positions
      const allValues = spec.layer.flatMap(layer => layer.data.values);
      const yPositions = allValues.map(v => v.y);
      const uniqueYs = [...new Set(yPositions)];
      expect(uniqueYs.length).toBeGreaterThan(1);
    });
  });

  describe('Technical Content Examples', () => {
    it('should handle code tags', () => {
      const html = 'Run <code>npm install</code> command';
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThan(1);
      
      // Should have a layer with code styling
      const codeLayer = spec.layer.find(layer => 
        layer.data.values.some(v => v.text === 'npm install')
      );
      expect(codeLayer).toBeDefined();
    });

    it('should handle keyboard input tags', () => {
      const html = 'Press <kbd>Ctrl+C</kbd> to copy';
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThan(1);
      
      const kbdLayer = spec.layer.find(layer => 
        layer.data.values.some(v => v.text === 'Ctrl+C')
      );
      expect(kbdLayer).toBeDefined();
    });

    it('should handle superscript and subscript', () => {
      const html = 'H<sub>2</sub>O and E=mc<sup>2</sup>';
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThan(1);
      
      // Should have segments for subscript and superscript
      const allValues = spec.layer.flatMap(layer => layer.data.values);
      const texts = allValues.map(v => v.text);
      expect(texts).toContain('2'); // From both sub and sup
    });

    it('should handle mark/highlight tags', () => {
      const html = '<mark>Important note</mark> here';
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThan(1);
      
      const highlightLayer = spec.layer.find(layer => 
        layer.data.values.some(v => v.text === 'Important note')
      );
      expect(highlightLayer).toBeDefined();
    });
  });

  describe('Custom Strategy Examples', () => {
    it('should handle strikethrough tags', () => {
      const html = '<s>Strike this</s> and <del>delete this</del>';
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThan(1);
      
      const allValues = spec.layer.flatMap(layer => layer.data.values);
      const texts = allValues.map(v => v.text);
      expect(texts).toContain('Strike this');
      expect(texts).toContain('delete this');
    });

    it('should handle color tags when ColorTagStrategy is registered', () => {
      const { ColorTagStrategy } = require('../src/strategies/index');
      const colorStrategy = new ColorTagStrategy();
      converter.registerTagStrategy(colorStrategy);

      const html = '<red>Error:</red> Connection failed';
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThan(1);
      
      const redLayer = spec.layer.find(layer => layer.mark.color === '#FF0000');
      expect(redLayer).toBeDefined();
      expect(redLayer?.data.values[0].text).toBe('Error:');
    });
  });

  describe('Complex Examples', () => {
    it('should handle complex nested HTML', () => {
      const html = `
        <h1>Report Title</h1>
        <p><b>Status:</b> <span style="color: green">Success</span></p>
        <p>Run <code>npm test</code> to verify.</p>
        <p><mark>Important:</mark> Check the <a href="#logs">logs</a> for details.</p>
      `;
      
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThan(3);
      expect(spec.width).toBeGreaterThan(0);
      expect(spec.height).toBeGreaterThan(0);
      
      // Should have various styled layers
      const allValues = spec.layer.flatMap(layer => layer.data.values);
      const texts = allValues.map(v => v.text);
      expect(texts).toContain('Report Title');
      expect(texts).toContain('Success');
      expect(texts).toContain('npm test');
    });

    it('should handle mixed formatting with line breaks', () => {
      const html = `
        <b>Bold line 1</b><br>
        <i>Italic line 2</i><br>
        <u>Underlined line 3</u>
      `;
      
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThan(2);
      
      // Should have multiple Y positions due to line breaks
      const allValues = spec.layer.flatMap(layer => layer.data.values);
      const yPositions = allValues.map(v => v.y);
      const uniqueYs = [...new Set(yPositions)];
      expect(uniqueYs.length).toBeGreaterThan(1);
    });

    it('should handle performance with many elements', () => {
      // Create HTML with many formatted elements
      const elements = Array.from({ length: 50 }, (_, i) => 
        `<b>Bold ${i}</b> <i>italic ${i}</i>`
      ).join(' ');
      
      const start = Date.now();
      const spec = converter.convert(elements);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(spec.layer.length).toBeGreaterThan(0);
      expect(spec.width).toBeGreaterThan(0);
      expect(spec.height).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tags', () => {
      const html = '<b></b>Hello<i></i>';
      const spec = converter.convert(html);

      expect(spec.layer.length).toBeGreaterThan(0);
      
      const allValues = spec.layer.flatMap(layer => layer.data.values);
      const texts = allValues.map(v => v.text).filter(t => t.length > 0);
      expect(texts).toContain('Hello');
    });

    it('should handle malformed HTML gracefully', () => {
      const html = '<b>Unclosed bold <i>and italic';
      
      expect(() => {
        const spec = converter.convert(html);
        expect(spec).toHaveProperty('layer');
      }).not.toThrow();
    });

    it('should handle special characters', () => {
      const html = '<b>Special: &amp; &lt; &gt; "quotes"</b>';
      const spec = converter.convert(html);

      expect(spec.layer).toHaveLength(1);
      expect(spec.layer[0].data.values[0].text).toContain('&amp;');
    });

    it('should handle very long text', () => {
      const longText = 'This is a very long text that should definitely exceed normal line lengths and test the wrapping functionality of the layout engine to ensure it works correctly with extended content '.repeat(10);
      const html = `<p>${longText}</p>`;
      
      const spec = converter.convert(html, { maxWidth: 300 });

      expect(spec.layer.length).toBeGreaterThan(0);
      expect(spec.width).toBeLessThanOrEqual(300);
      
      // Should wrap to multiple lines
      const allValues = spec.layer.flatMap(layer => layer.data.values);
      if (allValues.length > 1) {
        const yPositions = allValues.map(v => v.y);
        const uniqueYs = [...new Set(yPositions)];
        expect(uniqueYs.length).toBeGreaterThan(1);
      }
    });
  });

  describe('Validation Examples', () => {
    it('should validate correct HTML', () => {
      const html = '<b>Bold</b> and <i>italic</i>';
      const validation = converter.parseHTML(html);

      expect(validation.errors).toEqual([]);
    });

    it('should detect HTML errors', () => {
      const html = '<b>Unclosed bold';
      const validation = converter.parseHTML(html);

      expect(validation.errors).toBeDefined();
      expect(validation.errors!.length).toBeGreaterThan(0);
    });

    it('should detect unsupported tags', () => {
      const html = '<unsupported>Text</unsupported>';
      const validation = converter.parseHTML(html);

      expect(validation.errors).toBeDefined();
      expect(validation.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('Options Examples', () => {
    it('should respect custom fontSize', () => {
      const html = '<b>Test</b>';
      const spec = converter.convert(html, { fontSize: 20 });

      expect(spec.layer[0].mark.fontSize).toBe(20);
    });

    it('should respect custom fontFamily', () => {
      const html = '<b>Test</b>';
      const spec = converter.convert(html, { fontFamily: 'Times' });

      expect(spec.layer[0].mark.fontFamily).toBe('Times');
    });

    it('should respect custom background', () => {
      const html = '<b>Test</b>';
      const spec = converter.convert(html, { background: '#FFFFFF' });

      expect(spec.background).toBe('#FFFFFF');
    });

    it('should respect custom maxWidth', () => {
      const longText = 'This is a long text that should wrap when maxWidth is constrained';
      const html = `<p>${longText}</p>`;
      const spec = converter.convert(html, { maxWidth: 200 });

      expect(spec.width).toBeLessThanOrEqual(200);
    });
  });

  describe('Static Method Examples', () => {
    it('should work with static convert method', () => {
      const html = '<b>Static test</b>';
      const spec = HTMLToVegaLite.convert(html);

      expect(spec).toHaveProperty('$schema');
      expect(spec.layer).toHaveLength(1);
      expect(spec.layer[0].data.values[0].text).toBe('Static test');
    });

    it('should accept options in static method', () => {
      const html = '<b>Static with options</b>';
      const spec = HTMLToVegaLite.convert(html, { fontSize: 18 });

      expect(spec.layer[0].mark.fontSize).toBe(18);
    });
  });
});
