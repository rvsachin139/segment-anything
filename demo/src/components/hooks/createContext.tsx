// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import { createContext, Dispatch, SetStateAction } from "react";
import { modelInputProps } from "../helpers/Interfaces";

interface contextProps {
  clicks: [
    clicks: modelInputProps[] | null,
    setClicks: Dispatch<SetStateAction<modelInputProps[] | null>>
  ];
  image: [
    image: HTMLImageElement | null,
    setImage: Dispatch<SetStateAction<HTMLImageElement | null>>
  ];
  maskImg: [
    maskImg: HTMLImageElement | null,
    setMaskImg: Dispatch<SetStateAction<HTMLImageElement | null>>
  ];
}

const AppContext = createContext<contextProps | null>(null);

export default AppContext;
