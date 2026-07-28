/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ResendOTP from "../ResendOTP.js";
import type * as addresses from "../addresses.js";
import type * as auth from "../auth.js";
import type * as cart from "../cart.js";
import type * as categories from "../categories.js";
import type * as changePassword from "../changePassword.js";
import type * as emails_PasswordResetEmail from "../emails/PasswordResetEmail.js";
import type * as emails_VerificationEmail from "../emails/VerificationEmail.js";
import type * as http from "../http.js";
import type * as migrations from "../migrations.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as upload from "../upload.js";
import type * as useGetProducts from "../useGetProducts.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ResendOTP: typeof ResendOTP;
  addresses: typeof addresses;
  auth: typeof auth;
  cart: typeof cart;
  categories: typeof categories;
  changePassword: typeof changePassword;
  "emails/PasswordResetEmail": typeof emails_PasswordResetEmail;
  "emails/VerificationEmail": typeof emails_VerificationEmail;
  http: typeof http;
  migrations: typeof migrations;
  orders: typeof orders;
  products: typeof products;
  upload: typeof upload;
  useGetProducts: typeof useGetProducts;
  users: typeof users;
  utils: typeof utils;
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
