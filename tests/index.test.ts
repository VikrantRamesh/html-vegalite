import { HTMLToVegaLite } from '../src/index';

describe('Index Module', () => {
  it('should export HTMLToVegaLite class', () => {
    expect(HTMLToVegaLite).toBeDefined();
    expect(typeof HTMLToVegaLite).toBe('function');
  });

  it('should create HTMLToVegaLite instance', () => {
    const converter = new HTMLToVegaLite();
    expect(converter).toBeInstanceOf(HTMLToVegaLite);
  });

  it('should have default options', () => {
    const converter = new HTMLToVegaLite();
    const spec = converter.convert('<b>Test</b>');
    
    expect(spec).toHaveProperty('$schema');
    expect(spec).toHaveProperty('layer');
    expect(spec).toHaveProperty('width');
    expect(spec).toHaveProperty('height');
  });
});
