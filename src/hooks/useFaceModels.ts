import { useEffect, useState } from "react";
import * as faceapi from "face-api.js";

export const useFaceModels = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          await faceapi.nets.ssdMobilenetv1.loadFromUri("./models"),
          await faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          await faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setLoaded(true);
      } catch (error) {
        console.error("Model load error:", error);
      }
    };
    load();
  }, []);

  return loaded;
};
