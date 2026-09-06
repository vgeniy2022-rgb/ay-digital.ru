/// <reference types="vite/client" />

declare module 'virtual:sitevl-xray-sources' {
  const manifest: import('./features/xray/types').XRayManifest;
  export default manifest;
}
