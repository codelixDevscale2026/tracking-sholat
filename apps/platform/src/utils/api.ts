import { hc } from "hono/client";
import type { AppType } from "../../../api/src/index.js";

export const api = hc<AppType>(import.meta.env.VITE_API_BASE_URL);
