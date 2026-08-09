import { useEffect, useState } from "react";
import { BrowserProvider, Contract, formatEther } from "ethers";
import deployment from "./contracts/EventTicketing.json";
import "./App.css";

/**
 * Slice 1 UI — Connect wallet → load event #1 → buy one ticket.
 *
 * Architecture reminder (Option A):
 *   This React app talks DIRECTLY to the smart contract through MetaMask.
 *   There is no backend server and no REST API. The blockchain is the backend.
 *
 *   "Signing" a transaction: MetaMask asks you to approve; your wallet creates
 *   a cryptographic signature proving you authorised the call. Hardhat Network
 *   then runs the contract code.
 */

const HARDHAT_CHAIN_ID = "0x7a69"; // 31337 in hex
const HARDHAT_RPC = "http://127.0.0.1:8545";

function App() {
  const [account, setAccount] = useState(null);
  const [eventInfo, setEventInfo] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  // ---- helpers ----------------------------------------------------------

  function getContract(signerOrProvider) {
    if (!deployment.address) {
      throw new Error(
        "Contract address missing. Run: npx hardhat run scripts/deploy.js --network localhost"
      );
    }
    return new Contract(deployment.address, deployment.abi, signerOrProvider);
  }

  async function ensureHardhatNetwork() {
    // Ask MetaMask to use our local Hardhat chain (chainId 31337).
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HARDHAT_CHAIN_ID }],
      });
    } catch (err) {
      // 4902 = chain not added yet → add it
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: HARDHAT_CHAIN_ID,
              chainName: "Hardhat Local",
              rpcUrls: [HARDHAT_RPC],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            },
          ],
        });
      } else {
        throw err;
      }
    }
  }

  async function loadEvent(provider) {
    const contract = getContract(provider);
    // getEventInfo is a view call — free, no MetaMask popup, no gas.
    const ev = await contract.getEventInfo(1);
    setEventInfo({
      name: ev.name,
      organiser: ev.organiser,
      facePrice: ev.facePrice,
      supply: ev.supply,
      sold: ev.sold,
      perWalletCap: ev.perWalletCap,
      saleOpen: ev.saleOpen,
    });
  }

  // ---- actions ----------------------------------------------------------

  async function connectWallet() {
    try {
      setBusy(true);
      setStatus("");

      if (!window.ethereum) {
        setStatus("MetaMask not found. Install the MetaMask browser extension.");
        return;
      }

      await ensureHardhatNetwork();

      // eth_requestAccounts asks MetaMask for permission to see your address.
      // That address IS your login — no username/password.
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const selected = accounts[0];
      setAccount(selected);

      const provider = new BrowserProvider(window.ethereum);
      await loadEvent(provider);
      setStatus("Connected. Event #1 loaded from the contract.");
    } catch (err) {
      console.error(err);
      setStatus(err.message ?? String(err));
    } finally {
      setBusy(false);
    }
  }

  async function buyTicket() {
    try {
      setBusy(true);
      setStatus("Confirm the transaction in MetaMask…");

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);

      // value: facePrice attaches ETH to the call (msg.value in Solidity).
      const tx = await contract.buyTicket(1, { value: eventInfo.facePrice });
      setStatus(`Transaction sent: ${tx.hash}. Waiting for confirmation…`);

      // wait() pauses until the local node includes the tx in a block.
      await tx.wait();

      await loadEvent(provider);
      setStatus("Ticket purchased! Check the sold count above.");
    } catch (err) {
      console.error(err);
      // Contract reverts (failed require) surface here as errors.
      const msg =
        err?.reason || err?.shortMessage || err?.message || String(err);
      setStatus(`Buy failed: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  // Keep account in sync if the user switches accounts in MetaMask
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccounts = (accounts) => {
      setAccount(accounts[0] ?? null);
    };
    window.ethereum.on?.("accountsChanged", onAccounts);
    return () => window.ethereum.removeListener?.("accountsChanged", onAccounts);
  }, []);

  // ---- render -----------------------------------------------------------

  return (
    <main className="app">
      <header>
        <h1>Anti-Scalping Ticketing</h1>
        <p className="tagline">Slice 1 — create event + buy ticket (local Hardhat)</p>
      </header>

      <section className="panel">
        <h2>1. Connect wallet</h2>
        {account ? (
          <p>
            Connected as <code>{account}</code>
          </p>
        ) : (
          <button type="button" onClick={connectWallet} disabled={busy}>
            Connect MetaMask
          </button>
        )}
        <p className="hint">
          Wallet = login. Use a Hardhat test account imported into MetaMask
          (see README).
        </p>
      </section>

      {account && (
        <section className="panel">
          <h2>2. Event #1</h2>
          {!eventInfo ? (
            <p>Loading event from contract…</p>
          ) : (
            <>
              <dl className="event">
                <div>
                  <dt>Name</dt>
                  <dd>{eventInfo.name}</dd>
                </div>
                <div>
                  <dt>Face price</dt>
                  <dd>{formatEther(eventInfo.facePrice)} ETH</dd>
                </div>
                <div>
                  <dt>Sold / supply</dt>
                  <dd>
                    {eventInfo.sold.toString()} / {eventInfo.supply.toString()}
                  </dd>
                </div>
                <div>
                  <dt>Sale open</dt>
                  <dd>{eventInfo.saleOpen ? "yes" : "no"}</dd>
                </div>
                <div>
                  <dt>Organiser</dt>
                  <dd>
                    <code>{eventInfo.organiser}</code>
                  </dd>
                </div>
              </dl>

              <button type="button" onClick={buyTicket} disabled={busy}>
                Buy ticket ({formatEther(eventInfo.facePrice)} ETH)
              </button>
            </>
          )}
        </section>
      )}

      {status && (
        <section className="panel status">
          <h2>Status</h2>
          <p>{status}</p>
        </section>
      )}

      <footer>
        <p>
          Contract:{" "}
          <code>{deployment.address || "(not deployed yet)"}</code>
        </p>
      </footer>
    </main>
  );
}

export default App;
