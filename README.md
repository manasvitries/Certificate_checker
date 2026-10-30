# 🔐 TrustChain – Blockchain-Based Certificate Verification

**TrustChain** is a secure certificate management and verification platform designed to make academic certificate verification more transparent, reliable, and tamper-resistant.

🌐 **Live Demo:** https://trustchain-theta.vercel.app/

📂 **GitHub Repository:** https://github.com/manasvitries/Certificate_checker

## ✨ Features

- **Certificate Issuance:** Admins can issue and register certificates.
- **Certificate Registry:** View and manage registered certificates.
- **Blockchain Verification:** Verify certificate records using the Ethereum Sepolia test network.
- **Integrity Verification:** Generate and compare SHA-256 hashes of certificate PDFs.
- **Public Verification:** Verify certificates through a unique public verification link.
- **QR Code Generation:** Generate QR codes for easy certificate verification.
- **Certificate Revocation:** Revoke certificates and display their revocation status.
- **Transaction Explorer:** View issuance and revocation transactions with blockchain explorer links.
- **Role-Based Access:** Separate administrator functionality from regular authenticated users.
- **Institution Management:** Save and manage institutional information.
- **Secure Authentication:** User authentication and database management through Supabase.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend |
| Vite | Development and build tool |
| Tailwind CSS | Styling |
| Supabase | Authentication and database |
| Ethers.js | Ethereum blockchain interaction |
| Ethereum Sepolia | Test blockchain network |
| QRCode | QR code generation |
| Vercel | Deployment |

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/manasvitries/Certificate_checker.git
```

### 2. Navigate to the project folder

```bash
cd Certificate_checker/trustchain
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file inside the `trustchain` folder.

Add your Supabase project credentials using the exact variable names expected by `src/lib/supabaseClient.js`.

For example:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Never expose your Supabase service-role key or wallet private keys in frontend environment variables.

### 5. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

### 6. Build for production

```bash
npm run build
```

## 🌐 Deployment

TrustChain is deployed using **Vercel**.

Visit the live application:

👉 https://trustchain-theta.vercel.app/

## 🔒 Security

- Supabase Row Level Security (RLS) policies protect database operations.
- Role-based authorization restricts administrative functionality.
- SHA-256 hashing helps detect certificate file modifications.
- Blockchain transaction references provide a verifiable record of issuance and revocation.

## 🎯 Project Objective

The goal of TrustChain is to reduce certificate fraud and simplify academic credential verification through blockchain technology, cryptographic hashing, and secure digital record management.

## 👩‍💻 Author

**Manasvi Wairkar**

B.Tech – Information Technology

GitHub: [@manasvitries](https://github.com/manasvitries)

---

⭐ If you find this project interesting, consider giving the repository a star!
