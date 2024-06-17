export type bit = 0 | 1;
type byte = [bit, bit, bit, bit, bit, bit, bit, bit];
export type word = [...byte, ...byte, ...byte, ...byte];
