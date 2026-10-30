
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  Activity, ArrowDownToLine, ArrowUpRight, Blocks, Check, ChevronDown,
  CircleAlert, Copy, FileCheck2, FileSearch, FileText, Fingerprint,
  Gauge, KeyRound, LockKeyhole, Menu, Search, Settings, ShieldCheck,
  Upload, Wallet, X, Zap
} from "lucide-react";

const tabs = [
  ["01", "Verification Console"],
  ["02", "Certificate Registry"],
  ["03", "Issue Certificate"],
  ["04", "Integrity Verification"],
  ["05", "Transaction Explorer"],
  ["06", "Administration"],
];

const demoCertificates = [
  ["TC-9924-SEC", "Dr. Elena Rostova", "Identity Anchor", "ATTESTED", "0x7f4a...192a"],
  ["TC-9882-EDU", "Global Aerospace Labs", "Academic", "ATTESTED", "0x8a92...c391"],
  ["TC-9741-GOV", "Ministry of Digital Infra", "National ID", "PENDING", "0x093f...bc21"],
  ["TC-9610-ISO", "QuantumSecure AG", "ISO Audit", "ATTESTED", "0xbb22...f182"],
  ["TC-9504-CORP", "BioTech Alliance", "Pharma", "REVOKED", "0xee14...a2c0"],
];

function Status({ children }) {
  const cls = String(children).toLowerCase().replaceAll(" ", "-");
  return <span className={`status status-${cls}`}>{children}</span>;
}

function Panel({ title, right, children, className = "" }) {
  return <section className={`panel ${className}`}>
    <div className="panel-head"><span>{title}</span>{right && <span className="muted">{right}</span>}</div>
    <div className="panel-body">{children}</div>
  </section>;
}

function Metric({ label, value, note, warning }) {
  return <div className="metric">
    <div className="metric-label">{label}</div>
    <div className="metric-value">{value}</div>
    <div className={warning ? "metric-note warn" : "metric-note"}>{note}</div>
  </div>;
}

function VerificationConsole({ setTab }) {
  return <>
    <div className="metrics">
      <Metric label="INDEXED ATTESTATIONS" value="5" note="Demo records in local preview" />
      <Metric label="ACTIVE ROOTS" value="1" note="Demo registry root" />
      <Metric label="LEDGER GAS / TX" value="—" note="Connect Sepolia to retrieve" />
      <Metric label="CONSENSUS INTEGRITY" value="NOT CONNECTED" note="No validator telemetry configured" warning />
    </div>
    <div className="querybar">
      <span className="param">[PARAM_IN] DOC_FINGERPRINT_HASH</span>
      <input aria-label="Digest search" placeholder="Paste a SHA-256 digest or certificate ID..." />
      <button className="button lime" onClick={() => setTab("04")}>RESOLVE ATTESTATION</button>
    </div>
    <div className="two-col main-grid">
      <div className="stack">
        <Panel title="■ IDENTITY CREDENTIAL // TRUSTCHAIN REGISTRY" right="DEMO RECORD">
          <div className="hero-cert">
            <div>
              <div className="eyebrow">GLOBAL VERIFIED SPECIFICATION // DEMO</div>
              <h1>GLOBAL MASTER TRUST ROOT &amp; IDENTITY CREDENTIAL</h1>
              <p className="muted">A certificate registry prototype demonstrating document fingerprints and on-chain attestation workflows.</p>
              <div className="detail-grid">
                <div><small>SERIAL</small><b>TC-9924-SEC</b></div>
                <div><small>REGISTRY SLOT</small><b>LOCAL DEMO</b></div>
                <div><small>ATTESTATION TIME</small><b>Not yet registered</b></div>
                <div><small>VALIDITY PERIOD</small><b className="lime-text">DEMO ONLY</b></div>
                <div><small>HASH ENGINE</small><b>SHA-256 / Web Crypto</b></div>
                <div><small>SIGNATURE TYPE</small><b>Pending wallet integration</b></div>
              </div>
            </div>
            <div className="qr-placeholder"><Fingerprint size={72}/><small>FINGERPRINT<br/>PREVIEW</small></div>
          </div>
          <div className="verified-strip"><ShieldCheck/><div><b>LOCAL DEMO STATE</b><small>This interface is not connected to a deployed contract yet.</small></div><Status>DEMO</Status></div>
          <div className="two-col inner-grid">
            <div className="inset"><small>ISSUING AUTHORITY</small><h3>TrustChain Root CA</h3><p className="muted">Sample institution record for UI demonstration.</p></div>
            <div className="inset"><small>SMART CONTRACT EXECUTION</small><h3>Not connected</h3><p className="muted">Sepolia contract address will appear after deployment.</p></div>
          </div>
        </Panel>
        <Panel title="⌘ MERKLE PROOF PATHWAY // CONCEPTUAL VIEW" right="ILLUSTRATIVE">
          <div className="proof-tree">
            <div className="proof-node root">REGISTRY ROOT<br/><b>0x… — awaiting contract</b></div>
            <div className="proof-branch"><div className="proof-node">BRANCH HASH<br/>Pending</div><div className="proof-node dim">SIBLING HASH<br/>Pending</div></div>
            <div className="proof-node leaf">LEAF // CERTIFICATE DIGEST<br/><b>Generated when a PDF is selected</b></div>
          </div>
        </Panel>
      </div>
      <div className="stack">
        <Panel title="VALIDATOR / NETWORK TELEMETRY" right="NOT CONNECTED">
          <div className="empty-state"><Activity size={28}/><b>No live telemetry</b><span>Connect a blockchain provider to display real network data.</span></div>
        </Panel>
        <Panel title="ISSUANCE PIPELINE" right="LOCAL PREVIEW">
          {demoCertificates.slice(0,3).map(c=><div className="pipeline-row" key={c[0]}><b>{c[0]}</b><Status>{c[3]}</Status><small>{c[4]}</small></div>)}
        </Panel>
        <Panel title="QUICK OPERATIONS">
          <button className="button full lime" onClick={()=>setTab("03")}><Upload size={15}/> ISSUE CERTIFICATE</button>
          <button className="button full" onClick={()=>setTab("04")}><ShieldCheck size={15}/> VERIFY DOCUMENT</button>
          <button className="button full" onClick={()=>setTab("02")}><FileSearch size={15}/> OPEN REGISTRY</button>
        </Panel>
        <Panel title="PROTOTYPE NOTICE">
          <p className="muted">Counts, sample records and telemetry on this screen are illustrative. Only locally calculated file hashes are real at this stage.</p>
        </Panel>
      </div>
    </div>
  </>;
}

