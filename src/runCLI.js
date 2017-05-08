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
import getJsTemplateData from './generateJsIcons';

const START_CODEPOINT = 0xF101;
const normalize = true;

/**
 * Rename file using basename
 * @param file
 */
const rename = (file) => path.basename(file, path.extname(file));

/**
 * Write content to file
 * @param content
 * @param dest
 */
const writeFile = (content, dest) => {
  mkdirp.sync(path.dirname(dest));
  fs.writeFileSync(dest, content);
};

export default async function execute({
  fontName = 'FontNatura',
  dest = 'dist',
  icons = 'icons'
} = {}) {
  try {
    const filesGlob = `${icons}/*.svg`;
    const files = glob.sync(filesGlob);

    const names = files.map((file) => rename(file));

    const codepoints = names.reduce((cp, name, idx) => ({
      ...cp,
      [name]: START_CODEPOINT + idx,
    }), {});

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
    const ttfFont = generateTTFfromSVGFont(svgFont, options);

    // const unicodes = Object.keys(codepoints).map(k => codepoints[k].toString(16));
    //
    // const items = Object.keys(codepoints).map((name) => ({
    //   name,
    //   value: codepoints[name].toString(16),
    // }));

    const data = getJsTemplateData(codepoints);
    const templateContent = jetpack.read(pathTemplate);
    const content = ejs.render(templateContent, data);

    writeFile(svgFont, svgFontPath);
    writeFile(ttfFont, ttfFontPath);
    writeFile(content, jsPath);

  } catch (err) {
    console.log(err);
  }
}
