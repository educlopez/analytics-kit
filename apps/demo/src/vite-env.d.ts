/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VERCEL_TOKEN?: string;
  readonly VITE_VERCEL_PROJECT_ID?: string;
  readonly VITE_VERCEL_TEAM_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
