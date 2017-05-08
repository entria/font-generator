/**
 * @flow
 */
import 'babel-polyfill';
import yargs from 'yargs';
import execute from './runCLI';

export type Path = string;
export type Argv = {|
  fontName: string,
  dest: string,
  icons: string,
|};

const usage = 'Usage: $0 iconPath';
const docs = 'Documentation: https://github.com/entria/font-generator';
const options = {
  fontName: {
    default: 'FontNatura',
    description: 'generated font name',
  },
  dest: {
    default: 'dist',
    description: 'destination folder',
  },
  icons: {
    default: 'icons',
    description: 'svg icons folder',
  },
};

export function run(argv?: Argv, project?: Path) {
  argv = yargs(argv || process.argv.slice(2))
    .usage(usage)
    .options(options)
    .epilogue(docs)
    .help()
    .argv;

  console.log('argv: ', argv);

  execute({
    fontName: argv.fontName,
    dest: argv.dest,
    icons: argv.icons,
  });
}

