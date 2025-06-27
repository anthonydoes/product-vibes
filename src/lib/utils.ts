import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractDomainName(url: string): string {
  try {
    // Add protocol if missing
    const urlWithProtocol = url.startsWith("http") ? url : `https://${url}`;
    const urlObject = new URL(urlWithProtocol);
    let hostname = urlObject.hostname;

    // Remove www. prefix if present
    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4);
    }

    return hostname;
  } catch (error) {
    // If URL parsing fails, try to extract domain manually
    let cleanUrl = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
    const pathIndex = cleanUrl.indexOf("/");
    if (pathIndex !== -1) {
      cleanUrl = cleanUrl.substring(0, pathIndex);
    }
    return cleanUrl || url;
  }
}

export function normalizeUrl(url: string): string {
  if (!url || !url.trim()) return url;

  let cleanUrl = url.trim();

  // If URL already has protocol, return as is
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  // Add https:// prefix if missing
  return `https://${cleanUrl}`;
}
