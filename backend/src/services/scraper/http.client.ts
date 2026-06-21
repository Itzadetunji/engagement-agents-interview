import axios, { type AxiosInstance } from "axios";
import { config } from "../../config.js";

export function createHttpClient(): AxiosInstance {
  return axios.create({
    baseURL: config.baseUrl,
    timeout: config.requestTimeoutMs,
    maxRedirects: 5,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    validateStatus: (status) => status >= 200 && status < 400,
  });
}

export async function fetchHtml(
  client: AxiosInstance,
  path: string,
): Promise<string> {
  const response = await client.get<string>(path, { responseType: "text" });
  return response.data;
}