function CertificateRegistry() {
  const [query, setQuery] = useState("");
  const rows = demoCertificates.filter(r => r.join(" ").toLowerCase().includes(query.toLowerCase()));
  return <>
    <div className="page-title"><div><div className="eyebrow">CATALOG QUERY // LOCAL DEMO DATA</div><h1>CERTIFICATE REGISTRY</h1></div><Status>SIMULATED REPOSITORY</Status></div>
    <div className="toolbar"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search certificate ID, recipient or digest..."/></div>
    <Panel title="REGISTRY ENTRIES" right={`${rows.length} DISPLAYED`}>
      <div className="table-wrap"><table><thead><tr><th>ID</th><th>RECIPIENT / SUBJECT</th><th>CATEGORY</th><th>STATUS</th><th>DIGEST</th></tr></thead>
      <tbody>{rows.map(r=><tr key={r[0]}><td className="lime-text">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><Status>{r[3]}</Status></td><td className="mono">{r[4]}</td></tr>)}</tbody></table></div>
      {rows.length===0 && <p className="muted">No matching demo records.</p>}
    </Panel>
  </>;
}

function IssueCertificate() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [issuer, setIssuer] = useState("");
  const [message, setMessage] = useState("");
  async function hashFile(selected) {
    setFile(selected); setHash(""); setMessage("");
    if (!selected) return;
    setBusy(true);
    try {
      const bytes = await selected.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      setHash([...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join(""));
    } catch { setMessage("Hash generation failed in this browser."); }
    finally { setBusy(false); }
  }
  return <div className="two-col issue-layout">
    <div className="stack">
      <div className="page-title"><div><div className="eyebrow">STAGE 01 // DOCUMENT INGESTION</div><h1>ISSUE CERTIFICATE</h1><p className="muted">Create a document fingerprint before blockchain registration.</p></div></div>
      <Panel title="01 // DOCUMENT UPLOAD" right="LOCAL HASHING">
        <label className="dropzone"><Upload size={30}/><b>{file ? file.name : "Choose a certificate PDF"}</b><span>PDF recommended · File stays in this browser</span><input type="file" accept="application/pdf" onChange={e=>hashFile(e.target.files?.[0])}/></label>
        {file && <div className="file-meta"><span>{(file.size/1024).toFixed(1)} KB</span><span>{file.type || "Unknown type"}</span></div>}
      </Panel>
      <Panel title="02 // CANONICAL METADATA">
        <div className="form-grid">
          <label>RECIPIENT NAME<input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="Full legal name"/></label>
          <label>ISSUING INSTITUTION<input value={issuer} onChange={e=>setIssuer(e.target.value)} placeholder="Institution name"/></label>
          <label>CERTIFICATE TITLE<input placeholder="e.g. Software Engineering Internship"/></label>
          <label>CATEGORY<select defaultValue=""><option value="" disabled>Select category</option><option>Education</option><option>Internship</option><option>Achievement</option><option>Professional</option></select></label>
        </div>
      </Panel>
    </div>
    <div className="stack">
      <Panel title="03 // REAL-TIME SHA-256" right={busy ? "COMPUTING…" : hash ? "COMPUTED LOCALLY" : "AWAITING FILE"}>
        <div className="hash-box">{hash || "Upload a PDF to calculate its SHA-256 digest."}</div>
        {hash && <button className="button" onClick={()=>navigator.clipboard?.writeText(hash)}><Copy size={14}/> COPY HASH</button>}
      </Panel>
      <Panel title="04 // REGISTRATION PREVIEW">
        <div className="notice"><CircleAlert size={17}/> No smart contract is connected yet. This button does not submit a blockchain transaction.</div>
        <button className="button lime full" disabled={!hash || !recipient || !issuer} onClick={()=>setMessage("Fingerprint generated successfully. Blockchain registration is not configured yet.")}>GENERATE FINGERPRINT &amp; PREPARE</button>
        {message && <p className="lime-text">{message}</p>}
      </Panel>
    </div>
  </div>;
}

