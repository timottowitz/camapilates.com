/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

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
import type * as instagram from "../instagram.js";
import type * as leads from "../leads.js";
import type * as lib_adminAuth from "../lib/adminAuth.js";
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
import type * as studioClaims from "../studioClaims.js";
import type * as studioEnrichment from "../studioEnrichment.js";
import type * as studioSummary from "../studioSummary.js";
import type * as studios from "../studios.js";
import type * as teacherClaims from "../teacherClaims.js";
import type * as teacherClaimsAdmin from "../teacherClaimsAdmin.js";
import type * as teacherDiscovery from "../teacherDiscovery.js";
import type * as teachers from "../teachers.js";
import type * as testGooglePlaces from "../testGooglePlaces.js";
import type * as topics from "../topics.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

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
  instagram: typeof instagram;
  leads: typeof leads;
  "lib/adminAuth": typeof lib_adminAuth;
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
  studioClaims: typeof studioClaims;
  studioEnrichment: typeof studioEnrichment;
  studioSummary: typeof studioSummary;
  studios: typeof studios;
  teacherClaims: typeof teacherClaims;
  teacherClaimsAdmin: typeof teacherClaimsAdmin;
  teacherDiscovery: typeof teacherDiscovery;
  teachers: typeof teachers;
  testGooglePlaces: typeof testGooglePlaces;
  topics: typeof topics;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
