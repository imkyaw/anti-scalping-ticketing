# Anti-Scalping Event Ticketing (PoC)

Master's-team proof of concept: event tickets as **ERC-721** NFTs whose resale
rules live in a Solidity smart contract. The React app talks **directly to the
contract** via MetaMask (no backend server).

> We build this in slices. **Slice 1** (current): create an event, buy a ticket
> on a local Hardhat chain, and see it update in the UI.

## Stack

| Layer | Tool |
| --- | --- |
| Contract | Solidity ^0.8 + OpenZeppelin ERC-721 |
| Tooling | Hardhat (compile / test / deploy) |
| Local chain | Hardhat Network (`localhost:8545`) |
| Frontend | React + Vite + ethers.js v6 |
| Wallet | MetaMask → Hardhat Local |

Everything runs locally and offline. No testnet, no real funds.

## Repo layout

```
ticketing/
├── contracts/          # Solidity
├── scripts/            # Deploy scripts
├── test/               # Hardhat + Chai tests
├── frontend/           # Vite React app
├── hardhat.config.js
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- (Optional) GitHub CLI if you manage the remote from the terminal

## Slice 1 — run the end-to-end loop

You need **three terminals** from the repo root (`ticketing/`).

### Terminal A — start the local blockchain

```bash
npm install
npx hardhat node
```

Leave this running. Hardhat prints 20 test accounts with private keys and fake ETH.

**Blockchain concept — local node:** Hardhat Network is a fake Ethereum chain on
your machine. Transactions are instant and free (fake ETH only).

### Terminal B — deploy the contract + seed a demo event

With the node still running:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This deploys `EventTicketing`, creates demo event **#1** ("Campus Concert" at
0.01 ETH), and writes `frontend/src/contracts/EventTicketing.json` (address + ABI)
for the UI.

**Important:** Every time you restart Terminal A (`hardhat node`), the chain
resets — run the deploy script again.

### Terminal C — start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### MetaMask setup (once)

1. MetaMask → **Settings → Networks → Add network** (or let the app prompt you):
   - Network name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`
2. Import a Hardhat account: MetaMask → account menu → **Import account** → paste
   a **private key** from the Terminal A output (Account #1 is fine for buying).
3. Use a **different** Hardhat account than the deployer if you want to see ETH
   move from buyer → organiser (deploy uses Account #0).

### Verify the loop

1. Click **Connect MetaMask** and approve.
2. Confirm event #1 details appear (name, price, sold/supply).
3. Click **Buy ticket** and approve the transaction.
4. Sold count should increase by 1; MetaMask balance drops by ~0.01 ETH.

### Run the Slice 1 tests

```bash
npx hardhat test
```

## npm scripts (repo root)

| Command | What it does |
| --- | --- |
| `npm test` | Run Hardhat tests |
| `npm run compile` | Compile Solidity |
| `npm run node` | Start local Hardhat node |
| `npm run deploy:local` | Deploy to localhost |
| `npm run frontend` | Start Vite dev server |

## Roadmap (next slices — do not jump ahead)

1. ~~Scaffold + createEvent / buyTicket / getEventInfo + tiny UI~~ ← you are here
2. Resale + on-chain price cap (`listForResale` / `buyResale`)
3. Check-in + validator role (`grantValidator` / `markUsed` + wallet signature)
4. Organiser dashboard (`/organiser`)
5. Remaining buyer screens (browse, my tickets, resale market)

## Team notes

- **Wallet = login.** No usernames or passwords.
- **Rules live in the contract**, not the UI. The UI only chooses which screens
  to show; the contract still rejects bad calls.
- **Do not use** `localStorage` / `sessionStorage` — keep state in React.
- One deployed contract holds **many events**; each event has its own organiser.
