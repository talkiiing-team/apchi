/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOST: string
  readonly VITE_PORT: string
  readonly VITE_JWT_KEY: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_REFRESH_TOKEN_LENGTH: string
  readonly VITE_JWT_LIFETIME_SEC: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
