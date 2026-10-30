
import { BrowserProvider, Contract } from "ethers";

const CONTRACT_ADDRESS =
  "0xBA741A4c9f78611586F0E00F1699E5EBd5eB6Ae5";

const CONTRACT_ABI = [
  "function registerCertificate(bytes32 documentHash) external",
  "function verifyCertificate(bytes32 documentHash) external view returns (bool exists, address issuer, uint256 issuedAt, bool revoked)",
  "function revokeCertificate(bytes32 documentHash) external"
];

async function getProvider() {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask.");
  }

  const provider = new BrowserProvider(window.ethereum);

  await provider.send("eth_requestAccounts", []);

  const network = await provider.getNetwork();

  if (network.chainId !== 11155111n) {
    throw new Error("Please switch MetaMask to Ethereum Sepolia.");
  }

  return provider;
}

export async function registerHashOnChain(hash) {
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const contract = new Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  );

  const tx = await contract.registerCertificate("0x" + hash);
  const receipt = await tx.wait();

  return {
    transactionHash: tx.hash,
    blockNumber: receipt.blockNumber
  };
}

export async function verifyHashOnChain(hash) {
  const provider = new BrowserProvider(window.ethereum);

  const contract = new Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    provider
  );

  return await contract.verifyCertificate("0x" + hash);
}

export async function revokeHashOnChain(hash) {
  const provider = await getProvider();
  const signer = await provider.getSigner();

  const contract = new Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  );

  const documentHash = "0x" + hash;

  const record = await contract.verifyCertificate(documentHash);

  if (!record.exists) {
    throw new Error("Certificate not found on blockchain.");
  }

  if (record.revoked) {
    throw new Error("Certificate is already revoked.");
  }

  const walletAddress = await signer.getAddress();

  if (record.issuer.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error(
      "Only the original issuing wallet can revoke this certificate."
    );
  }

  const tx = await contract.revokeCertificate(documentHash);
  const receipt = await tx.wait();

  return {
    transactionHash: tx.hash,
    blockNumber: receipt.blockNumber
  };
}
