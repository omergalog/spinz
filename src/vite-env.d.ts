/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** מזהה פיקסל מטא. ריק = הפיקסל אינו נטען כלל. */
  readonly VITE_META_PIXEL_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
