/**
 * @flow
 */
import fs from 'fs';
import svgicons2svgfont from 'svgicons2svgfont';

/**
 * Generate SVG Font from single SVG files
 * @param options
 * @param done
 */
const generateSvgFontStream = (options, done) => {
  let font = new Buffer(0);
  const {
    fontName,
    fontHeight,
    descent,
    normalize,
    round,
  } = options;

  const svgOptions = {
    fontName,
    fontHeight,
    descent,
    normalize,
    round,
  };

  svgOptions.log = () => {};

  const fontStream = svgicons2svgfont(svgOptions)
    .on('data', (data) => {
      font = Buffer.concat([font, data])
    })
    .on('end', () => {
      done(null, font.toString());
    });

  options.files.map((file, idx) => {
    const glyph = fs.createReadStream(file);
    const name = options.names[idx];
    const unicode = String.fromCharCode(options.codepoints[name]);
    glyph.metadata = {
      name: name,
      unicode: [unicode]
    };
    fontStream.write(glyph)
  });

  fontStream.end();
};

/**
 * Promisify generateSvgFontStream
 * @param options
 */
const generateSvgFontAsync = options =>
  new Promise((resolve, reject) => {
    generateSvgFontStream(options, (err, data) => {
      if (err) {
        return reject(err);
      }

      resolve(data);
    })
  });

export default generateSvgFontAsync;
