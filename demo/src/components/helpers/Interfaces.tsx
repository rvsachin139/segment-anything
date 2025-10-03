// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import { Tensor } from "onnxruntime-web";

export interface modelScaleProps {
  samScale: number;
  height: number;
  width: number;
  resizedHeight: number;
  resizedWidth: number;
  padTop: number;
  padLeft: number;
}

export interface modelInputProps {
  x: number;
  y: number;
  clickType: number;
}

export interface modeDataProps {
  clicks?: Array<modelInputProps>;
  tensor: Tensor;
  modelScale: modelScaleProps;
}

import { RefObject } from "react";

export interface ToolProps {
  handleLeftClick: (e: React.MouseEvent<HTMLImageElement>) => void;
  handleRightClick: (e: React.MouseEvent<HTMLImageElement>) => void;
  stageRef: RefObject<HTMLDivElement>;
}
