import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

import {
  registerHashOnChain,
  verifyHashOnChain,
  revokeHashOnChain
} from "./lib/trustchain";

import {
  Activity, ArrowUpRight, Blocks, CircleAlert, Copy,
  FileSearch, FileText, Fingerprint, LockKeyhole,
  Menu, Search, ShieldCheck, Upload, Wallet
} from "lucide-react";

const tabs = [
  ["01", "Verification Console"],
  ["02", "Certificate Registry"],
  ["03", "Issue Certificate"],
  ["04", "Integrity Verification"],
  ["05", "Transaction Explorer"],
  ["06", "Administration"]
];

const CONTRACT_ADDRESS =
  "0xBA741A4c9f78611586F0E00F1699E5EBd5eB6Ae5";

// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

function Status({ children }) {
  const cls = String(children).toLowerCase().replaceAll(" ", "-");
  return <span className={`status status-${cls}`}>{children}</span>;
}

function Panel({ title, right, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <span>{title}</span>
        {right && <span className="muted">{right}</span>}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}

function Metric({ label, value, note, warning }) {
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className={warning ? "metric-note warn" : "metric-note"}>
        {note}
      </div>
    </div>
  );
}

async function calculateHash(file) {
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return [...new Uint8Array(digest)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// --------------------------------------------------
// WALLET CONNECTION
// --------------------------------------------------

function WalletConnection() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("NOT CONNECTED");

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask first.");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      const chainId = await window.ethereum.request({
        method: "eth_chainId"
      });

      if (chainId !== "0xaa36a7") {
        throw new Error("Please switch MetaMask to Ethereum Sepolia.");
      }

      setAddress(accounts[0]);
      setNetwork("SEPOLIA");
    } catch (error) {
      alert(error.message || "Wallet connection failed.");
    }
  }

  useEffect(() => {
    if (!window.ethereum) return;

    async function refreshWallet() {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts"
        });

        const chainId = await window.ethereum.request({
          method: "eth_chainId"
        });

        setAddress(accounts[0] || "");
        setNetwork(
          chainId === "0xaa36a7" ? "SEPOLIA" : "WRONG NETWORK"
        );
      } catch {
        setAddress("");
      }
    }

    refreshWallet();

    const handleAccounts = accounts => {
      setAddress(accounts[0] || "");
    };

    const handleNetwork = chainId => {
      setNetwork(
        chainId === "0xaa36a7" ? "SEPOLIA" : "WRONG NETWORK"
      );
    };

    window.ethereum.on("accountsChanged", handleAccounts);
    window.ethereum.on("chainChanged", handleNetwork);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccounts);
      window.ethereum.removeListener("chainChanged", handleNetwork);
    };
  }, []);

  return (
    <button className="wallet-button" onClick={connectWallet}>
      <Wallet size={15} />
      {address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "CONNECT WALLET"}
    </button>
  );
}

// --------------------------------------------------
// VERIFICATION CONSOLE
// --------------------------------------------------

