import { AnimatedGradient, Gradient } from './HexUtils';
import type { format } from './PresetUtils';
import { defaults } from './PresetUtils';

export function hex(c: number) {
  const s = '0123456789ABCDEF';
  let i = c;
  if (i == 0 || isNaN(c)) { return '00'; }
  i = Math.round(Math.min(Math.max(0, i), 255));
  return s.charAt((i - i % 16) / 16) + s.charAt(i % 16);
}

export function convertToHex(rgb: number[]) {
  return hex(rgb[0]) + hex(rgb[1]) + hex(rgb[2]);
}

export function trim(s: string) {
  return (s.charAt(0) == '#') ? s.substring(1, 7) : s;
}

export function convertToRGB(hex: string) {
  const color = [];
  color[0] = parseInt((trim(hex)).substring(0, 2), 16);
  color[1] = parseInt((trim(hex)).substring(2, 4), 16);
  color[2] = parseInt((trim(hex)).substring(4, 6), 16);
  return color;
}

export function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function getAnimFrames(store: any) {
  let colors = store.colors.map((color: string) => convertToRGB(color));
  if (colors.length < 2) colors = [convertToRGB('#00FFE0'), convertToRGB('#EB00FF')];

  const text = store.text ?? 'birdflop';
  let loopAmount;
  switch (Number(store.type)) {
  default:
    loopAmount = text.length * store.length * 2 - 2;
    break;
  case 3:
    loopAmount = text.length * store.length;
    break;
  }

  const OutputArray = [];
  const frames = [];
  for (let n = 0; n < loopAmount; n++) {
    const clrs = [];
    const gradient = new AnimatedGradient(colors, text.length * store.length, n);
    let output = '';
    gradient.next();
    if (store.type == 4) {
      const hex = convertToHex(gradient.next());
      clrs.push(hex);
      let hexOutput = store.format.color;
      for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
      let formatCodes = '';
      if (store.format.color.includes('$f')) {
        if (store.bold) formatCodes += store.format.char + 'l';
        if (store.italic) formatCodes += store.format.char + 'o';
        if (store.underline) formatCodes += store.format.char + 'n';
        if (store.strikethrough) formatCodes += store.format.char + 'm';
      }
      hexOutput = hexOutput.replace('$f', formatCodes);
      hexOutput = hexOutput.replace('$c', text);
      if (store.prefixsuffix) hexOutput = store.prefixsuffix.replace(/\$t/g, hexOutput);
      OutputArray.push(hexOutput);
    } else {
      for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        if (store.trimspaces && char == ' ') {
          output += char;
          clrs.push(null);
          continue;
        }

        const hex = convertToHex(gradient.next());
        clrs.push(hex);
        let hexOutput = store.format.color;
        for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
        let formatCodes = '';
        if (store.format.color.includes('$f')) {
          if (store.bold) formatCodes += store.format.char + 'l';
          if (store.italic) formatCodes += store.format.char + 'o';
          if (store.underline) formatCodes += store.format.char + 'n';
          if (store.strikethrough) formatCodes += store.format.char + 'm';
        }

        hexOutput = hexOutput.replace('$f', formatCodes);
        hexOutput = hexOutput.replace('$c', char);
        output += hexOutput;
      }
      if (store.prefixsuffix) output = store.prefixsuffix.replace(/\$t/g, output);
      OutputArray.push(output);
    }
    frames.push(clrs);
  }

  return { OutputArray, frames };
}

export function AnimationOutput(store: any) {
  let FinalOutput = '';

  const AnimFrames = getAnimFrames(store);
  let { OutputArray } = AnimFrames;

  const format = store.outputFormat;
  FinalOutput = format.replace('%name%', store.name);
  FinalOutput = FinalOutput.replace('%speed%', store.speed);
  if (store.type == 1) {
    OutputArray.reverse();
  }
  else if (store.type == 3) {
    const OutputArray2 = OutputArray.slice();
    OutputArray = OutputArray.reverse().concat(OutputArray2);
  }

  const outputFormat = FinalOutput.match(/%output:{(.*\$t.*)}%/);
  if (outputFormat) {
    OutputArray = OutputArray.map((output: string) => outputFormat[1].replace('$t', output));
  }
  FinalOutput = FinalOutput.replace(/%output:{.*\$t.*}%/, OutputArray.join('\n'));
  return FinalOutput;
}

export function generateOutput(
  text: string = defaults.text,
  colors: string[] = defaults.colors,
  format: format = defaults.format,
  prefixsuffix?: string,
  trimspaces?: boolean,
  bold?: boolean,
  italic?: boolean,
  underline?: boolean,
  strikethrough?: boolean,
) {
  let output = '';

  if (format.color == 'MiniMessage') {
    output += `<gradient:${colors.join(':')}>${text}</gradient>`;
  }

  const newColors = colors?.map((color: string) => convertToRGB(color));
  while (newColors.length < 2) newColors.push(convertToRGB(getRandomColor()));

  const gradient = new Gradient(newColors, text.length);

  if (format.color != 'MiniMessage') {
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      if (trimspaces && char == ' ') {
        output += char;
        gradient.next();
        continue;
      }

      const hex = convertToHex(gradient.next());
      let hexOutput = format.color;
      for (let n = 1; n <= 6; n++) hexOutput = hexOutput.replace(`$${n}`, hex.charAt(n - 1));
      let formatCodes = '';
      if (format.color.includes('$f')) {
        if (format.char) {
          if (bold) formatCodes += format.char + 'l';
          if (italic) formatCodes += format.char + 'o';
          if (underline) formatCodes += format.char + 'n';
          if (strikethrough) formatCodes += format.char + 'm';
        }
      }

      hexOutput = hexOutput.replace('$f', formatCodes);
      hexOutput = hexOutput.replace('$c', char);
      output += hexOutput;
    }
  }

  if (format.bold && bold) output = format.bold.replace('$t', output);
  if (format.italic && italic) output = format.italic.replace('$t', output);
  if (format.underline && underline) output = format.underline.replace('$t', output);
  if (format.strikethrough && strikethrough) output = format.strikethrough.replace('$t', output);
  if (prefixsuffix) output = prefixsuffix.replace(/\$t/g, output);
  return output;
}