function IntegrityVerification() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState("");
  const [target, setTarget] = useState("");
  const [result, setResult] = useState("");
  async function inspect(f) {
    setFile(f); setResult(""); setHash("");
    if (!f) return;
    const digest = await crypto.subtle.digest("SHA-256", await f.arrayBuffer());
    setHash([...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join(""));
  }
  return <>
    <div className="page-title"><div><div className="eyebrow">MODULE 04 // DOCUMENT AUDIT</div><h1>DOCUMENT INTEGRITY &amp; TAMPER DETECTION</h1><p className="muted">Calculate a local SHA-256 fingerprint and compare it with a known digest.</p></div></div>
    <div className="two-col">
      <Panel title="LOCAL DOCUMENT SPECIMEN"><label className="dropzone"><FileText size={30}/><b>{file?.name || "Select document to inspect"}</b><span>File is hashed locally in your browser</span><input type="file" onChange={e=>inspect(e.target.files?.[0])}/></label></Panel>
      <Panel title="EXPECTED REGISTERED DIGEST">
        <input className="wide-input mono" value={target} onChange={e=>setTarget(e.target.value)} placeholder="Paste expected SHA-256 hash"/>
        <div className="hash-box mono">{hash || "Computed document digest will appear here."}</div>
        <button className="button lime full" disabled={!hash || !target.trim()} onClick={()=>setResult(hash.toLowerCase()===target.trim().replace(/^0x/,"").toLowerCase()?"MATCH":"MISMATCH")}>COMPARE FINGERPRINTS</button>
      </Panel>
    </div>
    {result && <div className={`result-banner ${result==="MATCH"?"good":"bad"}`}><ShieldCheck/><div><b>{result==="MATCH"?"DIGEST MATCH":"DIGEST MISMATCH"}</b><small>{result==="MATCH"?"The two supplied fingerprints are identical. This does not independently prove blockchain registration.":"The uploaded document does not match the supplied expected digest."}</small></div></div>}
  </>;
}

function TransactionExplorer() {
  return <>
    <div className="page-title"><div><div className="eyebrow">NETWORK EXPLORER // TESTNET</div><h1>TRANSACTION EXPLORER</h1><p className="muted">Live transaction data will appear after a Sepolia provider and contract are configured.</p></div><Status>NOT CONNECTED</Status></div>
    <div className="metrics"><Metric label="NETWORK" value="Sepolia" note="Configured target only"/><Metric label="BLOCK HEIGHT" value="—" note="Awaiting RPC"/><Metric label="GAS PRICE" value="—" note="Not retrieved"/><Metric label="TRANSACTIONS" value="0" note="No transactions loaded"/></div>
    <Panel title="TRANSACTION LEDGER"><div className="empty-state"><Blocks size={34}/><b>No blockchain transactions loaded</b><span>We will connect this screen to Ethers.js after deploying the contract.</span></div></Panel>
  </>;
}

