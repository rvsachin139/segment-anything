// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// production config
import { merge } from "webpack-merge";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import Dotenv from "dotenv-webpack";
import commonConfig from "./common.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default merge(commonConfig, {
  mode: "production",
  output: {
    filename: "js/bundle.[contenthash].min.js",
    path: resolve(__dirname, "../../dist"),
    publicPath: "/",
  },
  devtool: "source-map",
  plugins: [new Dotenv()],
});