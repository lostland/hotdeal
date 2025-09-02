import { apiRequest } from "./queryClient";

export interface MetadataResult {
  title: string;
  description: string;
  image: string | null;
  domain: string;
}

export async function fetchMetadata(url: string): Promise<MetadataResult> {
  const response = await apiRequest("POST", "/api/metadata", { url });
  return response.json();
}

export function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return "";
  }
}
