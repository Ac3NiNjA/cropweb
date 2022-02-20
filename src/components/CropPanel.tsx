import { useCropOptions, useSelectedRatio, useSelectedSize } from "@src/store";
import { Alignment, IRatio, OnPreparedImageFn, Size } from "@src/types";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  useColorModeValue,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { MdGridOn, MdGridOff, MdLockOutline, MdLockOpen } from "react-icons/md";
import ReactCrop from "react-image-crop";
import { useImageInput } from "./ImageDropzone";

// TODO: short description for each ratio as tooltip?
/** Aspect should be unique. */
const ratios: IRatio[] = [
  { text: "1:1", aspect: 1 / 1 },
  { text: "2:3", aspect: 2 / 3 },
  { text: "16:9", aspect: 16 / 9 },
  { text: "16:10", aspect: 16 / 10 },
];

const alignments = Object.values(Alignment);
const sizes = Object.values(Size);

export interface CropPanelProps {
  onAlignmentChange: (a: Alignment) => void;
  onSaveClicked: () => void;
  onUnloadClicked: () => void;
  onPreparedImage: OnPreparedImageFn;
  crop: ReactCrop.Crop;
  image: HTMLImageElement;
}
export const CropPanel = ({
  onAlignmentChange,
  onSaveClicked,
  onUnloadClicked,
  crop,
  image,
  onPreparedImage,
}: CropPanelProps) => {
  const { getInputProps, getRootProps } = useImageInput({ onPreparedImage });
  const bg = useColorModeValue("gray.100", "whiteAlpha.200");

  return (
    <Wrap paddingTop={2} spacing={4}>
      <WrapItem>
        <Box bg={bg} p={1} rounded={"md"}>
          <AspectRatioSelector />
          <XAlignmentSelector onAlignmentClicked={onAlignmentChange} />
          <SizeSelector />
        </Box>
      </WrapItem>

      <WrapItem>
        <CropInfo crop={crop} image={image} />
      </WrapItem>

      <WrapItem>
        <VStack>
          <Button
            size={"sm"}
            width={"100%"}
            disabled={!(crop.height && crop.width)}
            onClick={onSaveClicked}
          >
            Save
          </Button>

          <Button size={"sm"} width={"100%"} {...getRootProps()}>
            New File
            <input {...getInputProps()} />
          </Button>

          <Tooltip hasArrow label={"Clears the currently loaded image"}>
            <Button size={"sm"} width={"100%"} onClick={onUnloadClicked}>
              Close
            </Button>
          </Tooltip>
        </VStack>
      </WrapItem>
    </Wrap>
  );
};

const useHighlightedStyles = () => useColorModeValue(" bg-gray-300", " bg-gray-200 bg-opacity-60");

const AspectRatioSelector = () => {
  const selectedRatio = useSelectedRatio();
  const selectedStyles = useHighlightedStyles();

  const onRatioClicked = (ratio: IRatio) => {
    const next = ratio.aspect === selectedRatio.value?.aspect ? null : ratio;
    selectedRatio.set(next);
  };

  const getSelectedStyles = (r: IRatio) =>
    selectedRatio.value?.aspect === r.aspect ? selectedStyles : "";
  //

  return (
    <>
      <div className="font-bold text-center text-xl leading-6">Aspect Ratio</div>
      {/* Options */}
      <div className="text-center">
        {ratios.map((ratio) => (
          <button
            key={`RATIO_${ratio.aspect}`}
            className={`px-1 rounded${getSelectedStyles(ratio)}`}
            onClick={() => onRatioClicked(ratio)}
          >
            {ratio.text}
          </button>
        ))}
        {/* TODO: custom input */}
      </div>
    </>
  );
};

type XAlignmentSelectorProps = { onAlignmentClicked: (alignment: Alignment) => void };
const XAlignmentSelector = ({ onAlignmentClicked }: XAlignmentSelectorProps) => {
  return (
    <>
      <div className="font-bold text-center text-xl pt-2 leading-6">Alignment</div>
      {/* Options */}
      <div className="text-center">
        {alignments.map((alignment) => (
          <button
            key={`ALIGNMENT_${alignment}`}
            className="px-1"
            onClick={() => onAlignmentClicked(alignment)}
          >
            {alignment}
          </button>
        ))}
      </div>
    </>
  );
};

const SizeSelector = () => {
  const selectedSize = useSelectedSize();
  const isSelected = (size: Size) => selectedSize.value === size;
  const selectedStyles = useHighlightedStyles();

  return (
    <>
      <div className="font-bold text-center text-xl pt-2 leading-6">Size</div>
      {/* Size Options */}
      <div className="text-center">
        {sizes.map((size) => (
          <button
            key={`SIZE_${size}`}
            className={`px-1 rounded${(isSelected(size) && selectedStyles) || ""}`}
            onClick={() => selectedSize.set(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </>
  );
};

interface CropInfoProps {
  crop: ReactCrop.Crop;
  image?: HTMLImageElement | null;
}
/**
 * NOTE: if crop.unit is not pixels everything in here will probably be wrong.
 * Should not be a problem as long as the app uses pixels everywhere.
 */
const CropInfo = ({ crop, image }: CropInfoProps) => {
  const { ruleOfThirds, locked } = useCropOptions();
  if (!image) return <div data-info="no-image"></div>;

  const cropWidth = crop.width || 0;
  const cropHeight = crop.height || 0;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const width = cropWidth * scaleX;
  const height = cropHeight * scaleY;

  return (
    <div>
      <div>
        <div className="font-bold">Crop Size</div>
        <div>
          {width.toFixed(0)}x{height.toFixed(0)}
        </div>
      </div>

      <div className={"mt-1"}>
        <Tooltip label={"Toggle grid"} hasArrow closeOnMouseDown openDelay={1000}>
          <IconButton
            style={{ boxShadow: "none" }}
            variant={"ghost"}
            onClick={() => ruleOfThirds.set(!ruleOfThirds.value)}
            size={"sm"}
            aria-label={"Toggle grid"}
            icon={ruleOfThirds.value ? <MdGridOn size={"1.5em"} /> : <MdGridOff size={"1.5em"} />}
          />
        </Tooltip>

        <Tooltip label={"Toggle resizing"} hasArrow closeOnMouseDown openDelay={1000}>
          <IconButton
            style={{ boxShadow: "none" }}
            variant={"ghost"}
            onClick={() => locked.set(!locked.value)}
            size={"sm"}
            aria-label={"Toggle resizing"}
            icon={locked.value ? <MdLockOutline size={"1.5em"} /> : <MdLockOpen size={"1.5em"} />}
          />
        </Tooltip>
      </div>
    </div>
  );
};
