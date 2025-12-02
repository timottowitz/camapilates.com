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
import type * as aiImages from "../aiImages.js";
import type * as appSettings from "../appSettings.js";
import type * as blog from "../blog.js";
import type * as blogs from "../blogs.js";
import type * as cache from "../cache.js";
import type * as certificationPreRegistrations from "../certificationPreRegistrations.js";
import type * as cities from "../cities.js";
import type * as contextualGeneration from "../contextualGeneration.js";
import type * as crons from "../crons.js";
import type * as googlePlaces from "../googlePlaces.js";
import type * as http from "../http.js";
import type * as imageGeneration from "../imageGeneration.js";
import type * as images from "../images.js";
import type * as lib_crypto from "../lib/crypto.js";
import type * as lib_github from "../lib/github.js";
import type * as lib_googleAuth from "../lib/googleAuth.js";
import type * as llm from "../llm.js";
import type * as pipeline from "../pipeline.js";
import type * as placeholderGeneration from "../placeholderGeneration.js";
import type * as placeholders from "../placeholders.js";
import type * as places from "../places.js";
import type * as settings from "../settings.js";
import type * as siteImages from "../siteImages.js";
import type * as stats from "../stats.js";
import type * as studios from "../studios.js";
import type * as testGooglePlaces from "../testGooglePlaces.js";
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
  aiImages: typeof aiImages;
  appSettings: typeof appSettings;
  blog: typeof blog;
  blogs: typeof blogs;
  cache: typeof cache;
  certificationPreRegistrations: typeof certificationPreRegistrations;
  cities: typeof cities;
  contextualGeneration: typeof contextualGeneration;
  crons: typeof crons;
  googlePlaces: typeof googlePlaces;
  http: typeof http;
  imageGeneration: typeof imageGeneration;
  images: typeof images;
  "lib/crypto": typeof lib_crypto;
  "lib/github": typeof lib_github;
  "lib/googleAuth": typeof lib_googleAuth;
  llm: typeof llm;
  pipeline: typeof pipeline;
  placeholderGeneration: typeof placeholderGeneration;
  placeholders: typeof placeholders;
  places: typeof places;
  settings: typeof settings;
  siteImages: typeof siteImages;
  stats: typeof stats;
  studios: typeof studios;
  testGooglePlaces: typeof testGooglePlaces;
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
