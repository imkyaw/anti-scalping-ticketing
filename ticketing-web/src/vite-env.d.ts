/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAIN_ID?: string
  readonly VITE_RPC_URL?: string
  readonly VITE_BLOCK_EXPLORER_URL?: string
  readonly VITE_CHECK_IN_QR_TTL_SECONDS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  ethereum?: import('./blockchain/types').InjectedEthereumProvider
}
