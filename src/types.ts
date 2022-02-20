export type IRatio = { text: string; /** Unique number */ aspect: number };

// If another is added, need to add support for it in utils.calculatePxFromSize
export enum Size {
  "SMALL" = "Small",
  "MEDIUM" = "Medium",
  "LARGE" = "Large",
}

// If another alignment is added, you need to add support for it in utils.calculateXAlignments
export enum Alignment {
  L = "Left",
  M = "Middle",
  R = "Right",
}

export type OnPreparedImageFn = (imageAsBase64: string, name: string) => unknown;
