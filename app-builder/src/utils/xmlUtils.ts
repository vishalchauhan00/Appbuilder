// src/utils/xmlUtils.ts
import { XMLParser } from 'fast-xml-parser';

export async function fetchAndParseXML<T = any>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const text = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '', // optional: makes attributes easier to access
    });

    const parsed = parser.parse(text);
    return parsed as T;
  } catch (error) {
    console.error(`Error parsing XML at ${path}:`, error);
    return null;
  }
}
