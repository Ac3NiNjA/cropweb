import { Alignment } from "@src/types";
import { Size } from "@src/types";
import ReactCrop from "react-image-crop";

export const toBase64 = (file: File | Blob): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

export function cropImage(image: HTMLImageElement, crop: ReactCrop.Crop) {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width! * scaleX;
  canvas.height = crop.height! * scaleY;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas.getContext - ctx returned nothing");

  ctx.drawImage(
    image,
    crop.x! * scaleX,
    crop.y! * scaleY,
    crop.width! * scaleX,
    crop.height! * scaleY,
    0,
    0,
    crop.width! * scaleX,
    crop.height! * scaleY
  );

  const b64 = canvas.toDataURL("image/jpeg");
  const imageElement = new Image();
  imageElement.src = b64;
  return { imageElement, b64 };
}

export const saveFile = (href: string, filename: string) => {
  const aTag = document.createElement("a");
  aTag.href = href;
  aTag.download = filename;
  aTag.click();
};

type Val = number | null | undefined;
export const calculateAlignments = (
  image: { height?: Val; width?: Val },
  crop: { height?: Val; width?: Val }
): { y: { [key in Alignment]: number }; x: { [key in Alignment]: number } } => {
  const defaults = {
    [Alignment.L]: 0, // Top or Left, doesn't need to be calculated.
    [Alignment.M]: 0,
    [Alignment.R]: 0,
  };

  const xy = {
    x: { ...defaults },
    y: { ...defaults },
  };

  const cal = (pos: keyof typeof xy, iw: Val, cw: Val) => {
    if (!iw || !cw) return;
    xy[pos][Alignment.M] = (iw - cw) / 2; // Center
    xy[pos][Alignment.R] = iw - cw; // Right or Bottom
  };

  cal("x", image.width, crop.width);
  cal("y", image.height, crop.height);

  return xy;
};

export const calculatePxFromSize = (px: number, size: Size) => {
  const map = {
    [Size.LARGE]: 1,
    [Size.MEDIUM]: 1.25,
    [Size.SMALL]: 1.5,
  };
  return px / map[size];
};

export const shortenName = (filename: string) => {
  const len = filename.length;
  const max = 36;
  const sl = max / 2;
  if (len < max) return filename;
  return `${filename.slice(0, sl)}....${filename.slice(len - sl)}`;
};

export const remoteFetch = async (url: string) => {
  return fetch(url).catch(() =>
    // TODO: check err type
    fetch(`https://odd-band-95fc.marea.workers.dev/?${encodeURIComponent(url)}`)
  );
};
