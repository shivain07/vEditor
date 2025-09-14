import { useRef, useState, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import {
  Button,
  Label,
  Select,
  FileInput,
  Textarea,
  Spinner,
  Progress,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";
import { useForm } from "react-hook-form";
import TrimVideoComponent from "./TrimVideoComponent";
import { IoMdDownload } from "react-icons/io";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import VeditGif from "../assets/veditgif.gif";
import { BsCameraVideo } from "react-icons/bs";
import { availableFormats, filterOptions, fontOptions } from "../constants/fieldsConstant";
type FormValues = {
  videoFormat: string;
  filter?: string;
  font?: string;
  overlayImage?: FileList;
  textToAdd?: string;
  textPosition?: { x: string; y: string };
  textColor?: string;
};

// Record<K, T> is a utility type provided by TypeScript that defines an object type where:
// K = type of keys (typically string, number, or a union of string literals).
// T = type of the values.
// equivalent to
// type TextPos = {
//   [key: string]: {
//     x:string,
//     y:string
//   };
// };

const textPosition: Record<string, { x: string; y: string }> = {
  "Top Left": { x: "10", y: "10" },
  "Top Center": { x: "(w-text_w)/2", y: "10" },
  "Top Right": { x: "w-text_w-10", y: "10" },
  "Center Left": { x: "10", y: "(h-text_h)/2" },
  Center: { x: "(w-text_w)/2", y: "(h-text_h)/2" },
  "Center Right": { x: "w-text_w-10", y: "(h-text_h)/2" },
  "Bottom Left": { x: "10", y: "h-text_h-10" },
  "Bottom Center": { x: "(w-text_w)/2", y: "h-text_h-10" },
  "Bottom Right": { x: "w-text_w-10", y: "h-text_h-10" },
};

const MAX_PROCESSING_TIME = 5 * 60 * 1000; // 5 minutes in ms

function MainEditor() {
  const [isFFmpegReady, setIsFFmpegReady] = useState(false);
  const [inputVideoFilename, setInputVideoFilename] = useState<string>("");
  const ffmpegRef = useRef(new FFmpeg()); //et ffmpeg intance
  const {
    register,
    handleSubmit,
    getValues,
    formState: { isDirty, isSubmitted },
  } = useForm<FormValues>();
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [processingVideo, setProcessingVideo] = useState(false);
  const [outputFileToDownload, setOutputFileToDownload] = useState("");
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);
  const [videoDuration, setVideoDuration] = useState<number>(20);
  const [progress, setProgress] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [processingTimeoutId, setProcessingTimeoutId] = useState<null | number>(
    null
  );

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const baseURL =
          "https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/esm";

        const ffmpeg = ffmpegRef.current;

        // for logging
        // ffmpeg.on("log", ({ message }) => {
        //   console.log("FFmpeg log:", message);
        // });

        ffmpeg.on("progress",({progress})=>{
          let percentToComplete= progress*100;
          setProgress(percentToComplete);
        })

        await ffmpeg.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            "text/javascript"
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm"
          ),
          workerURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.worker.js`,
            "text/javascript"
          ),
        });

        // ✅ Test by running a simple command
        const result = await ffmpeg.exec(["-version"]);
        console.log("FFmpeg is ready 🎉", result);
        setIsFFmpegReady(true);
      } catch (error) {
        console.error("❌ FFmpeg initialization failed:", error);
      }
    };

    loadFFmpeg();
  }, []);

  useEffect(() => {
    if (isFFmpegReady) {
      loadFonts();
    }
  }, [isFFmpegReady]);

  useEffect(() => {
    if (processingTimeoutId && !processingVideo) {
      clearTimeout(processingTimeoutId);
      setProcessingTimeoutId(null);
      setShowErrorModal(false);
    }
  }, [processingVideo, processingTimeoutId]);

  const loadFonts = async () => {
    const ffmpeg = ffmpegRef.current;
    try {
      await ffmpeg.writeFile(
        "arial.ttf",
        await fetchFile(
          "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/arial.ttf"
        )
      );

      //   const response = await fetch("/fonts/HennyPenny-Regular.ttf");
      //   const fontBuffer = await response.arrayBuffer();

      await ffmpeg.writeFile(
        "henny.ttf",
        await fetchFile("/fonts/HennyPenny-Regular.ttf").then((res) => res)
      );

      await ffmpeg.writeFile(
        "kablamo.ttf",
        await fetchFile("/fonts/Kablammo-Regular.ttf").then((res) => res)
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]; // 1️⃣ get uploaded file
    if (file) {
      const mimeType = file.type; // e.g., "video/webm"
      // Extract extension from MIME type
      const extension = mimeType.split("/")[1]; // "webm", "mp4", etc.

      const videoBlob = URL.createObjectURL(file); // 2️⃣ create a temporary URL
      setPreviewVideo(videoBlob); // 3️⃣ update React state (to preview video)
      //   getting video metadeta
      const videoEl = document.createElement("video");
      videoEl.src = videoBlob;
      videoEl.onloadedmetadata = () => {
        setVideoDuration(videoEl.duration); // set total video duration
        setTrimRange([0, videoEl.duration]); // initialize range
      };

      const ffmpeg = ffmpegRef.current; // 4️⃣ get your FFmpeg instance
      const inputFileName = `input.${extension}`;
      setInputVideoFilename(inputFileName);
      await ffmpeg.writeFile(`${inputFileName}`, await fetchFile(videoBlob)); // 5️⃣ write file into FFmpeg’s virtual FS

      // FFmpeg WASM can’t access your computer’s files directly.
      // Instead, it has a virtual in-memory filesystem (like a sandbox).

      // ffmpeg.writeFile("input.avi", ...) writes the file into that sandbox FS.

      // fetchFile(videoBlob) converts your Blob URL into binary data that FFmpeg can understand.

      // So now inside FFmpeg’s virtual FS, you have a file called "input.avi", ready to be used as input:
    }
  };

  function constructFFmpegFilterString(values: FormValues): {
    videoFilter: string;
    otherFilterStr: string;
  } {
    const otherFilters: string[] = [];
    let videoFilter = "";
    // 1️⃣ Apply video filter (e.g., grayscale, negate)
    if (values.filter && values.filter !== "null") {
      videoFilter = values.filter;
    }

    // 2️⃣ Add image overlay if present
    if (values.overlayImage && values.overlayImage.length > 0) {
      // Assuming overlay image is already loaded into FFmpeg FS as 'overlay.png'
      otherFilters.push("overlay=10:10"); // Example fixed position; can be enhanced
    }

    // 3️⃣ Add text overlay if textToAdd exists
    if (values.textToAdd) {
      const fontPart = values.font ? `fontfile=/${values.font}.ttf` : "";
      // hard coding change later
      //   const fontPart = values.font ? `fontfile=/arial.ttf` : "";
      const position = values.textPosition
        ? `x=${textPosition[`${values.textPosition}`].x}:y=${
            textPosition[`${values.textPosition}`].y
          }`
        : "x=10:y=10"; // fallback position

      const fontColor = values.textColor || "#ffffff";

      const drawTextFilter = `drawtext=${fontPart}:text='${values.textToAdd}':${position}:fontsize=24:fontcolor=${fontColor}`;
      otherFilters.push(drawTextFilter);
    }

    let outputObj = {
      videoFilter,
      otherFilterStr: otherFilters.join(",") || "",
    };
    return outputObj;
  }

  const finalProcessing = async (filename: string) => {
    const ffmpeg = ffmpegRef.current;
    const data = await ffmpeg.readFile(filename);
    const type = `video/${filename.split(".")[1]}`; //"video/mp4"

    // 3️⃣ Create a Blob from binary data
    const blob = new Blob([(data as any).buffer], { type: type });

    // 4️⃣ Create a URL for preview / download
    const url = URL.createObjectURL(blob);

    setPreviewVideo(url);
    setProcessingVideo(false);
  };

  const executeFfmpeg = async ({
    videoOverlayFilter,
    otherChanges,
    videoFormatToChange,
  }: {
    videoOverlayFilter: string;
    otherChanges: string;
    videoFormatToChange: string;
  }) => {
    const ffmpeg = ffmpegRef.current;
    try {
      setProcessingVideo(true);
      const timeoutId = setTimeout(() => {
        setShowErrorModal(true);
        setProcessingVideo(false);
        ffmpeg.terminate();
      }, MAX_PROCESSING_TIME); // 5 minutes

      setProcessingTimeoutId(timeoutId);
      const [start, end] = trimRange;

      const extension = videoFormatToChange.toLowerCase();
      const outputFilename = `output.${extension}`;
      setOutputFileToDownload(outputFilename);

      // Determine codec options based on output format
      let codecArgs: string[] = [];
      if (extension === "mp4") {
        codecArgs = [
          "-c:v",
          "libx264",
          "-crf",
          "18",
          "-preset",
          "slow",
          "-pix_fmt",
          "yuv420p",
          "-c:a",
          "aac",
        ];
      } else if (extension === "webm") {
        codecArgs = ["-c:v", "libvpx", "-b:v", "5M", "-c:a", "libvorbis"]; // higher bitrate for better quality
      } else if (extension === "avi") {
        // will work with .avi files but browser can't play these files
        codecArgs = ["-c:v", "mpeg4", "-q:v", "1", "-c:a", "libmp3lame"]; // low q for highest quality
      } else {
        if (!availableFormats.includes(extension)) {
          throw new Error(`Unsupported output format: ${extension}`);
        }
      }

      // Step 1️⃣ Apply overlay filter if present
      let intermediateFilename = inputVideoFilename;
      let trimmed = false;
      if (videoOverlayFilter) {
        intermediateFilename = `vdOverlay.${extension}`;
        await ffmpeg.exec([
          "-i",
          inputVideoFilename,
          "-ss",
          start.toString(),
          "-to",
          end.toString(),
          "-vf",
          videoOverlayFilter,
          ...codecArgs,
          intermediateFilename,
        ]);
        trimmed = true;
      }

      // Step 2️⃣ Apply other changes
      const finalInput = videoOverlayFilter
        ? intermediateFilename
        : inputVideoFilename;

      if (trimmed) {
        await ffmpeg.exec([
          "-i",
          finalInput,
          "-vf",
          otherChanges || "null", // fallback to avoid empty string
          ...codecArgs,
          outputFilename,
        ]);
      } else {
        await ffmpeg.exec([
          "-i",
          finalInput,
          "-ss",
          start.toString(),
          "-to",
          end.toString(),
          "-vf",
          otherChanges || "null", // fallback to avoid empty string
          ...codecArgs,
          outputFilename,
        ]);
      }

      // Step 3️⃣ Final processing
      await finalProcessing(outputFilename);
    } catch (error) {
      console.error("FFmpeg processing error:", error);
      if (processingTimeoutId) {
        clearTimeout(processingTimeoutId);
      }
      setProcessingTimeoutId(null);
      setShowErrorModal(true);
      setProcessingVideo(false);
    }
  };

  // // 5️⃣ Trigger download programmatically
  // const a = document.createElement("a");
  // a.href = url;
  // a.download = "converted.mp4"; // filename when downloaded
  // document.body.appendChild(a);
  // a.click();
  // document.body.removeChild(a);

  const onSubmit = (formData: FormValues) => {
    // todo :>>>>>>
    // filter gets added to text color also
    // live preview
    // drag trim video ui
    // check timeout popup logic
    const changeStr = constructFFmpegFilterString(formData);

    if (changeStr.videoFilter || changeStr.otherFilterStr) {
      executeFfmpeg({
        videoOverlayFilter: changeStr.videoFilter,
        otherChanges: changeStr.otherFilterStr,
        videoFormatToChange: formData.videoFormat,
      });
    }
  };

  const downloadOutputVideo = () => {
    if (previewVideo && (isDirty || isSubmitted)) {
      const link = document.createElement("a");
      link.href = previewVideo;
      link.download = outputFileToDownload;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="px-6 max-w-5xl mx-auto">
      <div className="flex justify-center items-center gap-2 mb-2">
        <BsCameraVideo className="text-3xl font-extrabold text-blue-700 mt-1 hover:text-blue-800" />
        <h1 className="text-2xl font-extrabold text-blue-600 text-center">
          Simple Video Editor
        </h1>
      </div>
      <div className="text-center">
        {isFFmpegReady ? (
          <span className="text-green-600 font-semibold">
            Editor is Ready ✅
          </span>
        ) : (
          <div className="flex justify-center items-center gap-3 p-2">
            <img src={VeditGif} width={40} height={30} />
            <span className="text-yellow-600 font-semibold">
              Loading Editor...
            </span>
          </div>
        )}
      </div>

      <Modal
        show={showErrorModal}
        size="md"
        onClose={() => setShowErrorModal(false)}
        popup
      >
        <ModalHeader />
        <ModalBody className="px-6">
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-600 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400 flex flex-col">
              <span>Processing is taking too long or an error occurred.</span>
              <span>Please restart the process.</span>
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color={"red"}
                outline
                onClick={() => {
                  setShowErrorModal(false);
                  if (processingTimeoutId) {
                    clearTimeout(processingTimeoutId);
                  }
                  setProcessingTimeoutId(null);
                  window.location.reload();
                }}
              >
                Restart
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </Modal>

      <div className="">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-12 md:col-span-6 lg:col-span-8">
            <Label htmlFor="file-upload" className="mb-2">
              Upload Video
            </Label>

            <FileInput id="file-upload" onChange={handleVideoUpload} />
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-4">
            <Label htmlFor="videoFormat" className="mb-2">
              Video Export Format
            </Label>
            <Select
              id="videoFormat"
              {...register("videoFormat")}
              className="w-full"
            >
              {availableFormats.map((format) => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mb-4 mt-4 p-4 text-sm bg-blue-100 text-blue-800 rounded shadow-sm">
          ⚡️ For best in-browser playback, use <strong>MP4</strong> or{" "}
          <strong>WebM </strong>. ⚠️ Safari has known limitations with WebM. ❗️
          AVI format may not play in-browser but can be downloaded.
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div
            id="video-player-wrapper"
            className="col-span-12 md:col-span-6 lg:col-span-8 bg-gray-100 p-4 rounded-lg shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4">Video Preview</h2>

            {previewVideo && getValues("videoFormat") === "avi" && (
              <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded shadow-sm text-center">
                ⚠️ AVI format is not supported for in-browser playback. You can
                download it and play using a desktop player.
              </div>
            )}

            <div className="relative">
              {previewVideo ? (
                <>
                  <video
                    controls
                    src={previewVideo}
                    className="w-full rounded shadow"
                  />
                  <TrimVideoComponent
                    trimRange={trimRange}
                    setTrimRange={setTrimRange}
                    videoDuration={videoDuration}
                  />
                </>
              ) : (
                <p className="text-gray-500">No preview available yet.</p>
              )}

              {processingVideo && (
                <div
                  className="absolute inset-0 flex flex-col justify-center items-center rounded"
                  style={{ backgroundColor: "rgba(128, 90, 213, 0.2)" }}
                >
                  <Spinner aria-label="Processing video spinner" />
                  <span className="mt-2 text-white font-medium">
                    Processing Video...
                  </span>
                </div>
              )}
            </div>
          </div>

          <div
            id="filters-wrapper"
            className="col-span-12 md:col-span-6 lg:col-span-4"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12">
                  <Label htmlFor="textToAdd" className="mb-2">
                    Text to Overlay
                  </Label>
                  <Textarea
                    id="textToAdd"
                    {...register("textToAdd")}
                    placeholder="Enter text..."
                    rows={1}
                  />
                </div>

                <div className="col-span-5">
                  <Label htmlFor="textPosition" className="mb-2">
                    Text Position
                  </Label>
                  <Select id="textPosition" {...register("textPosition")}>
                    {Object.keys(textPosition).map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="col-span-5">
                  <Label htmlFor="font" className="mb-2">
                    Font
                  </Label>
                  <Select id="font" {...register("font")}>
                    {fontOptions.map((font) => (
                      <option
                        key={font}
                        value={font}
                        className={`${font}-text`}
                      >
                        {font}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="textColor" className="mb-2">
                    Color
                  </Label>
                  <input
                    type="color"
                    {...register("textColor")}
                    className="w-full h-12 p-2 border-none rounded"
                  />
                </div>

                <div className="col-span-12">
                  <Label htmlFor="filter" className="mb-2">
                    Video Filter
                  </Label>
                  <Select id="filter" {...register("filter")}>
                    {filterOptions.map((opt) => (
                      <option key={opt.label} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {processingVideo && (
                <>
                  <Progress
                    progress={progress}
                    progressLabelPosition="inside"
                    textLabel="Applying modifications"
                    textLabelPosition="outside"
                    size="lg"
                    labelProgress
                    labelText
                  />
                </>
              )}

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={!previewVideo}>
                  Apply Changes
                </Button>

                {previewVideo && (
                  <Button
                    onClick={downloadOutputVideo}
                    disabled={progress < 100}
                    color={"green"}
                  >
                    <IoMdDownload className="mr-2" />
                    Download Video
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainEditor;
