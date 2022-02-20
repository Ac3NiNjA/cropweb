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

export const calculateXAlignments = (
  imageWidth?: number | null,
  cropWidth?: number
): { [key in Alignment]: number } => {
  const obj = {
    [Alignment.L]: 0,
    [Alignment.M]: 0,
    [Alignment.R]: 0,
  };

  if (imageWidth && cropWidth) {
    obj[Alignment.M] = (imageWidth - cropWidth) / 2;
    obj[Alignment.R] = imageWidth - cropWidth;
  }

  return obj;
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
