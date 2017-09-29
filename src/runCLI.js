/**
 * @flow
 */
import glob from 'glob';
import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import jetpack from 'fs-jetpack';
import ejs from 'ejs';

import generateSvgFontAsync from './generateSVGFont';
import generateTTFfromSVGFont from './svgToTTF';
import jsData from './generateJSTemplate';

const START_CODEPOINT = 0xF101;
const normalize = true;

/**
 * Rename file using basename
 * @param file
 */
const rename = (file) => path.basename(file, path.extname(file));

const platformPrefix = (file) => file.indexOf('android') > -1 ? 'android' : 'ios';

/**
 * Uppercase the first letter of a text
 * @param text {string}
 * @returns {string}
 */
const uppercaseFirstLetter = text => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

const svgIconName = (file) => `${platformPrefix(file)}${uppercaseFirstLetter(rename(file))}`;

/**
 * Write content to file
 * @param content
 * @param dest
 */
const writeFile = (content, dest) => {
  mkdirp.sync(path.dirname(dest));
  fs.writeFileSync(dest, content);
};

type CliOptions = {
  fontName: string,
  dest: string,
  iconsGlob: string,
};

export default async function execute({
  fontName = 'MyFont',
  dest = 'dist',
  iconsGlob = './icons/**/*.svg',
}: CliOptions = {}) {
  try {
    const files = glob.sync(iconsGlob);

    // const names = files.map((file) => rename(file));
    const names = files.map((file) => svgIconName(file));

    const codepoints = names.reduce((cp, name, idx) => ({
      ...cp,
      [name]: START_CODEPOINT + idx,
    }), {});

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
    const svgFontPath = path.join(dest, `${fontName}.svg`);
    writeFile(svgFont, svgFontPath);

    // transform svg font to ttf font
    const ttfFont = generateTTFfromSVGFont(svgFont, options);
    const ttfFontPath = path.join(dest, `${fontName}.ttf`);
    writeFile(ttfFont, ttfFontPath);

    const pathTemplate = path.join(__dirname, '../template/icons.platform.js.template');
    const templateContent = jetpack.read(pathTemplate);

    const data = jsData(codepoints);

    // Generate .android.js and .ios.js icons definitions
    Object.keys(data).map((platform) => {
      const content = ejs.render(templateContent, {
        props: {
          items: data[platform],
        },
      });

      const jsPath = path.join(dest, `${fontName}.${platform}.js`);
      writeFile(content, jsPath);
    });
  } catch (err) {
    console.log(err);
  }
}
