// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import React, { useContext, useRef } from "react";
import Tool from "./Tool";
import { modelInputProps } from "./helpers/Interfaces";
import AppContext from "./hooks/createContext";
import { RefObject } from "react";

const Stage = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const {
    clicks: [, setClicks],
    image: [image],
  } = useContext(AppContext)!;

  const getClick = (
    x: number,
    y: number,
    clickType: number
  ): modelInputProps => {
    return { x, y, clickType };
  };

  // Get mouse position and scale the (x, y) coordinates back to the natural
  // scale of the image. Update the state of clicks with setClicks to trigger
  // the ONNX model to run and generate a new mask via a useEffect in App.tsx
  const handleClick = (
    e: React.MouseEvent<HTMLImageElement>,
    clickType: number
  ) => {
    e.preventDefault();
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;
    const click = getClick(x, y, clickType);
    if (click)
      setClicks((prev: modelInputProps[] | null) => [...(prev || []), click]);
  };

  const handleLeftClick = (e: React.MouseEvent<HTMLImageElement>) => {
    handleClick(e, 1); // Foreground
  };

  const handleRightClick = (e: React.MouseEvent<HTMLImageElement>) => {
    handleClick(e, 0); // Background
  };

  const flexCenterClasses = "flex items-center justify-center relative";
  return (
    <div ref={stageRef} className={`${flexCenterClasses} w-full h-full`}>
      <Tool
        handleLeftClick={handleLeftClick}
        handleRightClick={handleRightClick}
        stageRef={stageRef as RefObject<HTMLDivElement>}
      />
    </div>
  );
};

export default Stage;
