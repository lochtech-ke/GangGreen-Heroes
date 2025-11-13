/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ANTUGROW_API_URL: string;
  readonly VITE_ANTUGROW_API_KEY: string;
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_CHAIN_ID: string;
  readonly VITE_NETWORK_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