function VerificationConsole({ setTab }) {
  return (
    <>
      <div className="metrics">
        <Metric label="INDEXED ATTESTATIONS" value="LIVE" note="Supabase-backed registry" />
        <Metric label="NETWORK" value="SEPOLIA" note="Ethereum test network" />
        <Metric label="CONTRACT" value="DEPLOYED" note="TrustChain smart contract" />
        <Metric label="HASH ENGINE" value="SHA-256" note="Browser Web Crypto API" />
      </div>

      <div className="two-col main-grid">
        <div className="stack">
          <Panel title="■ TRUSTCHAIN // CREDENTIAL INFRASTRUCTURE">
            <div className="hero-cert">
              <div>
                <div className="eyebrow">GLOBAL VERIFIED SPECIFICATION</div>
                <h1>TRUSTCHAIN CERTIFICATE REGISTRY</h1>

                <p className="muted">
                  A blockchain-backed certificate verification prototype.
                  Document fingerprints are registered on Ethereum Sepolia.
                </p>

                <div className="detail-grid">
                  <div><small>NETWORK</small><b>Ethereum Sepolia</b></div>
                  <div><small>HASH ENGINE</small><b>SHA-256</b></div>
                  <div><small>CONTRACT</small><b>DEPLOYED</b></div>
                  <div><small>REGISTRY</small><b>Supabase + Blockchain</b></div>
                  <div><small>FILE STORAGE</small><b>Local browser</b></div>
                  <div><small>PROTOCOL</small><b className="lime-text">TrustChain V1</b></div>
                </div>
              </div>

              <div className="qr-placeholder">
                <Fingerprint size={72} />
                <small>DOCUMENT<br />FINGERPRINT</small>
              </div>
            </div>

            <div className="verified-strip">
              <ShieldCheck />
              <div>
                <b>SMART CONTRACT DEPLOYED</b>
                <small>Ethereum Sepolia test network</small>
              </div>
              <Status>DEPLOYED</Status>
            </div>

            <div className="inset">
              <small>CONTRACT ADDRESS</small>
              <p className="mono">{CONTRACT_ADDRESS}</p>
              <a
                href={`https://eth-sepolia.blockscout.com/address/${CONTRACT_ADDRESS}?tab=contract`}
                target="_blank"
                rel="noreferrer"
              >
                VIEW CONTRACT ↗
              </a>
            </div>
          </Panel>

          <Panel title="DOCUMENT VERIFICATION PIPELINE">
            <div className="proof-tree">
              <div className="proof-node root">
                BLOCKCHAIN REGISTRY<br />
                <b>Ethereum Sepolia</b>
              </div>

              <div className="proof-branch">
                <div className="proof-node">HASH ENGINE<br />SHA-256</div>
                <div className="proof-node">DATABASE<br />Supabase</div>
              </div>

              <div className="proof-node leaf">
                CERTIFICATE DOCUMENT<br />
                <b>PDF Fingerprint</b>
              </div>
            </div>
          </Panel>
        </div>

        <div className="stack">
          <Panel title="NETWORK STATUS">
            <div className="empty-state">
              <Activity size={28} />
              <b>Sepolia test network</b>
              <span>Connect MetaMask to approve blockchain transactions.</span>
            </div>
          </Panel>

          <Panel title="QUICK OPERATIONS">
            <button className="button full lime" onClick={() => setTab("03")}>
              <Upload size={15} /> ISSUE CERTIFICATE
            </button>

            <button className="button full" onClick={() => setTab("04")}>
              <ShieldCheck size={15} /> VERIFY DOCUMENT
            </button>

            <button className="button full" onClick={() => setTab("02")}>
              <FileSearch size={15} /> OPEN REGISTRY
            </button>
          </Panel>

          <Panel title="PROTOTYPE NOTICE">
            <p className="muted">
              Certificate metadata is stored in Supabase. SHA-256 fingerprints
              are registered on the Ethereum Sepolia test network.
              PDF files are not uploaded to the blockchain.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
}


function CertificateQRCode({ certificateId }) {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const verificationUrl =
    `${window.location.origin}/verify/${encodeURIComponent(certificateId)}`;

  useEffect(() => {
    let cancelled = false;

    async function generateQR() {
      try {
        const dataUrl = await QRCode.toDataURL(verificationUrl, {
          width: 300,
          margin: 2,
          errorCorrectionLevel: "H"
        });

        if (!cancelled) setQrCode(dataUrl);
      } catch (err) {
        console.error("QR generation failed:", err);
        if (!cancelled) setError("QR generation failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    generateQR();

    return () => {
      cancelled = true;
    };
  }, [verificationUrl]);

  function downloadQR() {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `TrustChain-${certificateId}-QR.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      minWidth: "115px"
    }}>
      {loading ? (
        <small className="muted">Generating...</small>
      ) : error ? (
        <small className="auth-error">{error}</small>
      ) : (
        <>
          <img
            src={qrCode}
            alt={`QR code for certificate ${certificateId}`}
            style={{
              width: "90px",
              height: "90px",
              background: "#fff",
              padding: "5px",
              borderRadius: "6px"
            }}
          />

          <button
            className="button"
            onClick={downloadQR}
            type="button"
          >
            DOWNLOAD QR
          </button>
        </>
      )}
    </div>
  );
}

// --------------------------------------------------
// CERTIFICATE REGISTRY + REVOCATION
// --------------------------------------------------


function CertificateRegistry() {
  const [query, setQuery] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadCertificates() {
    setLoading(true);

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setError("");
      setCertificates(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCertificates();
  }, []);

  async function handleRevoke(certificate) {
    const confirmed = window.confirm(
      `Are you sure you want to revoke certificate ${certificate.certificate_id}?\n\nThis action will be permanently recorded on Ethereum Sepolia.`
    );

    if (!confirmed) return;

    setBusyId(certificate.id);
    setError("");
    setNotice("");

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData.user;

      if (!user) throw new Error("Please sign in again.");

      if (user.app_metadata?.role !== "admin") {
        throw new Error("Only administrators can revoke certificates.");
      }

      if (certificate.status === "revoked") {
        throw new Error("This certificate is already revoked.");
      }

      if (certificate.blockchain_status !== "confirmed") {
        throw new Error(
          "This certificate does not have a confirmed blockchain registration."
        );
      }

      const result = await revokeHashOnChain(certificate.file_hash);

     const { error: updateError } = await supabase
  .from("certificates")
  .update({
    status: "revoked",
    revoked_at: new Date().toISOString(),
    revocation_tx_hash: result.transactionHash,
    revoked_by: user.id
  })
  .eq("id", certificate.id);

      if (updateError) {
        throw new Error(
          "Blockchain revocation succeeded, but Supabase update failed. " +
          "Transaction: " + result.transactionHash +
          ". Database error: " + updateError.message
        );
      }

      setNotice(
        `Certificate ${certificate.certificate_id} revoked successfully. Transaction: ${result.transactionHash}`
      );

      await loadCertificates();
    } catch (err) {
      console.error("Revocation failed:", err);
      setError(err.reason || err.message || "Certificate revocation failed.");
    } finally {
      setBusyId("");
    }
  }

  const rows = certificates.filter(c =>
    [
      c.certificate_id,
      c.recipient_name,
      c.institution,
      c.certificate_title,
      c.category,
      c.file_hash,
      c.status
    ].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="page-title">
        <div>
          <div className="eyebrow">CATALOG QUERY // SUPABASE DATABASE</div>
          <h1>CERTIFICATE REGISTRY</h1>
          <p className="muted">
            Manage certificate records and revoke credentials on Ethereum Sepolia.
          </p>
        </div>
        <Status>DATABASE CONNECTED</Status>
      </div>

      <div className="toolbar">
        <Search size={17} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search certificate ID, recipient or digest..."
        />
      </div>

      {notice && (
        <div className="verified-strip">
          <ShieldCheck />
          <div>
            <b>REVOCATION CONFIRMED</b>
            <small>{notice}</small>
          </div>
          <Status>SUCCESS</Status>
        </div>
      )}

      {error && <p className="auth-error" role="alert">{error}</p>}

      <Panel title="REGISTRY ENTRIES" right={`${rows.length} DISPLAYED`}>
        {loading ? (
          <p className="muted">Loading certificates...</p>
        ) : error && certificates.length === 0 ? (
          <p className="auth-error">{error}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>RECIPIENT / SUBJECT</th>
                  <th>INSTITUTION</th>
                  <th>CATEGORY</th>
                  <th>STATUS</th>
                  <th>BLOCKCHAIN</th>
                  <th>DIGEST</th>
                  <th>QR CODE</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {rows.map(c => (
                  <tr key={c.id}>
                    <td className="lime-text">{c.certificate_id}</td>

                    <td>
                      {c.recipient_name}
                      <br />
                      <small>{c.certificate_title}</small>
                    </td>

                    <td>{c.institution}</td>
                    <td>{c.category}</td>

                    <td>
                      <Status>{c.status.toUpperCase()}</Status>
                    </td>

                    <td>
                      <Status>
                        {(c.blockchain_status || "pending").toUpperCase()}
                      </Status>

                      {c.blockchain_tx_hash && (
                        <>
                          <br />
                          <a
                            href={`https://eth-sepolia.blockscout.com/tx/${c.blockchain_tx_hash}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            VIEW TX ↗
                          </a>
                        </>
                      )}
                    </td>

                    <td className="mono">
                      {c.file_hash?.slice(0, 16)}...
                    </td>

                    <td>
                      <CertificateQRCode
                        certificateId={c.certificate_id}
                      />
                    </td>

                    <td>
                      {c.status === "revoked" ? (
                        <Status>REVOKED</Status>
                      ) : (
                        <button
                          className="button"
                          disabled={
                            busyId === c.id ||
                            c.blockchain_status !== "confirmed"
                          }
                          onClick={() => handleRevoke(c)}
                        >
                          {busyId === c.id ? "PROCESSING..." : "REVOKE"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
              <p className="muted">No certificates found.</p>
            )}
          </div>
        )}
      </Panel>
    </>
  );
}
// --------------------------------------------------
// ISSUE CERTIFICATE
// --------------------------------------------------

function IssueCertificate() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const [recipient, setRecipient] = useState("");
  const [issuer, setIssuer] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [transactionHash, setTransactionHash] = useState("");

  async function hashFile(selected) {
    setFile(selected);
    setHash("");
    setMessage("");
    setTransactionHash("");

    if (!selected) return;

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);
      setMessage("Please select a valid PDF file.");
      setMessageType("error");
      return;
    }

    setBusy(true);

    try {
      setHash(await calculateHash(selected));
    } catch (error) {
      setMessage("Hash generation failed: " + error.message);
      setMessageType("error");
    } finally {
      setBusy(false);
    }
  }

  async function saveCertificate() {
    setMessage("");
    setTransactionHash("");

    if (
      !file || !hash || !recipient.trim() ||
      !issuer.trim() || !title.trim() || !category
    ) {
      setMessage("Please complete all fields and upload a PDF.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    let savedCertificate = null;

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData.user;

      if (!user) throw new Error("Please log in again.");

      if (user.app_metadata?.role !== "admin") {
        throw new Error("Only administrators can issue certificates.");
      }

      const certificateId =
        "TC-" + crypto.randomUUID().slice(0, 8).toUpperCase();

      const { data: inserted, error: insertError } = await supabase
        .from("certificates")
        .insert({
          certificate_id: certificateId,
          recipient_name: recipient.trim(),
          institution: issuer.trim(),
          certificate_title: title.trim(),
          category,
          file_hash: hash,
          issued_by: user.id,
          blockchain_status: "pending",
          blockchain_network: "sepolia"
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      savedCertificate = inserted;

      let chainResult;

      try {
        chainResult = await registerHashOnChain(hash);
      } catch (chainError) {
        await supabase
          .from("certificates")
          .update({ blockchain_status: "failed" })
          .eq("id", savedCertificate.id);

        setMessage(
          `Saved in Supabase, but blockchain registration failed: ${chainError.message}`
        );
        setMessageType("error");
        return;
      }

      const { error: updateError } = await supabase
        .from("certificates")
        .update({
          blockchain_tx_hash: chainResult.transactionHash,
          blockchain_network: "sepolia",
          blockchain_status: "confirmed"
        })
        .eq("id", savedCertificate.id);

      setTransactionHash(chainResult.transactionHash);

      if (updateError) {
        setMessage(
          "Blockchain transaction succeeded, but Supabase could not save its details: " +
          updateError.message
        );
        setMessageType("error");
        return;
      }

      setMessage(`Certificate issued and registered! ID: ${certificateId}`);
      setMessageType("success");

      setFile(null);
      setHash("");
      setRecipient("");
      setIssuer("");
      setTitle("");
      setCategory("");
    } catch (error) {
      console.error("Issuance failed:", error);
      setMessage(error.message || "Certificate issuance failed.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="two-col issue-layout">
      <div className="stack">
        <div className="page-title">
          <div>
            <div className="eyebrow">STAGE 01 // DOCUMENT INGESTION</div>
            <h1>ISSUE CERTIFICATE</h1>
            <p className="muted">
              Calculate a fingerprint and register it on Ethereum Sepolia.
            </p>
          </div>
        </div>

        <Panel title="01 // DOCUMENT UPLOAD" right="LOCAL HASHING">
          <label className="dropzone">
            <Upload size={30} />
            <b>{file ? file.name : "Choose a certificate PDF"}</b>
            <span>PDF only · File stays in this browser</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={e => hashFile(e.target.files?.[0])}
            />
          </label>

          {file && (
            <div className="file-meta">
              <span>{(file.size / 1024).toFixed(1)} KB</span>
              <span>{file.type || "PDF document"}</span>
            </div>
          )}
        </Panel>

        <Panel title="02 // CANONICAL METADATA">
          <div className="form-grid">
            <label>
              RECIPIENT NAME
              <input
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                placeholder="Full legal name"
              />
            </label>

            <label>
              ISSUING INSTITUTION
              <input
                value={issuer}
                onChange={e => setIssuer(e.target.value)}
                placeholder="Institution name"
              />
            </label>

            <label>
              CERTIFICATE TITLE
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Certificate title"
              />
            </label>

            <label>
              CATEGORY
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Select category</option>
                <option value="Education">Education</option>
                <option value="Internship">Internship</option>
                <option value="Achievement">Achievement</option>
                <option value="Professional">Professional</option>
              </select>
            </label>
          </div>
        </Panel>
      </div>

      <div className="stack">
        <Panel
          title="03 // REAL-TIME SHA-256"
          right={busy ? "COMPUTING..." : hash ? "COMPUTED" : "AWAITING FILE"}
        >
          <div className="hash-box">
            {hash || "Upload a PDF to calculate its SHA-256 digest."}
          </div>

          {hash && (
            <button className="button" onClick={() => navigator.clipboard?.writeText(hash)}>
              <Copy size={14} /> COPY HASH
            </button>
          )}
        </Panel>

        <Panel title="04 // BLOCKCHAIN REGISTRATION">
          <div className="notice">
            <CircleAlert size={17} />
            Metadata is saved in Supabase. MetaMask will request approval
            for the Sepolia transaction.
          </div>

          <button
            className="button lime full"
            disabled={
              !hash || !recipient.trim() || !issuer.trim() ||
              !title.trim() || !category || saving || busy
            }
            onClick={saveCertificate}
          >
            {saving ? "PROCESSING TRANSACTION..." : "ISSUE & REGISTER ON BLOCKCHAIN"}
          </button>

          {message && (
            <p
              className={messageType === "error" ? "auth-error" : "lime-text"}
              role="status"
            >
              {message}
            </p>
          )}

          {transactionHash && (
            <div className="inset">
              <small>SEPOLIA TRANSACTION HASH</small>
              <p className="mono">{transactionHash}</p>
              <a
                href={`https://eth-sepolia.blockscout.com/tx/${transactionHash}`}
                target="_blank"
                rel="noreferrer"
              >
                VIEW ON BLOCKSCOUT ↗
              </a>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

// --------------------------------------------------
// INTEGRITY VERIFICATION
// --------------------------------------------------

function IntegrityVerification() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState("");
  const [chainResult, setChainResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function inspect(selected) {
    setFile(selected);
    setResult("");
    setHash("");
    setChainResult(null);
    setError("");

    if (!selected) return;

    try {
      setHash(await calculateHash(selected));
    } catch {
      setError("Could not calculate the document fingerprint.");
    }
  }

  async function verifyOnChain() {
    setChecking(true);
    setError("");
    setChainResult(null);

    try {
      const record = await verifyHashOnChain(hash);

      setChainResult({
        exists: record[0],
        issuer: record[1],
        issuedAt: record[2].toString(),
        revoked: record[3]
      });
    } catch (err) {
      setError(err.message || "Blockchain verification failed.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <>
      <div className="page-title">
        <div>
          <div className="eyebrow">MODULE 04 // DOCUMENT AUDIT</div>
          <h1>DOCUMENT INTEGRITY &amp; VERIFICATION</h1>
          <p className="muted">
            Compare document fingerprints and independently query the Sepolia contract.
          </p>
        </div>
      </div>

      <div className="two-col">
        <Panel title="LOCAL DOCUMENT SPECIMEN">
          <label className="dropzone">
            <FileText size={30} />
            <b>{file?.name || "Select PDF document"}</b>
            <span>Document is hashed locally in your browser</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={e => inspect(e.target.files?.[0])}
            />
          </label>
        </Panel>

        <Panel title="EXPECTED REGISTERED DIGEST">
          <input
            className="wide-input mono"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="Paste expected SHA-256 hash"
          />

          <div className="hash-box mono">
            {hash || "Computed digest will appear here."}
          </div>

          <button
            className="button full"
            disabled={!hash || !target.trim()}
            onClick={() => setResult(
              hash.toLowerCase() ===
              target.trim().replace(/^0x/, "").toLowerCase()
                ? "MATCH"
                : "MISMATCH"
            )}
          >
            COMPARE FINGERPRINTS
          </button>

          {result && (
            <div className={`result-banner ${result === "MATCH" ? "good" : "bad"}`}>
              <ShieldCheck />
              <div>
                <b>{result === "MATCH" ? "DIGEST MATCH" : "DIGEST MISMATCH"}</b>
                <small>
                  {result === "MATCH"
                    ? "The fingerprints are identical."
                    : "The fingerprints do not match."}
                </small>
              </div>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="ON-CHAIN VERIFICATION" right="ETHEREUM SEPOLIA">
        <button
          className="button lime full"
          disabled={!hash || checking}
          onClick={verifyOnChain}
        >
          {checking ? "CHECKING BLOCKCHAIN..." : "VERIFY HASH ON SEPOLIA"}
        </button>

        {error && <p className="auth-error">{error}</p>}

        {chainResult && (
          <div className="inset">
            <b>
              {chainResult.exists
                ? chainResult.revoked
                  ? "CERTIFICATE REVOKED"
                  : "CERTIFICATE FOUND ON BLOCKCHAIN"
                : "HASH NOT REGISTERED"}
            </b>

            {chainResult.exists && (
              <>
                <p className="mono">ISSUER: {chainResult.issuer}</p>
                <p>
                  ISSUED AT:{" "}
                  {new Date(Number(chainResult.issuedAt) * 1000).toLocaleString()}
                </p>
                <p>REVOKED: {chainResult.revoked ? "YES" : "NO"}</p>
              </>
            )}
          </div>
        )}
      </Panel>
    </>
  );
}

// --------------------------------------------------
// TRANSACTION EXPLORER
// --------------------------------------------------


function TransactionExplorer() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .or(
          "blockchain_tx_hash.not.is.null,revocation_tx_hash.not.is.null"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setCertificates(data || []);
      }

      setLoading(false);
    }

    load();
  }, []);

  // Create separate transaction entries for issuance and revocation.
  const transactions = certificates.flatMap(c => {
    const entries = [];

    if (c.blockchain_tx_hash) {
      entries.push({
        id: `${c.id}-issuance`,
        certificateId: c.certificate_id,
        recipient: c.recipient_name,
        type: "ISSUANCE",
        status: (c.blockchain_status || "pending").toUpperCase(),
        hash: c.blockchain_tx_hash,
        date: c.created_at,
        network: c.blockchain_network || "Sepolia"
      });
    }

    if (c.revocation_tx_hash) {
      entries.push({
        id: `${c.id}-revocation`,
        certificateId: c.certificate_id,
        recipient: c.recipient_name,
        type: "REVOCATION",
        status: "REVOKED",
        hash: c.revocation_tx_hash,
        date: c.revoked_at,
        network: c.blockchain_network || "Sepolia"
      });
    }

    return entries;
  });

  // Show newest transactions first.
  transactions.sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  );

  const issuanceCount = transactions.filter(
    t => t.type === "ISSUANCE"
  ).length;

  const revocationCount = transactions.filter(
    t => t.type === "REVOCATION"
  ).length;

  return (
    <>
      <div className="page-title">
        <div>
          <div className="eyebrow">NETWORK EXPLORER // TESTNET</div>
          <h1>TRANSACTION EXPLORER</h1>
          <p className="muted">
            Track certificate issuance and revocation transactions on Ethereum Sepolia.
          </p>
        </div>
        <Status>SEPOLIA</Status>
      </div>

      <div className="metrics">
        <Metric
          label="NETWORK"
          value="Sepolia"
          note="Ethereum test network"
        />

        <Metric
          label="CONTRACT"
          value="DEPLOYED"
          note="TrustChain V1"
        />

        <Metric
          label="TOTAL TRANSACTIONS"
          value={transactions.length}
          note="Issuance + revocation"
        />

        <Metric
          label="REVOCATIONS"
          value={revocationCount}
          note={`${issuanceCount} issuance transactions`}
        />
      </div>

      <Panel title="TRANSACTION LEDGER">
        {loading ? (
          <p className="muted">Loading transactions...</p>
        ) : error ? (
          <p className="auth-error">{error}</p>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <Blocks size={34} />
            <b>No transactions recorded yet</b>
            <span>
              Issue or revoke a certificate to create a blockchain transaction.
            </span>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>CERTIFICATE ID</th>
                  <th>RECIPIENT</th>
                  <th>TRANSACTION TYPE</th>
                  <th>DATE</th>
                  <th>NETWORK</th>
                  <th>STATUS</th>
                  <th>TRANSACTION</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td className="lime-text">
                      {t.certificateId}
                    </td>

                    <td>{t.recipient}</td>

                    <td>
                      <Status>{t.type}</Status>
                    </td>

                    <td>
                      {t.date
                        ? new Date(t.date).toLocaleString()
                        : "Not available"}
                    </td>

                    <td>{t.network}</td>

                    <td>
                      <Status>{t.status}</Status>
                    </td>

                    <td>
                      <a
                        href={`https://eth-sepolia.blockscout.com/tx/${t.hash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        VIEW ON BLOCKSCOUT ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}


// --------------------------------------------------
// ADMINISTRATION
// --------------------------------------------------


function Administration() {
  const [form, setForm] = useState({
    institution_name: "",
    admin_contact: "",
    public_website: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Load saved institution settings.
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError) throw userError;

        const user = userData.user;

        if (!user || user.app_metadata?.role !== "admin") {
          throw new Error("Only administrators can access these settings.");
        }

        const { data, error: fetchError } = await supabase
          .from("institution_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
          setForm({
            institution_name: data.institution_name || "",
            admin_contact: data.admin_contact || "",
            public_website: data.public_website || ""
          });
        }
      } catch (err) {
        console.error("Settings loading failed:", err);
        setError(err.message || "Could not load institution settings.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  }

  // Save settings to Supabase.
  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const user = userData.user;

      if (!user || user.app_metadata?.role !== "admin") {
        throw new Error("Only administrators can save settings.");
      }

      const { error: saveError } = await supabase
        .from("institution_settings")
        .upsert(
          {
            id: 1,
            institution_name: form.institution_name.trim(),
            admin_contact: form.admin_contact.trim(),
            public_website: form.public_website.trim(),
            updated_by: user.id,
            updated_at: new Date().toISOString()
          },
          { onConflict: "id" }
        );

      if (saveError) throw saveError;

      setNotice("Institution settings saved successfully!");
    } catch (err) {
      console.error("Settings save failed:", err);
      setError(err.message || "Could not save institution settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="page-title">
        <div>
          <div className="eyebrow">SYSTEM // CONFIGURATION</div>
          <h1>ADMINISTRATION</h1>
          <p className="muted">
            Application configuration and institution settings.
          </p>
        </div>

        <Status>CONNECTED</Status>
      </div>

      <div className="two-col">
        <Panel title="INSTITUTION PROFILE">
          {loading ? (
            <p className="muted">Loading institution settings...</p>
          ) : (
            <form onSubmit={handleSave}>
              <div className="form-grid single">
                <label>
                  INSTITUTION NAME

                  <input
                    name="institution_name"
                    value={form.institution_name}
                    onChange={handleChange}
                    placeholder="Your institution"
                    required
                  />
                </label>

                <label>
                  ADMIN CONTACT

                  <input
                    name="admin_contact"
                    type="email"
                    value={form.admin_contact}
                    onChange={handleChange}
                    placeholder="admin@example.edu"
                    required
                  />
                </label>

                <label>
                  PUBLIC WEBSITE

                  <input
                    name="public_website"
                    type="url"
                    value={form.public_website}
                    onChange={handleChange}
                    placeholder="https://example.edu"
                  />
                </label>

                <button
                  type="submit"
                  className="button lime"
                  disabled={saving}
                >
                  {saving ? "SAVING..." : "SAVE SETTINGS"}
                </button>

                {notice && (
                  <p style={{ color: "#16a34a" }}>
                    ✓ {notice}
                  </p>
                )}

                {error && (
                  <p className="auth-error">
                    {error}
                  </p>
                )}
              </div>
            </form>
          )}
        </Panel>

        <Panel title="BLOCKCHAIN CONFIGURATION">
          <div className="config-row">
            <span>Target network</span>
            <b>Ethereum Sepolia</b>
          </div>

          <div className="config-row">
            <span>Contract address</span>
            <b className="mono">{CONTRACT_ADDRESS}</b>
          </div>

          <div className="config-row">
            <span>Database</span>
            <b>Supabase</b>
          </div>

          <div className="config-row">
            <span>Blockchain library</span>
            <b>Ethers.js</b>
          </div>

          <div className="notice">
            <LockKeyhole size={17} />
            Never put private keys or recovery phrases in frontend code.
          </div>
        </Panel>
      </div>
    </>
  );
}


// --------------------------------------------------
// AUTHENTICATION
// --------------------------------------------------

function Authentication({ onAuthenticated }) {
  const [mode, setMode] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (
      !email.trim() ||
      !password ||
      (mode === "signup" && !institution.trim())
    ) {
      setError("Complete all required fields.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { institution: institution.trim() }
          }
        });

        if (error) throw error;

        if (data.session && data.user) {
          onAuthenticated(data.user.email || email.trim());
        } else {
          setMode("signin");
          setError("Account created. Check your email for a confirmation link.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;

        if (data.user) {
          onAuthenticated(data.user.email || email.trim());
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  async function sendPasswordReset() {
    setError("");

    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) throw error;

      setError("If an account exists, a password reset link has been sent.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-top">
        <div className="brand">
          <Blocks size={22} />
          <span>
            TRUSTCHAIN <small>ENTERPRISE SECURITY CONSOLE</small>
          </span>
        </div>

        <span className="auth-top-note">
          IDENTITY ACCESS GATEWAY <b>● SECURE SESSION</b>
        </span>
      </div>

      <div className="auth-layout">
        <section className="auth-intro">
          <div className="eyebrow">
            DECENTRALIZED CREDENTIAL INFRASTRUCTURE // ACCESS NODE 01
          </div>

          <h1>TRUST IS<br /><span>VERIFIABLE.</span></h1>

          <p>
            Secure access to the certificate verification and issuance console.
            Authenticate to manage credentials and inspect document integrity.
          </p>

          <div className="auth-visual">
            <div className="auth-visual-top">
              <span>TRUSTCHAIN PROTOCOL</span>
              <span>SHA-256 // ETHEREUM</span>
            </div>

            <Fingerprint size={82} />

            <div className="auth-visual-bottom">
              <b>IDENTITY / ACCESS CONTROL</b>
              <span>SUPABASE AUTHENTICATION</span>
            </div>
          </div>

          <div className="auth-feature-row">
            <div><b>01</b><span>DOCUMENT<br />INTEGRITY</span></div>
            <div><b>02</b><span>VERIFIABLE<br />CREDENTIALS</span></div>
            <div><b>03</b><span>ON-CHAIN<br />ATTESTATION</span></div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-heading">
            <span className="eyebrow">SYSTEM ACCESS // AUTH-01</span>
            <Status>SUPABASE AUTH</Status>
          </div>

          <h2>{mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}</h2>

          <p className="muted">
            {mode === "signin"
              ? "Enter your credentials to access TrustChain."
              : "Register an operator profile for your institution."}
          </p>

          <div className="auth-tabs">
            <button
              className={mode === "signin" ? "selected" : ""}
              onClick={() => {
                setMode("signin");
                setError("");
              }}
            >
              SIGN IN
            </button>

            <button
              className={mode === "signup" ? "selected" : ""}
              onClick={() => {
                setMode("signup");
                setError("");
              }}
            >
              CREATE ACCOUNT
            </button>
          </div>

          <form onSubmit={submit} className="auth-form">
            {mode === "signup" && (
              <label>
                INSTITUTION / ORGANIZATION
                <input
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="Institution name"
                  required
                />
              </label>
            )}

            <label>
              EMAIL ADDRESS
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operator@institution.edu"
                required
              />
            </label>

            <label>
              PASSWORD
              <div className="password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  minLength={6}
                  required
                />

                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </label>

            {mode === "signin" && (
              <div className="auth-options">
                <label className="remember">
                  <input type="checkbox" defaultChecked />
                  REMEMBER THIS DEVICE
                </label>

                <button
                  type="button"
                  className="text-action"
                  onClick={sendPasswordReset}
                >
                  FORGOT PASSWORD?
                </button>
              </div>
            )}

            {error && <div className="auth-error" role="alert">{error}</div>}

            <button className="button lime auth-submit" type="submit" disabled={loading}>
              {loading
                ? "PLEASE WAIT..."
                : mode === "signin"
                  ? "AUTHENTICATE & ENTER CONSOLE"
                  : "CREATE ACCOUNT"}
              <ArrowUpRight size={15} />
            </button>
          </form>

          <div className="auth-footnote">
            <LockKeyhole size={14} />
            <span>AUTHENTICATION POWERED BY SUPABASE.</span>
          </div>
        </section>
      </div>

      <footer className="auth-footer">
        <span>TRUSTCHAIN DECENTRALIZED PROTOCOL</span>
        <span>ACCESS GATEWAY // BUILD 02.0</span>
        <span>● SUPABASE AUTH</span>
      </footer>
    </div>
  );
}

// --------------------------------------------------
// PUBLIC CERTIFICATE VERIFICATION
// --------------------------------------------------

function PublicVerificationPage() {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const certificateId = decodeURIComponent(
    window.location.pathname.split("/verify/")[1] || ""
  ).split("/")[0];

  useEffect(() => {
    let cancelled = false;

    async function fetchCertificate() {
      if (!certificateId) {
        setError("No certificate ID was provided.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc(
        "public_verify_certificate",
        { p_certificate_id: certificateId }
      );

      if (cancelled) return;

      if (error) {
        console.error("Public verification error:", error);
        setError("Unable to verify this certificate right now.");
      } else if (!data || data.length === 0) {
        setError("Certificate not found. Please check the Certificate ID.");
      } else {
        setCertificate(data[0]);
      }

      setLoading(false);
    }

    fetchCertificate();

    return () => {
      cancelled = true;
    };
  }, [certificateId]);

  const isRevoked = certificate?.status?.toLowerCase() === "revoked";
  const isConfirmed =
    certificate?.blockchain_status?.toLowerCase() === "confirmed";

  const verified = certificate && !isRevoked && isConfirmed;

  const statusColor = isRevoked
    ? "#ef4444"
    : verified
      ? "#16a34a"
      : "#d97706";

  const statusText = isRevoked
    ? "CERTIFICATE REVOKED"
    : verified
      ? "BLOCKCHAIN REGISTRATION RECORDED"
      : "VERIFICATION PENDING";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f5f0",
      color: "#17252b",
      padding: "40px 20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "35px"
        }}>
          <div style={{
            background: "#17252b",
            color: "#c5f36b",
            padding: "12px",
            borderRadius: "10px",
            fontWeight: "bold"
          }}>
            TC
          </div>

          <div>
            <h2 style={{ margin: 0 }}>TRUSTCHAIN</h2>
            <p style={{ margin: "4px 0", color: "#64748b" }}>
              PUBLIC VERIFICATION PORTAL
            </p>
          </div>
        </div>

        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "18px",
          padding: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
        }}>
          <div style={{
            fontSize: "12px",
            letterSpacing: "2px",
            color: "#64748b"
          }}>
            CERTIFICATE AUTHENTICITY CHECK
          </div>

          <h1 style={{ fontSize: "26px" }}>Certificate Verification</h1>

          <p style={{ color: "#64748b", lineHeight: 1.6 }}>
            Verify the registration status of this certificate using the TrustChain registry.
          </p>

          {loading ? (
            <p style={{ padding: "30px 0" }}>Checking certificate...</p>
          ) : error ? (
            <div style={{
              marginTop: "25px",
              padding: "18px",
              background: "#fff1f2",
              color: "#be123c",
              borderRadius: "10px"
            }}>
              <strong>VERIFICATION UNSUCCESSFUL</strong>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div style={{
                marginTop: "25px",
                padding: "20px",
                background: `${statusColor}12`,
                border: `1px solid ${statusColor}55`,
                borderRadius: "12px",
                color: statusColor
              }}>
                <strong>{statusText}</strong>

                <p style={{ marginBottom: 0, lineHeight: 1.5 }}>
                  {isRevoked
                    ? "This certificate has been marked as revoked."
                    : verified
                      ? "A confirmed blockchain registration is recorded in the TrustChain database. The transaction can be inspected below."
                      : "The certificate was found, but blockchain confirmation is pending or unsuccessful."}
                </p>
              </div>

              <h3 style={{
                marginTop: "30px",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "12px"
              }}>
                CERTIFICATE DETAILS
              </h3>

              {[
                ["Certificate ID", certificate.certificate_id],
                ["Recipient", certificate.recipient_name],
                ["Certificate Title", certificate.certificate_title],
                ["Institution", certificate.institution],
                ["Category", certificate.category],
                ["Issue Date", certificate.created_at
                  ? new Date(certificate.created_at).toLocaleDateString()
                  : "Not available"],
                ["Database Status", certificate.status],
                ["Blockchain Status", certificate.blockchain_status]
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "15px",
                  padding: "14px 0",
                  borderBottom: "1px solid #f1f5f9"
                }}>
                  <span style={{ color: "#64748b" }}>{label}</span>

                  <strong style={{
                    textAlign: "right",
                    overflowWrap: "anywhere"
                  }}>
                    {value || "Not available"}
                  </strong>
                </div>
              ))}

              {certificate.blockchain_tx_hash && (
  <div style={{ marginTop: "25px" }}>
    <p style={{ color: "#64748b" }}>ISSUANCE TRANSACTION</p>

    <a
      href={`https://eth-sepolia.blockscout.com/tx/${certificate.blockchain_tx_hash}`}
      target="_blank"
      rel="noreferrer"
      style={{
        color: "#2563eb",
        overflowWrap: "anywhere"
      }}
    >
      VIEW ISSUANCE ON BLOCKSCOUT ↗
    </a>
  </div>
)}

{isRevoked && (
  <div style={{
    marginTop: "20px",
    padding: "18px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "10px"
  }}>
    <h3 style={{ color: "#be123c", marginTop: 0 }}>
      REVOCATION DETAILS
    </h3>

    <p style={{ color: "#64748b" }}>REVOCATION DATE</p>

    <strong>
      {certificate.revoked_at
        ? new Date(certificate.revoked_at).toLocaleString()
        : "Not available"}
    </strong>

    {certificate.revocation_tx_hash ? (
      <>
        <p style={{ color: "#64748b", marginTop: "18px" }}>
          REVOCATION TRANSACTION
        </p>

        <a
          href={`https://eth-sepolia.blockscout.com/tx/${certificate.revocation_tx_hash}`}
          target="_blank"
          rel="noreferrer"
          style={{
            color: "#be123c",
            overflowWrap: "anywhere"
          }}
        >
          VIEW REVOCATION ON BLOCKSCOUT ↗
        </a>
      </>
    ) : (
      <p>Revocation transaction details are not available.</p>
    )}
  </div>
)}
            </>
          )}
        </div>

        <p style={{
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "12px",
          marginTop: "25px"
        }}>
          TRUSTCHAIN · BLOCKCHAIN-BASED CERTIFICATE VERIFICATION
        </p>
      </div>
    </div>
  );
}

// --------------------------------------------------
// MAIN APPLICATION
// --------------------------------------------------


export default function App() {
  const [active, setActive] = useState("01");
  const [authenticatedUser, setAuthenticatedUser] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Restore session and monitor authentication changes.
  useEffect(() => {
    let mounted = true;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          const user = session?.user;

          setAuthenticatedUser(user?.email || "");
          setIsAdmin(user?.app_metadata?.role === "admin");
        }
      }
    );

    async function restoreSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          const user = data.session?.user;

          setAuthenticatedUser(user?.email || "");
          setIsAdmin(user?.app_metadata?.role === "admin");
        }
      } catch (error) {
        console.error("Session restoration failed:", error);
      } finally {
        if (mounted) setCheckingSession(false);
      }
    }

    restoreSession();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Only administrators can access Issue Certificate and Administration.
  useEffect(() => {
    if (!isAdmin && (active === "03" || active === "06")) {
      setActive("01");
    }
  }, [isAdmin, active]);

  const activeName =
    tabs.find(t => t[0] === active)?.[1] || tabs[0][1];

  // Hide admin-only tabs from normal users.
  const visibleTabs = tabs.filter(([id]) => {
    if (id === "03" || id === "06") {
      return isAdmin;
    }

    return true;
  });

  const page = useMemo(() => {
    switch (active) {
      case "02":
        return <CertificateRegistry />;

      case "03":
        return isAdmin ? <IssueCertificate /> : (
          <VerificationConsole setTab={setActive} />
        );

      case "04":
        return <IntegrityVerification />;

      case "05":
        return <TransactionExplorer />;

      case "06":
        return isAdmin ? <Administration /> : (
          <VerificationConsole setTab={setActive} />
        );

      default:
        return <VerificationConsole setTab={setActive} />;
    }
  }, [active, isAdmin]);

  // Public verification does not require authentication.
  if (window.location.pathname.startsWith("/verify/")) {
    return <PublicVerificationPage />;
  }

  if (checkingSession) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <h2>LOADING TRUSTCHAIN...</h2>
        </div>
      </div>
    );
  }

  if (!authenticatedUser) {
    return <Authentication onAuthenticated={setAuthenticatedUser} />;
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
    } else {
      setActive("01");
      setIsAdmin(false);
      setAuthenticatedUser("");
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Blocks size={20} />
          <span>
            TRUSTCHAIN <small>ENTERPRISE SECURITY CONSOLE</small>
          </span>
        </div>

        <div className="top-chip">
          V2.0 // BLOCKCHAIN PROTOTYPE
        </div>

        <div className="network-chip">
          <i /> TESTNET-SEPOLIA
        </div>

        <div className="top-status">
          CONTRACT <b>DEPLOYED</b>
        </div>

        <div className="top-status">
          SESSION <b>{authenticatedUser}</b>
        </div>

        <div className="top-status">
          ROLE <b>{isAdmin ? "ADMIN" : "USER"}</b>
        </div>

        <div className="top-search">
          <Search size={14} />
          <input placeholder="Search digest or certificate ID..." />
        </div>

        <button className="button" onClick={handleSignOut}>
          LOG OUT
        </button>

        <WalletConnection />

        <button
          className="mobile-toggle"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          <Menu />
        </button>
      </header>

      <nav className={`nav-tabs ${mobileMenu ? "open" : ""}`}>
        {visibleTabs.map(([id, name]) => (
          <button
            key={id}
            className={active === id ? "active" : ""}
            onClick={() => {
              setActive(id);
              setMobileMenu(false);
            }}
          >
            <span>{id} —</span> {name}
          </button>
        ))}
      </nav>

      <main className="workspace">
        <div className="context-line">
          <span>{active} // {activeName.toUpperCase()}</span>
          <span className="demo-label">
            SEPOLIA // SUPABASE // SHA-256
          </span>
        </div>

        {page}
      </main>

      <footer className="footer">
        <span>
          TRUSTCHAIN DECENTRALIZED CERTIFICATE PROTOCOL
        </span>

        <span>
          SHA-256 FINGERPRINTING // ETHEREUM SEPOLIA
        </span>

        <span className="lime-text">
          ● BLOCKCHAIN ENABLED
        </span>
      </footer>
    </div>
  );
}

