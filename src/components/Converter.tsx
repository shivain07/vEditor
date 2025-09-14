import { useRef, useState, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import {
  Button,
  Label,
  Select,
  FileInput,
  Progress,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";
import { useForm } from "react-hook-form";
import { IoMdDownload } from "react-icons/io";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import VeditGif from "../assets/veditgif.gif";
import { SiConvertio } from "react-icons/si";
import { IoInformationCircle } from "react-icons/io5";
import { supportedFormatsToConvert } from "../constants/fieldsConstant";
type FormValues = {
  videoFormat: string;
};

const MAX_PROCESSING_TIME = 5 * 60 * 1000; // 5 minutes in ms

function Converter() {
  const [isFFmpegReady, setIsFFmpegReady] = useState(false);
  const [inputVideoFilename, setInputVideoFilename] = useState<string>("");
  const ffmpegRef = useRef(new FFmpeg()); //set ffmpeg intance
  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitted },
  } = useForm<FormValues>();
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [processingVideo, setProcessingVideo] = useState(false);
  const [outputFileToDownload, setOutputFileToDownload] = useState("");
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

        ffmpeg.on("progress", ({ progress }) => {
          const percent = Math.floor(progress * 100); // Convert to percentage
          setProgress(percent);
        });

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
    if (processingTimeoutId && !processingVideo) {
      clearTimeout(processingTimeoutId);
      setProcessingTimeoutId(null);
      setShowErrorModal(false);
    }
  }, [processingVideo, processingTimeoutId]);

  const handleVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]; // 1️⃣ get uploaded file
    if (file) {
      const mimeType = file.type; // e.g., "video/webm"
      // Extract extension from MIME type
      const extension = mimeType.split("/")[1]; // "webm", "mp4", etc.

      const videoBlob = URL.createObjectURL(file); // 2️⃣ create a temporary URL

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

  const finalProcessing = async (filename: string) => {
    const ffmpeg = ffmpegRef.current;
    const data = await ffmpeg.readFile(filename);
    const type = `video/${filename.split(".")[1]}`; //"video/mp4"

    // 3️⃣ Create a Blob from binary data
    const blob = new Blob([data.buffer], { type: type });

    // 4️⃣ Create a URL for preview / download
    const url = URL.createObjectURL(blob);

    setPreviewVideo(url);
    setProcessingVideo(false);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename; // filename when downloaded
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const executeFfmpeg = async ({
    videoFormatToChange,
  }: {
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

      const extension = videoFormatToChange.toLowerCase();
      const outputFilename = `output.${extension}`;
      setOutputFileToDownload(outputFilename);

      await ffmpeg.exec(["-i", inputVideoFilename, outputFilename]);
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

  const onSubmit = (formData: FormValues) => {
    executeFfmpeg({ videoFormatToChange: formData.videoFormat });
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
        <SiConvertio className="text-3xl font-extrabold text-blue-700 mt-1 hover:text-blue-800" />
        <h1 className="text-2xl font-extrabold text-blue-600 text-center">
          Convert file types
        </h1>
      </div>
      <div className="text-center">
        {isFFmpegReady ? (
          <span className="text-green-600 font-semibold">
            Converter is Ready ✅
          </span>
        ) : (
          <div className="flex justify-center items-center gap-3 p-2">
            <img src={VeditGif} width={40} height={30} />
            <span className="text-yellow-600 font-semibold">
              Loading Converter...
            </span>
          </div>
        )}
      </div>

      <div className="mb-4 mt-4 p-4 text-sm bg-blue-100 text-blue-800 rounded shadow-sm flex gap-1">
        <IoInformationCircle size={20} />
        <span>
          Supported format include:{" "}
          {supportedFormatsToConvert.map((format) => (
            <strong className="p-1" key={format}>
              {format}
            </strong>
          ))}
        </span>
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
              Format To Convert
            </Label>
            <Select
              id="videoFormat"
              {...register("videoFormat")}
              className="w-full"
            >
              {supportedFormatsToConvert.map((format) => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
      
      <div>
        {processingVideo && (
          <>
            <Progress
              progress={progress}
              progressLabelPosition="inside"
              textLabel="Converting file"
              textLabelPosition="outside"
              size="lg"
              labelProgress
              labelText
            />
          </>
        )}
      </div>

      {previewVideo && !processingVideo && (
        <div className="my-4">
          <div className="p-4 bg-blue-100 text-blue-800 rounded-md text-center">
            🎉 Conversion complete! Your download will start automatically.
            <br />
            Alternatively, you can click the{" "}
            <span className="font-semibold">Download Video</span> button below.
          </div>
        </div>
      )}

      <div className="flex justify-center gap-2 py-2 mt-6">
        <Button onClick={handleSubmit(onSubmit)} disabled={processingVideo}>
          Convert file
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
    </div>
  );
}

export default Converter;
