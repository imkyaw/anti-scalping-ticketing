/**
 * Role definitions for the demo — edit this file to change who sees what.
 *
 * Addresses are Hardhat's default accounts printed by `npx hardhat node`
 * (Account 1 = Hardhat #0, the deployer). Public addresses only; never put
 * private keys here.
 *
 * Roles only shape the UI (tabs and pages). The smart contract remains the
 * security boundary: e.g. a gatekeeper still needs the on-chain validator role
 * granted by the event organiser.
 */

export type AppRole = 'organizer' | 'attendee' | 'gatekeeper'

/** Sections of the app; each maps to one navigation tab and its pages. */
export type AppArea = 'events' | 'marketplace' | 'myTickets' | 'organizer' | 'gatekeeper'

export interface RoleAccount {
  label: string
  address: string
  role: AppRole
}

export interface RoleDefinition {
  label: string
  description: string
  /** Tabs shown, in order. The first one is the role's home page. */
  areas: AppArea[]
}

export const ROLE_ACCOUNTS: RoleAccount[] = [
  { label: 'Account 1', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', role: 'organizer' },
  { label: 'Account 2', address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', role: 'attendee' },
  { label: 'Account 3', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', role: 'attendee' },
  { label: 'Account 4', address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', role: 'gatekeeper' },
]

export const ROLE_DEFINITIONS: Record<AppRole, RoleDefinition> = {
  organizer: {
    label: 'Organizer',
    description: 'Create events, open or close sales, and grant gate-staff wallets the validator role.',
    areas: ['organizer'],
  },
  attendee: {
    label: 'Buyer / Seller / Attendee',
    description: 'Buy tickets at face value, resell at or below face value, and show a signed QR at the gate.',
    areas: ['events', 'marketplace', 'myTickets'],
  },
  gatekeeper: {
    label: 'Gatekeeper',
    description: 'Verify a check-in QR, confirm ownership on-chain and mark the ticket as used.',
    areas: ['gatekeeper'],
  },
}
