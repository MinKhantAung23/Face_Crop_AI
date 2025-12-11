import { useState } from "react";
import * as faceapi from "face-api.js";

const DPI = 96;
const HEAD_SCALE = 1.5;

interface CropOptions {
  widthInch?: number;
  heightInch?: number;
}

export interface CroppedImage {
  dataUrl: string;
  name: string;
}

export type CropMode = "main" | "all";

export const useFaceCrop = () => {
  const [faces, setFaces] = useState<CroppedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  const cropFaces = async (
    files: File[],
    options?: CropOptions,
    cropMode: CropMode = "main"
  ) => {
    setLoading(true);
    const results: CroppedImage[] = [];
    const failed: string[] = [];

    for (const file of files) {
      try {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        await new Promise((res) => (img.onload = res));

        const detections = await faceapi
          .detectAllFaces(img)
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (!detections.length) {
          failed.push(file.name);
          continue;
        }

        const facesToCrop =
          cropMode === "main"
            ? [
                detections
                  .map((det) => {
                    const box = det.detection.box;
                    const area = box.width * box.height;
                    const centerX = box.x + box.width / 2;
                    const centerY = box.y + box.height / 2;
                    const imgCenterX = img.width / 2;
                    const imgCenterY = img.height / 2;
                    const distance = Math.sqrt(
                      Math.pow(centerX - imgCenterX, 2) +
                        Math.pow(centerY - imgCenterY, 2)
                    );
                    return { det, area, distance };
                  })
                  .sort((a, b) => {
                    if (b.area !== a.area) return b.area - a.area;
                    return a.distance - b.distance;
                  })[0].det,
              ]
            : detections;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

        facesToCrop.forEach((faceDet, idx) => {
          const box = faceDet.detection.box;
          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;
          const newWidth = box.width * HEAD_SCALE;
          const newHeight = box.height * HEAD_SCALE;
          const x = Math.max(centerX - newWidth / 2, 0);
          const y = Math.max(centerY - newHeight / 2, 0);

          const outputWidth = options?.widthInch
            ? options.widthInch * DPI
            : newWidth;
          const outputHeight = options?.heightInch
            ? options.heightInch * DPI
            : newHeight;

          canvas.width = outputWidth;
          canvas.height = outputHeight;

          ctx.clearRect(0, 0, outputWidth, outputHeight);
          ctx.drawImage(
            img,
            x,
            y,
            newWidth,
            newHeight,
            0,
            0,
            outputWidth,
            outputHeight
          );

          results.push({
            dataUrl: canvas.toDataURL(),
            name:
              cropMode === "main"
                ? `${file.name.replace(/\.[^/.]+$/, "")}.png`
                : `${file.name.replace(/\.[^/.]+$/, "")}_face${idx + 1}.png`,
          });
        });
      } catch (error) {
        console.error(`ERROR in ${file.name}:`, error);
        failed.push(file.name);
      }
    }

    setFaces(results);
    setFailedImages(failed);
    setLoading(false);

    return failed;
  };

  return { faces, loading, cropFaces, failedImages };
};
