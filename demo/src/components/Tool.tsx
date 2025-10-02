// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import React, { useContext, useEffect, useState, useRef } from "react";
import AppContext from "./hooks/createContext";
import { ToolProps } from "./helpers/Interfaces";
import * as _ from "underscore";

const Tool = ({ handleMouseMove }: ToolProps) => {
  const {
    image: [image],
    maskImg: [maskImg],
  } = useContext(AppContext)!;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Determine if we should shrink or grow the images to match the
  // width or the height of the page and setup a ResizeObserver to
  // monitor changes in the size of the page
  const [shouldFitToWidth, setShouldFitToWidth] = useState(true);
  const bodyEl = document.body;
  const fitToPage = () => {
    if (!image) return;
    const imageAspectRatio = image.width / image.height;
    const screenAspectRatio = window.innerWidth / window.innerHeight;
    setShouldFitToWidth(imageAspectRatio > screenAspectRatio);
  };
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === bodyEl) {
        fitToPage();
      }
    }
  });
  useEffect(() => {
    fitToPage();
    resizeObserver.observe(bodyEl);
    return () => {
      resizeObserver.unobserve(bodyEl);
    };
  }, [image]);

  useEffect(() => {
    if (maskImg && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = maskImg.width;
        canvasRef.current.height = maskImg.height;
        ctx.drawImage(maskImg, 0, 0);
      }
    }
  }, [maskImg]);

  // Render the image and a canvas on top
  return (
    <>
      {image && (
        <img
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseMove}
          src={image.src}
          className={`${
            shouldFitToWidth ? "w-full" : "h-full"
          } object-contain`}
        ></img>
      )}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.4,
          pointerEvents: "none",
          zIndex: 10,
        }}
      ></canvas>
    </>
  );
};

export default Tool;