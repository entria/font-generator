import svgicons2svgfont from 'svgicons2svgfont';
import svg2ttf from 'svg2ttf';
import _ from 'lodash';
import glob from 'glob';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import jetpack from 'fs-jetpack';
import ejs from 'ejs';

const START_CODEPOINT = 0xF101;
const normalize = true;

/**
 * Rename file using basename
 * @param file
 */
const rename = (file) => path.basename(file, path.extname(file));

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
    })

  options.files.map((file, idx) => {
    const glyph = fs.createReadStream(file)
    const name = options.names[idx]
    const unicode = String.fromCharCode(options.codepoints[name])
    glyph.metadata = {
      name: name,
      unicode: [unicode]
    }
    fontStream.write(glyph)
  });

  fontStream.end();
}

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

/**
 * Generate TTF from SVG
 * @param svgFont
 * @param options
 * @returns {Buffer}
 */
const genereateTTFfromSVGFont = (svgFont, options) => {
  const font = svg2ttf(svgFont, options.formatOptions['ttf'])

  return new Buffer(font.buffer);
}

/**
 * Write content to file
 * @param content
 * @param dest
 */
const writeFile = (content, dest) => {
  mkdirp.sync(path.dirname(dest));
  fs.writeFileSync(dest, content);
}

/**
 * Find same icons for different platforms (ios and android)
 * @param codepoints
 * @returns {*}
 */
const unifiedPlatformIcons = (codepoints) => {
  return Object.keys(codepoints).reduce((all, name) => {
    const common = name.replace('android', '').replace('ios', '').toLowerCase();
    const isAndroid = name.indexOf('android') > -1;
    const isIos = name.indexOf('ios') > -1;

    if (!isAndroid && !isIos) return all;

    if (!(common in all)) {
      all[common] = {
        name: common,
      };
    }

    if (isAndroid) {
      all[common].android = name;
    }

    if (isIos) {
      all[common].ios = name;
    }

    return all;
  }, {});
}

/**
 * Remove icons for only one platform
 * @param icons
 * @returns {*}
 */
const filterOnlyOnePlatformIcons = (icons) => {
  return Object.keys(icons).filter((common) => {
    const item = icons[common];
    if (!item.name || !item.android || !item.ios) return false;
    return true;
  }).reduce((all, common) => ({
    ...all,
    [common]: icons[common],
  }), {});
}

/**
 * Get template data for js icons templates
 * @param codepoints
 * @returns {{props: {items: Array, nonPlatformItems: *}}}
 */
const getJsTemplateData = (codepoints) => {
  // get name and codepoints
  const items = Object.keys(codepoints).map((name) => ({
    name,
    value: codepoints[name].toString(16),
  }));

  // based on Platform
  const unifiedIcons = unifiedPlatformIcons(codepoints);
  const nonPlatformItems = filterOnlyOnePlatformIcons(unifiedIcons);

  return {
    props: {
      items,
      nonPlatformItems,
    },
  };
}

(async () => {
  try {
    const filesGlob = 'icons/*.svg';
    const files = glob.sync(filesGlob);

    const names = files.map((file) => rename(file));

    const codepoints = names.reduce((cp, name, idx) => ({
      ...cp,
      [name]: START_CODEPOINT + idx,
    }), {});

    const fontName = 'FontNatura';
    const dest = 'dist';
    const pathTemplate = './template/icons.js.template';
    const svgFontPath = path.join(dest, `${fontName}.svg`);
    const ttfFontPath = path.join(dest, `${fontName}.ttf`);
    const jsPath = path.join(dest, `${fontName}.js`);

    const options = {
      fontName,
      files,
      normalize,
      names,
      codepoints,
      formatOptions: {},
    };

    // transform svg icons to a svg font
    const svgFont = await generateSvgFontAsync(options);

    // transform svg font to ttf font
    const ttfFont = genereateTTFfromSVGFont(svgFont, options);

    const unicodes = Object.keys(codepoints).map(k => codepoints[k].toString(16));

    const items = Object.keys(codepoints).map((name) => ({
      name,
      value: codepoints[name].toString(16),
    }));

    const data = getJsTemplateData(codepoints);
    const templateContent = jetpack.read(pathTemplate);
    const content = ejs.render(templateContent, data);

    writeFile(svgFont, svgFontPath);
    writeFile(ttfFont, ttfFontPath);
    writeFile(content, jsPath);

  } catch (err) {
    console.log(err);
  }
})();
