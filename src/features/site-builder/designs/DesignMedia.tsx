/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type PropsWithChildren } from 'react';
import { resolveStudioAsset, useStudioAssets } from '../assets/AssetContext';
const MediaContext = createContext<Record<string,string>>({});
export function DesignMediaProvider({ urls, children }: PropsWithChildren<{ urls: Record<string,string> }>) { return <MediaContext.Provider value={urls}>{children}</MediaContext.Provider>; }
export function useDesignImage(src: string) {
  const urls = useContext(MediaContext);
  const editor = useStudioAssets();
  if (/^asset:\/\/[\w-]+$/.test(src)) {
    const resolved=resolveStudioAsset(src,editor?.urls || urls);
    return resolved.startsWith('blob:') ? resolved : '';
  }
  return /^\/(?:template-assets|images)\/[\w/-]+\.(?:webp|avif|jpe?g|png)$/.test(src) ? src : '';
}