function Administration() {
  return <>
    <div className="page-title"><div><div className="eyebrow">SYSTEM // CONFIGURATION</div><h1>ADMINISTRATION</h1><p className="muted">Application configuration and institution settings.</p></div><Status>LOCAL PREVIEW</Status></div>
    <div className="two-col">
      <Panel title="INSTITUTION PROFILE"><div className="form-grid single"><label>INSTITUTION NAME<input placeholder="Your institution"/></label><label>ADMIN CONTACT<input placeholder="admin@example.edu"/></label><label>PUBLIC WEBSITE<input placeholder="https://example.edu"/></label><button className="button lime">SAVE LOCAL FORM</button></div></Panel>
      <Panel title="BLOCKCHAIN CONFIGURATION"><div className="config-row"><span>Target network</span><b>Ethereum Sepolia</b></div><div className="config-row"><span>Wallet</span><b>Not connected</b></div><div className="config-row"><span>Contract address</span><b>Not deployed</b></div><div className="config-row"><span>Authentication</span><b>Not configured</b></div><div className="notice"><LockKeyhole size={17}/> Never put private keys or seed phrases in frontend code.</div></Panel>
    </div>
  </>;
}


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

    if (!email.trim() || !password || (mode === "signup" && !institution.trim())) {
      setError("Complete all required fields to continue.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
  email: email.trim(),
  password,
  options: {
    data: { institution: institution.trim() }
  }
});



        if (signUpError) throw signUpError;

        if (data.session && data.user) {
          onAuthenticated(data.user.email || email.trim());
        } else {
          setMode("signin");
          setError("Account created. Check your email for a confirmation link, then sign in.");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (signInError) throw signInError;
        if (data.user) onAuthenticated(data.user.email || email.trim());
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function sendPasswordReset() {
    setError("");
    if (!email.trim()) {
      setError("Enter your email address first, then select Forgot Password.");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim()
      );
      if (resetError) throw resetError;
      setError("If an account exists for this email, a password reset link has been sent.");
    } catch (err) {
      setError(err.message || "Could not request a password reset.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="auth-screen">
    <div className="auth-top">
      <div className="brand"><Blocks size={22}/><span>TRUSTCHAIN <small>ENTERPRISE SECURITY CONSOLE</small></span></div>
      <span className="auth-top-note">IDENTITY ACCESS GATEWAY <b>● SECURE SESSION</b></span>
    </div>
    <div className="auth-layout">
      <section className="auth-intro">
        <div className="eyebrow">DECENTRALIZED CREDENTIAL INFRASTRUCTURE // ACCESS NODE 01</div>
        <h1>TRUST IS<br/><span>VERIFIABLE.</span></h1>
        <p>Secure access to the certificate verification and issuance console. Authenticate to manage credentials, inspect document integrity, and review registry activity.</p>
        <div className="auth-visual">
          <div className="auth-visual-top"><span>TRUSTCHAIN PROTOCOL</span><span>SHA-256 // ETHEREUM</span></div>
          <Fingerprint size={82}/>
          <div className="auth-visual-bottom"><b>IDENTITY / ACCESS CONTROL</b><span>SUPABASE AUTHENTICATION</span></div>
        </div>
        <div className="auth-feature-row"><div><b>01</b><span>DOCUMENT<br/>INTEGRITY</span></div><div><b>02</b><span>VERIFIABLE<br/>CREDENTIALS</span></div><div><b>03</b><span>ON-CHAIN<br/>ATTESTATION</span></div></div>
      </section>
      <section className="auth-card">
        <div className="auth-card-heading"><span className="eyebrow">SYSTEM ACCESS // AUTH-01</span><Status>SUPABASE AUTH</Status></div>
        <h2>{mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}</h2>
        <p className="muted">{mode === "signin" ? "Enter your credentials to access the TrustChain console." : "Register an operator profile for your institution."}</p>
        <div className="auth-tabs">
          <button type="button" className={mode === "signin" ? "selected" : ""} onClick={() => {setMode("signin");setError("");}}>SIGN IN</button>
          <button type="button" className={mode === "signup" ? "selected" : ""} onClick={() => {setMode("signup");setError("");}}>CREATE ACCOUNT</button>
        </div>
        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && <label>INSTITUTION / ORGANIZATION<input value={institution} onChange={e=>setInstitution(e.target.value)} placeholder="e.g. VES Institute of Technology" autoComplete="organization" required/></label>}
          <label>EMAIL ADDRESS<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="operator@institution.edu" autoComplete="email" required/></label>
          <label>PASSWORD<div className="password-wrap"><input type={showPassword ? "text" : "password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} required/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword ? "HIDE" : "SHOW"}</button></div></label>
          {mode === "signin" && <div className="auth-options"><label className="remember"><input type="checkbox" defaultChecked/> REMEMBER THIS DEVICE</label><button type="button" className="text-action" onClick={sendPasswordReset}>FORGOT PASSWORD?</button></div>}
          {error && <div className="auth-error" role="alert">{error}</div>}
          <button className="button lime auth-submit" type="submit" disabled={loading}>{loading ? "PLEASE WAIT..." : mode === "signin" ? "AUTHENTICATE & ENTER CONSOLE" : "CREATE ACCOUNT"} <ArrowUpRight size={15}/></button>
        </form>
        <div className="auth-divider"><span/> OR <span/></div>
        <button className="button auth-wallet" type="button" onClick={()=>setError("Wallet sign-in will be enabled after MetaMask integration.")}><Wallet size={15}/> CONTINUE WITH CRYPTO WALLET</button>
        <div className="auth-footnote"><LockKeyhole size={14}/><span>AUTHENTICATION POWERED BY SUPABASE. Wallet sign-in is not configured yet.</span></div>
      </section>
    </div>
    <footer className="auth-footer"><span>TRUSTCHAIN DECENTRALIZED PROTOCOL</span><span>ACCESS GATEWAY // BUILD 01.0</span><span>● SUPABASE AUTH</span></footer>
  </div>;
}

export default function App() {
  const [active, setActive] = useState("01");
  const [authenticatedUser, setAuthenticatedUser] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

 useEffect(() => {
  let mounted = true;

  const { data: authListener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (mounted) {
        setAuthenticatedUser(session?.user?.email || "");
      }
    }
  );

  async function restoreSession() {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (mounted) {
        setAuthenticatedUser(data.session?.user?.email || "");
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

  const activeName = tabs.find(t=>t[0]===active)?.[1] || tabs[0][1];
  const page = useMemo(() => {
    switch(active) {
      case "02": return <CertificateRegistry/>;
      case "03": return <IssueCertificate/>;
      case "04": return <IntegrityVerification/>;
      case "05": return <TransactionExplorer/>;
      case "06": return <Administration/>;
      default: return <VerificationConsole setTab={id=>setActive(id)}/>;
    }
  }, [active]);

  if (checkingSession) {
    return <div className="auth-screen"><div className="auth-card"><h2>LOADING TRUSTCHAIN...</h2></div></div>;
  }

  if (!authenticatedUser) {
    return <Authentication onAuthenticated={setAuthenticatedUser}/>;
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
  }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><Blocks size={20}/><span>TRUSTCHAIN <small>ENTERPRISE SECURITY CONSOLE</small></span></div>
      <div className="top-chip">V1.0 // PROTOTYPE</div>
      <div className="network-chip"><i/> TESTNET-SEPOLIA / NOT CONNECTED</div>
      <div className="top-status">BLOCK — <b>NO RPC</b></div>
      <div className="top-status">SESSION <b>{authenticatedUser}</b></div>
      <div className="top-search"><Search size={14}/><input placeholder="Search digest or certificate ID..."/></div>
      <button className="button" onClick={handleSignOut}>LOG OUT</button>
      <button className="wallet-button" onClick={()=>alert("Wallet connection will be added after smart contract deployment.")}><Wallet size={15}/> CONNECT WALLET</button>
      <button className="mobile-toggle" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button>
    </header>
    <nav className={`nav-tabs ${mobileMenu?"open":""}`}>
      {tabs.map(([id,name])=><button key={id} className={active===id?"active":""} onClick={()=>{setActive(id);setMobileMenu(false)}}><span>{id} —</span> {name}</button>)}
    </nav>
    <main className="workspace">
      <div className="context-line"><span>{active} // {activeName.toUpperCase()}</span><span className="demo-label">DEMO DATA // NO LIVE CHAIN CONNECTION</span></div>
      {page}
    </main>
    <footer className="footer"><span>TRUSTCHAIN DECENTRALIZED CERTIFICATE PROTOCOL</span><span>SHA-256 FINGERPRINTING // PROTOTYPE BUILD</span><span className="lime-text">● LOCAL PREVIEW</span></footer>
  </div>;
}
