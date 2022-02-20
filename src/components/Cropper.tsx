import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "react-image-crop/dist/ReactCrop.css";
import ReactCrop from "react-image-crop";
import { useToast } from "@chakra-ui/react";
import {
  calculatePxFromSize,
  calculateXAlignments,
  cropImage,
  saveFile,
  shortenName,
} from "@utils";
import { CropPanel, CropPanelProps } from "./CropPanel";
import { useCropOptions, useSelectedRatio, useSelectedSize } from "@src/store";
import ImageDropzone from "./ImageDropzone";
import { OnPreparedImageFn } from "@src/types";

export const Cropper = () => {
  const toast = useToast();

  const [base64, setBase64] = useState("");
  const [filename, setFilename] = useState("");
  const shortenedName = useMemo(() => shortenName(filename), [filename]);

  const [crop, setCrop] = useState<ReactCrop.Crop>({});
  const imgRef = useRef<HTMLImageElement | null>(null);
  const { ruleOfThirds, locked } = useCropOptions();

  // Adjust crop when aspect ratio is clicked.
  const selectedRatio = useSelectedRatio();
  useEffect(() => {
    setCrop(({ x, y, height, unit }) => {
      return { x, y, height, unit, aspect: selectedRatio.value?.aspect };
    });
  }, [selectedRatio.value?.aspect]);

  // Adjust crop height/width when Size preset clicked.
  const selectedSize = useSelectedSize();
  useEffect(() => {
    if (!selectedSize.value || !imgRef.current) return;
    setCrop(({ aspect }) => {
      const key = _getKey(imgRef.current!, aspect);
      const value = calculatePxFromSize(imgRef.current![key], selectedSize.value!);

      // If an aspect is not set, we need to set a value for the opposite measurement (height/width)
      // Otherwise the crop selection will disappear.
      const rest: Partial<ReactCrop.Crop> = {};
      if (!aspect) {
        const key2 = key === "height" ? "width" : "height";
        rest[key2] = calculatePxFromSize(imgRef.current![key2], selectedSize.value!);
      }

      return { ...rest, [key]: value, aspect: aspect, x: 0, y: 0 };
    });
  }, [selectedSize.value]);

  const onImageLoad = useCallback((img: HTMLImageElement) => {
    imgRef.current = img;
    setTimeout(() => {
      setCrop(({ aspect }) => {
        const width = aspect ? undefined : img.width / 2;
        return { height: img.height / 2, width, x: 0, y: 0, aspect };
      });
    }, 100);
  }, []);

  const onCropChange = (newCrop: ReactCrop.Crop, percentCrop: ReactCrop.PercentCrop) => {
    setCrop(newCrop);
    // If size preset is set, make sure newCrop width/height matches the result of calculatePxFromSize
    if (selectedSize.value) {
      const key = _getKey(imgRef.current!, newCrop.aspect);
      const value = calculatePxFromSize(imgRef.current![key], selectedSize.value!);
      if (value !== newCrop[key]) selectedSize.set(null);
    }
  };

  const onPreparedImage: OnPreparedImageFn = async (base64, name) => {
    setBase64(base64);
    setFilename(name);
  };

  const onSaveClicked = () => {
    try {
      if (!imgRef.current) throw new Error("no imgRef set");
      const img = cropImage(imgRef.current, crop);
      saveFile(img.b64, filename);
    } catch (error) {
      console.error("Error Saving Crop", error);
      toast({
        status: "error",
        title: "Error Saving Crop",
        description: (error as Error)?.message || "Unknown Error",
      });
    }
  };

  const onUnloadClicked = () => {
    // if (!window.confirm("Are you sure? You will lose any unsaved edits.")) return;
    imgRef.current = null;
    setBase64("");
    setFilename("");
  };

  const imageWidth = imgRef.current?.width;
  const xAlignments = useMemo(
    () => calculateXAlignments(imageWidth, crop.width),
    [crop.width, imageWidth]
  );
  const onAlignmentChange: CropPanelProps["onAlignmentChange"] = (alignment) => {
    setCrop({ ...crop, x: xAlignments[alignment] });
  };

  return (
    <div className={"flex justify-center pb-10 pt-5"}>
      <div>
        <ImageDropzone onPreparedImage={onPreparedImage} visible={!imgRef.current} />

        <ReactCrop
          imageStyle={{ maxHeight: 500 }}
          style={{ boxShadow: "black 0px 0px 10px" }}
          src={base64}
          onImageLoaded={onImageLoad}
          ruleOfThirds={ruleOfThirds.value}
          locked={locked.value}
          crop={crop}
          onChange={onCropChange}
        />

        {imgRef.current && (
          <>
            <div className={"pt-2 pb-1.5"} title={filename}>
              {shortenedName} - {imgRef.current.naturalWidth}x{imgRef.current.naturalHeight}
            </div>

            <CropPanel
              crop={crop}
              image={imgRef.current}
              onPreparedImage={onPreparedImage}
              onSaveClicked={onSaveClicked}
              onAlignmentChange={onAlignmentChange}
              onUnloadClicked={onUnloadClicked}
            />
          </>
        )}
      </div>
    </div>
  );
};

const _getKey = (img: HTMLImageElement, aspect?: number) => {
  const { height, width } = img;
  let key: "width" | "height" = "width";
  const iaspect = width > height ? width / height : height / width;
  if (aspect && iaspect > aspect) {
    if (width > height) key = "height";
    else key = "width";
  }
  return key;
};

export default Cropper;
