/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as blog from "../blog.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as images from "../images.js";
import type * as lib_crypto from "../lib/crypto.js";
import type * as lib_github from "../lib/github.js";
import type * as llm from "../llm.js";
import type * as pipeline from "../pipeline.js";
import type * as settings from "../settings.js";
import type * as topics from "../topics.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  blog: typeof blog;
  crons: typeof crons;
  http: typeof http;
  images: typeof images;
  "lib/crypto": typeof lib_crypto;
  "lib/github": typeof lib_github;
  llm: typeof llm;
  pipeline: typeof pipeline;
  settings: typeof settings;
  topics: typeof topics;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
