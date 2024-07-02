import { hexToNormalizedRgb, hexToRgb } from "./math/color";

/**
 * 
    base00 - Default Background
    base01 - Lighter Background (Used for status bars, line number and folding marks)
    base02 - Selection Background
    base03 - Comments, Invisibles, Line Highlighting
    base04 - Dark Foreground (Used for status bars)
    base05 - Default Foreground, Caret, Delimiters, Operators
    base06 - Light Foreground (Not often used)
    base07 - Light Background (Not often used)
    base08 - Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
    base09 - Integers, Boolean, Constants, XML Attributes, Markup Link Url
    base0A - Classes, Markup Bold, Search Text Background
    base0B - Strings, Inherited Class, Markup Code, Diff Inserted
    base0C - Support, Regular Expressions, Escape Characters, Markup Quotes
    base0D - Functions, Methods, Attribute IDs, Headings
    base0E - Keywords, Storage, Selector, Markup Italic, Diff Changed
    base0F - Deprecated, Opening/Closing Embedded Language Tags, e.g. <?php ?>
 */

export const BASE00 = hexToRgb('#292a44')!;
export const BASE01 = hexToRgb('#663399')!;
export const BASE02 = hexToRgb('#383a62')!;
export const BASE03 = hexToRgb('#666699')!;
export const BASE04 = hexToRgb('#a0a0c5')!;
export const BASE05 = hexToRgb('#f1eff8')!;
export const BASE06 = hexToRgb('#ccccff')!;
export const BASE07 = hexToRgb('#53495d')!;
export const BASE08 = hexToRgb('#a0a0c5')!;
export const BASE09 = hexToRgb('#efe4a1')!;
export const BASE0A = hexToRgb('#ae81ff')!;
export const BASE0B = hexToRgb('#6dfedf')!;
export const BASE0C = hexToRgb('#8eaee0')!;
export const BASE0D = hexToRgb('#2de0a7')!;
export const BASE0E = hexToRgb('#7aa5ff')!;
export const BASE0F = hexToRgb('#ff79c6')!;

export const NORMALIZED_BASE00 = hexToNormalizedRgb('#292a44')!;
export const NORMALIZED_BASE01 = hexToNormalizedRgb('#663399')!;
export const NORMALIZED_BASE02 = hexToNormalizedRgb('#383a62')!;
export const NORMALIZED_BASE03 = hexToNormalizedRgb('#666699')!;
export const NORMALIZED_BASE04 = hexToNormalizedRgb('#a0a0c5')!;
export const NORMALIZED_BASE05 = hexToNormalizedRgb('#f1eff8')!;
export const NORMALIZED_BASE06 = hexToNormalizedRgb('#ccccff')!;
export const NORMALIZED_BASE07 = hexToNormalizedRgb('#53495d')!;
export const NORMALIZED_BASE08 = hexToNormalizedRgb('#a0a0c5')!;
export const NORMALIZED_BASE09 = hexToNormalizedRgb('#efe4a1')!;
export const NORMALIZED_BASE0A = hexToNormalizedRgb('#ae81ff')!;
export const NORMALIZED_BASE0B = hexToNormalizedRgb('#6dfedf')!;
export const NORMALIZED_BASE0C = hexToNormalizedRgb('#8eaee0')!;
export const NORMALIZED_BASE0D = hexToNormalizedRgb('#2de0a7')!;
export const NORMALIZED_BASE0E = hexToNormalizedRgb('#7aa5ff')!;
export const NORMALIZED_BASE0F = hexToNormalizedRgb('#ff79c6')!;