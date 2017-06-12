/**
 * @flow
 */
import svg2ttf from 'svg2ttf';

/**
 * Generate TTF from SVG
 * @param svgFont
 * @param options
 * @returns {Buffer}
 */
const generateTTFfromSVGFont = (svgFont: string, options: Object) => {
  const font = svg2ttf(svgFont, options.formatOptions.ttf);

  return new Buffer(font.buffer);
};

export default generateTTFfromSVGFont;
