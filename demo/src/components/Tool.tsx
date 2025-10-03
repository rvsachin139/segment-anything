// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import React, { useContext, useEffect, useState, useRef } from "react";
import AppContext from "./hooks/createContext";
import { ToolProps, modelInputProps } from "./helpers/Interfaces";

const Tool = ({ handleLeftClick, handleRightClick, stageRef }: ToolProps) => {
  const {
    image: [image],
    maskImg: [maskImg],
    clicks: [clicks],
  } = useContext(AppContext)!;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

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

  // Draw mask and click points on canvas overlaying the image
  useEffect(() => {
    if (!imageRef.current || !stageRef?.current || !canvasRef.current || !image)
      return;

    const imgRect = imageRef.current.getBoundingClientRect();
    const stageRect = stageRef.current.getBoundingClientRect();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Position canvas over the image
    const left = imgRect.left - stageRect.left;
    const top = imgRect.top - stageRect.top;
    canvas.style.position = "absolute";
    canvas.style.left = `${left}px`;
    canvas.style.top = `${top}px`;
    canvas.style.width = `${imgRect.width}px`;
    canvas.style.height = `${imgRect.height}px`;
    canvas.style.opacity = "0.4";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "10";

    // Set canvas dimensions accounting for device pixel ratio
    canvas.width = imgRect.width * dpr;
    canvas.height = imgRect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, imgRect.width, imgRect.height);

    // Draw mask if exists
    if (maskImg) {
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      ctx.drawImage(
        maskImg,
        0,
        0,
        naturalWidth,
        naturalHeight,
        0,
        0,
        imgRect.width,
        imgRect.height
      );
    }

    // Draw points if exist
    if (clicks && clicks.length > 0) {
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;

      clicks.forEach((click: modelInputProps) => {
        const displayedX = (click.x / naturalWidth) * imgRect.width;
        const displayedY = (click.y / naturalHeight) * imgRect.height;

        ctx.beginPath();
        ctx.arc(displayedX, displayedY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = click.clickType === 1 ? "green" : "red";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, [maskImg, clicks, image, stageRef]);

  // Render the image and a canvas on top
  return (
    <>
      {image && (
        <img
          ref={imageRef}
          onClick={handleLeftClick}
          onContextMenu={handleRightClick}
          src={image.src}
          className={`${shouldFitToWidth ? "w-full" : "h-full"} object-contain`}
        />
      )}
      <canvas ref={canvasRef} />
    </>
  );
};

export default Tool;
