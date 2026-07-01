import opentype from 'opentype.js';

export interface LoadedFont {
  font: opentype.Font;
  family: string;
  url: string;
}

export async function fetchFontTtfUrl(fontId: string): Promise<string> {
  // Use a CORS-friendly google-webfonts-helper mirror
  const response = await fetch(`https://gwfh.mranftl.com/api/fonts/${fontId}?subsets=latin`);
  if (!response.ok) {
    throw new Error(`Failed to fetch font metadata for ${fontId}`);
  }
  const data = await response.json();
  
  const variants = data.variants || [];
  
  // Find a suitable regular weight variant (regular, 400, or closest)
  const regularVariant = 
    variants.find((v: any) => v.id === 'regular') ||
    variants.find((v: any) => v.id === '400') ||
    variants.find((v: any) => v.id === '500') ||
    variants.find((v: any) => v.id === '300') ||
    variants[0];
    
  if (!regularVariant) {
    throw new Error(`No suitable regular variant found for font ${fontId}`);
  }
  
  // Fetch TTF format, fallback to WOFF
  const fontUrl = regularVariant.ttf || regularVariant.woff;
  if (!fontUrl) {
    throw new Error(`No TTF or WOFF URL found for font ${fontId}`);
  }
  
  // Replace http with https if needed
  return fontUrl.replace(/^http:/, 'https:');
}

export async function loadFontAndRegister(fontId: string, fontName: string, fontUrl?: string): Promise<LoadedFont> {
  const ttfUrl = fontUrl || await fetchFontTtfUrl(fontId);
  
  // Register in browser document CSS using modern FontFace API
  try {
    const fontFace = new FontFace(fontName, `url(${ttfUrl})`);
    const loadedFace = await fontFace.load();
    document.fonts.add(loadedFace);
  } catch (err) {
    console.warn(`Could not register browser FontFace for ${fontName}:`, err);
  }
  
  // Download binary array buffer for opentype.js
  const fontResponse = await fetch(ttfUrl);
  if (!fontResponse.ok) {
    throw new Error(`Failed to download font binary from ${ttfUrl}`);
  }
  const buffer = await fontResponse.arrayBuffer();
  
  // Parse font structures
  const font = opentype.parse(buffer);
  
  return {
    font,
    family: fontName,
    url: ttfUrl
  };
}
