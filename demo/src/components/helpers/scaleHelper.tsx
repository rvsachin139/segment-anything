// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// Helper function for handling image scaling needed for SAM
const handleImageScale = (image: HTMLImageElement) => {
  // Input images to SAM must be resized so the longest side is 1024
  const LONG_SIDE_LENGTH = 1024;
  const origW = image.naturalWidth;
  const origH = image.naturalHeight;
  const samScale = LONG_SIDE_LENGTH / Math.max(origH, origW);
  const resizedW = origW * samScale;
  const resizedH = origH * samScale;
  const padW = Math.round((LONG_SIDE_LENGTH - resizedW) / 2);
  const padH = Math.round((LONG_SIDE_LENGTH - resizedH) / 2);
  return {
    height: origH,
    width: origW,
    samScale,
    resizedHeight: resizedH,
    resizedWidth: resizedW,
    padTop: padH,
    padLeft: padW,
  };
};

export { handleImageScale };
