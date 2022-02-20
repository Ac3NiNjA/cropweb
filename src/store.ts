import { createState, useState } from "@hookstate/core";
import { IRatio, Size } from "./types";

const selectedRatioState = createState<IRatio | null>(null);
export const useSelectedRatio = () => useState(selectedRatioState);

const selectedSizeState = createState<Size | null>(null);
export const useSelectedSize = () => useState(selectedSizeState);

const cropOptions = createState({
  ruleOfThirds: true,
  locked: false,
  // ratio: null as IRatio | null,
  // size: null as Size | null,
});
export const useCropOptions = () => useState(cropOptions);
