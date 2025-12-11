import { useEffect, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import { useFaceModels } from "../../hooks/useFaceModels";
import { useFaceCrop } from "../../hooks/useFaceCrop";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageCrop from "../../assets/cropper.png";

const FaceCropper: React.FC = () => {
  const modelsReady = useFaceModels();
  const { faces, cropFaces, loading, failedImages } = useFaceCrop();

  const [inputFiles, setInputFiles] = useState<File[]>([]);
  const [folderName, setFolderName] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(null);
  const [cropMode, setCropMode] = useState<"main" | "all">("main");

  const [widthInch, setWidthInch] = useState<number | undefined>();
  const [heightInch, setHeightInch] = useState<number | undefined>();

  useEffect(() => {
    if (failedImages.length > 0) {
      failedImages.forEach((name, idx) => {
        toast.error(
          `Failed to detect face in: ${name} (${idx + 1}/${
            failedImages.length
          })`,
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
      });
    }
  }, [failedImages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const arr = Array.from(files);
    setInputFiles(arr);

    const first = arr[0];

    // Detect folder
    if ((first as any).webkitRelativePath) {
      const path = (first as any).webkitRelativePath.split("/")[0];
      setFolderName(path || "folder");
    }

    // Detect ZIP file
    if (first.name.endsWith(".zip")) {
      setFolderName(first.name.replace(".zip", ""));
      const zip = await JSZip().loadAsync(first);

      const extractedFiles: File[] = [];
      const promises: Promise<void>[] = [];

      zip.forEach((_, file) => {
        if (!file.dir) {
          promises.push(
            file.async("blob").then((blob) => {
              extractedFiles.push(new File([blob], file.name));
            })
          );
        }
      });

      await Promise.all(promises);
      setInputFiles(extractedFiles);
      setPreview(null);
      return;
    }

    // Single image preview
    if (arr.length === 1) {
      setPreview(URL.createObjectURL(arr[0]));
    } else {
      setPreview(null);
    }
  };

  const handleDetect = () => {
    if (inputFiles.length === 0) return;
    cropFaces(inputFiles, { widthInch, heightInch }, cropMode);
  };
  const downloadAll = async () => {
    const zip = new JSZip();

    faces.forEach((f) => {
      const base64 = f.dataUrl.split(",")[1];
      zip.file(f.name, base64, { base64: true });
    });

    const blob = await zip.generateAsync({ type: "blob" });

    const name = folderName ? `${folderName}_cropped.zip` : "cropped_faces.zip";

    saveAs(blob, name);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 select-none cursor-pointer">
      <ToastContainer />

      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4">
          <img src={ImageCrop} alt="image_cropper" className="size-8"/>
          <h1 className="text-3xl font-bold">Face Crop App</h1>
        </div>
        <p className="text-gray-600">
          Upload images or folders → Detect faces → Crop instantly
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4 border border-gray-200">
        <h2 className="font-semibold text-lg mb-2">Upload Images</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex flex-col text-sm font-medium gap-1">
            Upload Files / ZIP
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.zip"
              onChange={handleUpload}
              className="border p-2 rounded bg-gray-50"
            />
          </label>

          <label className="flex flex-col text-sm font-medium gap-1">
            Upload Folder
            <input
              type="file"
              // @ts-ignore
              webkitdirectory="true"
              directory=""
              onChange={handleUpload}
              className="border p-2 rounded bg-gray-50"
            />
          </label>
        </div>

        {/* Preview */}
        {preview && (
          <div className="pt-4">
            <h3 className="font-medium mb-1">Preview</h3>
            <img
              src={preview}
              className="w-36 h-36 object-cover rounded shadow-md"
            />
          </div>
        )}
      </div>

      {/* Crop Options */}
      <div className="bg-white shadow rounded-xl p-6 space-y-4 border border-gray-200">
        <h2 className="font-semibold text-lg mb-2">Cropping Options</h2>

        {/* Radio Selection */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={cropMode === "main"}
              onChange={() => setCropMode("main")}
            />
            Auto crop main person
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={cropMode === "all"}
              onChange={() => setCropMode("all")}
            />
            Crop all faces
          </label>
        </div>

        {/* Inches Inputs */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <input
            type="number"
            placeholder="Width (inches)"
            value={widthInch ?? ""}
            onChange={(e) =>
              setWidthInch(
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            className="border p-2 rounded bg-gray-50"
          />

          <input
            type="number"
            placeholder="Height (inches)"
            value={heightInch ?? ""}
            onChange={(e) =>
              setHeightInch(
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            className="border p-2 rounded bg-gray-50"
          />
        </div>

        <button
          disabled={!modelsReady || loading || inputFiles.length === 0}
          onClick={handleDetect}
          className={`w-full py-3 rounded-lg text-white font-medium transition ${
            !modelsReady || loading || inputFiles.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Detecting faces..." : "Detect & Crop Faces"}
        </button>
      </div>

      <div className="border-t pt-6"></div>

      {/* Cropped Results */}
      {faces.length > 0 && (
        <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">
              Cropped Faces ({faces.length})
            </h3>

            <button
              onClick={downloadAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Download ZIP
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {faces.map((f) => (
              <div
                key={f.name}
                className="flex flex-col items-center gap-2 p-2 rounded-lg border bg-gray-50 shadow"
              >
                <img
                  src={f.dataUrl}
                  className="w-32 h-32 object-cover rounded shadow"
                  alt={f.name}
                />
                <span className="text-sm font-medium truncate w-full text-center">
                  {f.name}
                </span>

                <a
                  href={f.dataUrl}
                  download={f.name}
                  className="text-blue-600 text-sm underline"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceCropper;
