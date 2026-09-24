/**
 * Type definitions for the command handler.
 */

import type { Object } from "@sinclair/typebox";

// We export the parameters object from tool/parameters
import * as Params from "../tool/parameters.js";

// Partial version of tool parameters for command-line usage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PartialRepomixArgs = Record<string, any>;
