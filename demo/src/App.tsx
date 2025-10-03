// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import ort, { InferenceSession, Tensor } from "onnxruntime-web";
import React, { useContext, useEffect, useState } from "react";
import "./assets/scss/App.scss";
import { handleImageScale } from "./components/helpers/scaleHelper";
import { modelScaleProps } from "./components/helpers/Interfaces";
import { onnxMaskToImage } from "./components/helpers/maskUtils";
import { modelData } from "./components/helpers/onnxModelAPI";
import Stage from "./components/Stage";
import AppContext from "./components/hooks/createContext";
/* @ts-ignore */
import npyjs from "npyjs";

// Define image, embedding and model paths
const IMAGE_PATH = "/assets/data/dogs.jpg";
const IMAGE_EMBEDDING = "/assets/data/dogs_embedding.npy";
// The ONNX model is a static asset in the public directory.
// It should be loaded via a simple relative URL string, not an import.
const MODEL_DIR = "/model/sam_onnx_quantized_example.onnx";

const App = () => {
  const {
    clicks: [clicks],
    image: [, setImage],
    maskImg: [, setMaskImg],
  } = useContext(AppContext)!;
  const [model, setModel] = useState<InferenceSession | null>(null); // ONNX model
  const [tensor, setTensor] = useState<Tensor | null>(null); // Image embedding tensor

  // The ONNX model expects the input to be rescaled to 1024.
  // The modelScale state variable keeps track of the scale values.
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);

  // Initialize the ONNX model. load the image, and load the SAM
  // pre-computed image embedding
  useEffect(() => {
    console.log("Initializing model, loading image and embedding...");

    // Initialize the ONNX model
    const initModel = async () => {
      try {
        if (MODEL_DIR === undefined) return;
        const response = await fetch(MODEL_DIR);
        const modelBuffer = await response.arrayBuffer();
        const modelUint8Array = new Uint8Array(modelBuffer);
        ort.env.wasm.wasmPaths = "/js/";
        const model = await InferenceSession.create(modelUint8Array, {
          executionProviders: ["webgl", "wasm"],
        });
        setModel(model);
      } catch (e) {
        console.error(e);
      }
    };
    initModel();

    // Load the image
    const url = new URL(IMAGE_PATH, location.origin);
    console.log("Loading image from:", url.href);
    loadImage(url);

    // Load the Segment Anything pre-computed embedding
    console.log("Loading embedding from:", IMAGE_EMBEDDING);
    Promise.resolve(loadNpyTensor(IMAGE_EMBEDDING))
      .then((embedding) => {
        console.log("Embedding loaded successfully");
        setTensor(embedding);
      })
      .catch((error) => {
        console.error("Error loading embedding:", error);
      });
  }, []);

  const loadImage = async (url: URL) => {
    try {
      const img = new Image();
      img.src = url.href;
      img.onload = () => {
        console.log("Image loaded successfully:", img.src);
        const {
          height,
          width,
          samScale,
          resizedHeight,
          resizedWidth,
          padTop,
          padLeft,
        } = handleImageScale(img);
        console.log("Image dimensions:", width, "x", height);
        setModelScale({
          height, // original image height
          width, // original image width
          samScale, // scaling factor for image which has been resized to longest side 1024
          resizedHeight,
          resizedWidth,
          padTop,
          padLeft,
        });
        setImage(img);
      };
      img.onerror = () => {
        console.error("Error loading image:", url.href);
      };
    } catch (error) {
      console.error("Error in loadImage:", error);
    }
  };

  // Decode a Numpy file into a tensor.
  const loadNpyTensor = async (tensorFile: string) => {
    try {
      console.log("Loading numpy tensor from:", tensorFile);
      let npLoader = new npyjs();
      const npArray = await npLoader.load(tensorFile);
      console.log("Numpy array loaded, shape:", npArray.shape);
      const tensor = new Tensor("float32", npArray.data, npArray.shape);
      return tensor;
    } catch (error) {
      console.error("Error loading numpy tensor:", error);
      throw error;
    }
  };

  // Run the ONNX model every time clicks has changed
  useEffect(() => {
    runONNX();
  }, [clicks]);

  const runONNX = async () => {
    console.log("runONNX called with clicks:", clicks);
    try {
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      ) {
        console.log("runONNX skipped - missing required data:", {
          model: model === null ? "null" : "loaded",
          clicks: clicks === null ? "null" : "set",
          tensor: tensor === null ? "null" : "loaded",
          modelScale: modelScale === null ? "null" : "set",
        });
        return;
      } else {
        console.log("All data available, running model...");
        // Preapre the model input in the correct format for SAM.
        // The modelData function is from onnxModelAPI.tsx.
        const feeds = modelData({
          clicks,
          tensor,
          modelScale,
        });
        if (feeds === undefined) {
          console.log("Feeds undefined, returning");
          return;
        }
        console.log("Model feeds prepared");
        // Run the SAM ONNX model with the feeds returned from modelData()
        const results = await model.run(feeds);
        console.log("Model run completed");
        const output = results[model.outputNames[0]];
        console.log("Model output dimensions:", output.dims);
        // The predicted mask returned from the ONNX model is an array which is
        // rendered as an HTML image using onnxMaskToImage() from maskUtils.tsx.
        const maskImage = onnxMaskToImage(
          output.data,
          output.dims[2],
          output.dims[3],
          modelScale
        );
        console.log(
          "Mask image created:",
          maskImage.src ? "has src" : "no src"
        );
        setMaskImg(maskImage);
      }
    } catch (e) {
      console.error("Error in runONNX:", e);
    }
  };

  return <Stage />;
};

export default App;
