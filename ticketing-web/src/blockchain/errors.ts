import { TARGET_NETWORK } from './networks'

export class WalletUnavailableError extends Error {
  constructor() {
    super('MetaMask is required to connect your wallet.')
    this.name = 'WalletUnavailableError'
  }
}

export class WrongNetworkError extends Error {
  constructor() {
    super(`Please switch MetaMask to ${TARGET_NETWORK.name}.`)
    this.name = 'WrongNetworkError'
  }
}

export class ContractNotConfiguredError extends Error {
  constructor() {
    super(
      `EventTicketing is not deployed for ${TARGET_NETWORK.name}. Run the Hardhat deploy script.`,
    )
    this.name = 'ContractNotConfiguredError'
  }
}
