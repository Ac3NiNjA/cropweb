import { useDropzone } from "react-dropzone";
import {
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useToast,
} from "@chakra-ui/react";
import { MdDownload, MdLink, MdPhoto } from "react-icons/md";
import { useState } from "react";
import { toBase64 } from "@utils";
import { OnPreparedImageFn } from "@src/types";

type UseImageInputProps = { onPreparedImage: OnPreparedImageFn };
export const useImageInput = ({ onPreparedImage }: UseImageInputProps) => {
  const toast = useToast();
  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted: ([file]) => onInput(file, file.name),
    accept: "image/*",
    multiple: false,
  });

  const onInput = async (fileOrBlob: File | Blob, name: string) => {
    if (!fileOrBlob?.type.startsWith("image/")) {
      toast({ description: "Not a valid image", status: "warning" });
      return;
    }

    const b64 = await toBase64(fileOrBlob);
    if (typeof b64 !== "string") {
      toast({
        description: `toBase64() returned ${typeof b64}, expected string`,
        status: "error",
      });
      return;
    }

    onPreparedImage(b64, name);
  };

  return { getRootProps, getInputProps, onInput };
};

type ImageDropzoneProps = {
  onPreparedImage: OnPreparedImageFn;
  visible?: boolean;
};
export const ImageDropzone = ({ onPreparedImage, visible }: ImageDropzoneProps) => {
  const { getInputProps, getRootProps, onInput } = useImageInput({ onPreparedImage });

  if (!visible) return <></>;

  return (
    <div className="font-bold text-lg">
      {/* Drag n Drop area */}
      <div
        className={"flex items-center justify-center cursor-pointer select-none mt-[19vh]"}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <MdPhoto className="-ml-2.5" size={"96px"} />
        Click or drag an image here
      </div>

      {/* Fetch image from URL */}
      <FromUrl onInput={onInput} />
    </div>
  );
};

const FromUrl = ({ onInput }: { onInput: (f: Blob, name: string) => Promise<void> }) => {
  const toast = useToast();
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const canFetch = url.startsWith("http") && !fetching;

  const fetchImage = async () => {
    if (!canFetch) return;
    try {
      setFetching(true);
      const blob = await (await fetch(url)).blob();
      const pathname = new URL(url).pathname;
      const sIndex = pathname.lastIndexOf("/");
      const name = sIndex < 0 ? pathname : pathname.substring(sIndex + 1);
      onInput(blob, name);
    } catch (error) {
      console.error("Error Loading Image", error);
      // TODO: show hint if cors error, or .. fallback to proxy?
      toast({
        title: "Error Loading Image",
        description: (error as Error)?.message || "Unknown Error",
        status: "error",
      });
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className={"pt-1"}>
      <FormLabel htmlFor="urlinput">From URL</FormLabel>
      {/* TODO: history */}
      <InputGroup w={[310, 400, 500]}>
        <InputLeftElement pointerEvents="none" children={<MdLink size={"1.2em"} />} />
        <Input
          type="url"
          id="urlinput"
          placeholder="https://example.com/image.jpg"
          aria-label={"URL to image"}
          value={url}
          onChange={(evt) => setUrl(evt.target.value)}
          onDrop={(evt) => setUrl(evt.dataTransfer.getData("text"))}
          onKeyPress={(evt) => evt.key === "Enter" && fetchImage()}
        />
        <InputRightElement
          children={
            <IconButton
              disabled={!canFetch}
              variant={"ghost"}
              aria-label={"Load image from URL"}
              icon={<MdDownload size={"1.2em"} />}
              onClick={fetchImage}
            />
          }
        />
      </InputGroup>
    </div>
  );
};

export default ImageDropzone;
