// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// Convert the onnx model mask prediction to ImageData
function arrayToImageData(input: any, width: number, height: number) {
  const [r, g, b, a] = [0, 114, 189, 255]; // the masks's blue color
  const arr = new Uint8ClampedArray(4 * width * height).fill(0);
  for (let i = 0; i < input.length; i++) {
    // Threshold the onnx model mask prediction at 0.0
    // This is equivalent to thresholding the mask using predictor.model.mask_threshold
    // in python
    if (input[i] > 0.0) {
      arr[4 * i + 0] = r;
      arr[4 * i + 1] = g;
      arr[4 * i + 2] = b;
      arr[4 * i + 3] = a;
    }
  }
  return new ImageData(arr, height, width);
}

// Use a Canvas element to produce an image from ImageData
function imageDataToImage(imageData: ImageData) {
  const canvas = imageDataToCanvas(imageData);
  const image = new Image();
  image.src = canvas.toDataURL();
  return image;
}

// Canvas elements can be created from ImageData
function imageDataToCanvas(imageData: ImageData) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx?.putImageData(imageData, 0, 0);
  return canvas;
}

// Upsample low-res mask to original image size with proper scaling and cropping
function upsampleMaskToOriginal(
  lowResCanvas: HTMLCanvasElement,
  modelScale: any
) {
  // Upsample to 1024x1024
  const upsampledCanvas = document.createElement("canvas");
  upsampledCanvas.width = 1024;
  upsampledCanvas.height = 1024;
  const upsampledCtx = upsampledCanvas.getContext("2d")!;
  upsampledCtx.drawImage(
    lowResCanvas,
    0,
    0,
    lowResCanvas.width,
    lowResCanvas.height,
    0,
    0,
    1024,
    1024
  );

  // Crop padding to resized size
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = modelScale.resizedWidth;
  croppedCanvas.height = modelScale.resizedHeight;
  const croppedCtx = croppedCanvas.getContext("2d")!;
  croppedCtx.drawImage(
    upsampledCanvas,
    modelScale.padLeft,
    modelScale.padTop,
    modelScale.resizedWidth,
    modelScale.resizedHeight,
    0,
    0,
    modelScale.resizedWidth,
    modelScale.resizedHeight
  );

  // Scale to original size
  const originalCanvas = document.createElement("canvas");
  originalCanvas.width = modelScale.width;
  originalCanvas.height = modelScale.height;
  const originalCtx = originalCanvas.getContext("2d")!;
  originalCtx.drawImage(
    croppedCanvas,
    0,
    0,
    modelScale.resizedWidth,
    modelScale.resizedHeight,
    0,
    0,
    modelScale.width,
    modelScale.height
  );

  return originalCanvas;
}

// Convert the onnx model mask output to an HTMLImageElement
export function onnxMaskToImage(
  input: any,
  lowResWidth: number,
  lowResHeight: number,
  modelScale: any
) {
  const lowResImageData = arrayToImageData(input, lowResWidth, lowResHeight);
  const lowResCanvas = imageDataToCanvas(lowResImageData);
  const upsampledCanvas = upsampleMaskToOriginal(lowResCanvas, modelScale);
  const image = new Image();
  image.src = upsampledCanvas.toDataURL();
  return image;
}
