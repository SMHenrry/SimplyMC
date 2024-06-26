export const presetVersion = 3;

export interface format {
  color: string;
  char?: string;
  bold?: string;
  italic?: string;
  underline?: string;
  strikethrough?: string;
}

declare interface preset {
  version: number;
  colors: string[];
  name: string;
  text: string;
  type: number;
  speed: number;
  length: number;
  format: format;
  customFormat: boolean;
  prefixsuffix: string;
  outputFormat: string;
  trimspaces: boolean;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
}

export const presets = {
  'birdflop': ['#084CFB', '#ADF3FD'],
  'SimplyMC': ['#00FFE0', '#EB00FF'],
  'Rainbow': ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
  'Skyline': ['#1488CC', '#2B32B2'],
  'Mango': ['#FFE259', '#FFA751'],
  'Vice City': ['#3494E6', '#EC6EAD'],
  'Dawn': ['#F3904F', '#3B4371'],
  'Rose': ['#F4C4F3', '#FC67FA'],
  'Firewatch': ['#CB2D3E', '#EF473A'],
};

export const v3formats = [
  {
    color: '&#$1$2$3$4$5$6$f$c',
    char: '&',
  },
  {
    color: '<#$1$2$3$4$5$6>$f$c',
    char: '&',
  },
  {
    color: '&x&$1&$2&$3&$4&$5&$6$f$c',
    char: '&',
  },
  {
    color: '§x§$1§$2§$3§$4§$5§$6$f$c',
    char: '§',
  },
  {
    color: '[COLOR=#$1$2$3$4$5$6]$c[/COLOR]',
    bold: '[BOLD]$t[/BOLD]',
    italic: '[ITALIC]$t[/ITALIC]',
    underline: '[UNDERLINE]$t[/UNDERLINE]',
    strikethrough: '[STRIKETHROUGH]$t[/STRIKETHROUGH]',
  },
  {
    color: 'MiniMessage',
    bold: '<bold>$t</bold>',
    italic: '<italic>$t</italic>',
    underline: '<underline>$t</underline>',
    strikethrough: '<strikethrough>$t</strikethrough>',
  },
];

export const types = [
  { name: 'Normal (Left -> Right)', value: 1 },
  { name: 'Reversed (Right -> Left)', value: 2 },
  { name: 'Bouncing (Left -> Right -> Left)', value: 3 },
  { name: 'Full Text Cycle', value: 4 },
];

export const defaults: preset = {
  version: 3,
  colors: presets.birdflop,
  name: 'logo',
  text: 'birdflop',
  type: 1,
  speed: 50,
  length: 1,
  format: v3formats[0],
  prefixsuffix: '',
  customFormat: false,
  outputFormat: '%name%:\n  change-interval: %speed%\n  texts:\n%output:{  - "$t"}%',
  trimspaces: true,
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
};

function decompress(input: number, expectedValues: number) {
  const values = [];
  for (let i = 0; i < expectedValues; i++) {
    const value = !!((input >> i) & 1);
    values.push(value);
  }
  return values;
}

const v1formats = {
  0: {
    outputPrefix: '',
    template: '&#$1$2$3$4$5$6$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  1: {
    outputPrefix: '',
    template: '<#$1$2$3$4$5$6>$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  2: {
    outputPrefix: '',
    template: '&x&$1&$2&$3&$4&$5&$6$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  3: {
    outputPrefix: '/nick ',
    template: '&#$1$2$3$4$5$6$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  4: {
    outputPrefix: '/nick ',
    template: '<#$1$2$3$4$5$6>$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  5: {
    outputPrefix: '/nick ',
    template: '&x&$1&$2&$3&$4&$5&$6$f$c',
    formatChar: '&',
    maxLength: 256,
  },
  6: {
    outputPrefix: '',
    template: '§x§$1§$2§$3§$4§$5§$6$f$c',
    formatChar: '§',
  },
  7: {
    outputPrefix: '',
    template: '[COLOR=#$1$2$3$4$5$6]$c[/COLOR]',
    formatChar: '',
  },
  8: {
    outputPrefix: '',
    template: '',
    custom: true,
    formatChar: '',
  },
};

export function fromBinary(encoded: string): string {
  let binary: string;
  try {
    binary = atob(encoded);
  } catch (error) {
    return '';
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

export function loadPreset(p: string) {
  let version: number;
  let preset: any;
  const newPreset = { ...defaults };
  if (fromBinary(p) !== '') {
    preset = JSON.parse(fromBinary(p));
    version = preset.version;
  } else {
    preset = JSON.parse(p);
    version = preset.version;
  }
  if (version === presetVersion) {
    return preset;
  }
  if (version === 1) {
    newPreset.version = presetVersion;
    newPreset.colors = preset.colors;
    newPreset.name = preset.name;
    newPreset.text = preset.text;
    newPreset.speed = preset.speed;
    newPreset.type = Number(preset.type) + 1;
    newPreset.format = v3formats.find((f) => f.color === v1formats[preset['output-format'] as keyof typeof v1formats].template) || {
      color: v1formats[preset['output-format'] as keyof typeof v1formats].template,
      char: v1formats[preset['output-format'] as keyof typeof v1formats].formatChar,
    };
    newPreset.customFormat = preset['custom-format'] !== '';
    newPreset.prefixsuffix = v1formats[preset['output-format'] as keyof typeof v1formats].outputPrefix ? `${v1formats[preset['output-format'] as keyof typeof v1formats].outputPrefix}$t` : '';
    const formatting = decompress(preset.formats, 4);
    newPreset.bold = formatting[0];
    newPreset.italic = formatting[1];
    newPreset.underline = formatting[2];
    newPreset.strikethrough = formatting[3];
  }
  if (version === 2) {
    newPreset.version = presetVersion;
    newPreset.colors = preset.colors;
    newPreset.name = preset.name;
    newPreset.text = preset.text;
    newPreset.speed = preset.speed;
    newPreset.type = preset.type;
    newPreset.format = v3formats.find((f) => f.color === preset.format) || {
      color: preset.format,
      char: preset.formatchar,
    };
    newPreset.customFormat = preset.customFormat;
    newPreset.prefixsuffix = preset.prefix ? `${preset.prefix}$t` : '';
    newPreset.bold = preset.bold;
    newPreset.italic = preset.italic;
    newPreset.underline = preset.underline;
    newPreset.strikethrough = preset.strikethrough;
  }

  Object.keys(newPreset).forEach((key) => {
    if (newPreset[key as keyof preset] === defaults[key as keyof preset] && key !== 'version') {
      delete newPreset[key as keyof preset];
    }
  });
  return newPreset;
}