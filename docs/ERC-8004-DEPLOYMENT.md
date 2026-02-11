# ERC-8004 Agent Deployment Guide for RonPay

## Overview

This guide walks through deploying RonPay as an ERC-8004 compliant agent on the Celo network and registering it on 8004scan.io.

**Timeline:** Complete before February 15, 2026 (Hackathon Deadline)

---

## What is ERC-8004?

ERC-8004 is a standard for **AI Agent Identity, Reputation, and Verification** on blockchain networks. It provides:

- **Identity Registry:** ERC-721 based portable agent identities
- **Reputation Registry:** Standardized feedback and rating system
- **Validation Registry:** Independent verification hooks

### Key Benefits for RonPay

✅ **Discoverable:** Listed on 8004scan.io agent explorer  
✅ **Trusted:** Verifiable on-chain identity with reputation  
✅ **Portable:** Agent ID works across all ERC-8004 platforms  
✅ **Hackathon Compliant:** Required for Celo submission

---

## Registration Process

### Step 1: Prepare Wallet

**Required:**
- MetaMask or compatible Web3 wallet
- Connected to **Celo Mainnet**
- Small amount of CELO for gas (~0.01 CELO)

**Celo Network Details:**
```
Network Name: Celo Mainnet
RPC URL: https://forno.celo.org
Chain ID: 42220
Currency Symbol: CELO
Block Explorer: https://celoscan.io
```

### Step 2: Prepare Agent Metadata

Create a JSON metadata file with RonPay's details:

```json
{
  "name": "RonPay",
  "description": "AI-powered payment agent for Africa. Send money, pay bills, and schedule payments using natural language on Celo blockchain.",
  "image": "https://ronpay.xyz/images/ronpay-agent-avatar.png",
  "version": "1.0.0",
  "capabilities": [
    "natural-language-payment-processing",
    "cross-border-remittances",
    "bill-payment-vtpass",
    "recurring-payment-scheduling",
    "multi-stablecoin-support",
    "sms-notifications"
  ],
  "communication": {
    "protocols": [
      "https",
      "websocket"
    ],
    "endpoints": {
      "api": "https://api.ronpay.xyz/v1",
      "chat": "wss://api.ronpay.xyz/chat"
    }
  },
  "blockchain": {
    "networks": ["celo"],
    "supportedTokens": ["cUSD", "cKES", "cREAL", "CELO"],
    "walletAddress": "0x..." 
  },
  "regions": ["Nigeria", "Kenya", "Ghana", "South Africa"],
  "languages": ["en", "yo", "sw", "ha"],
  "trustMechanisms": ["erc-8004-reputation", "transaction-history", "user-ratings"],
  "externalUrl": "https://ronpay.xyz",
  "documentation": "https://docs.ronpay.xyz"
}
```

**Action Items:**
- [ ] Create agent avatar image (256x256px PNG)
- [ ] Deploy metadata JSON to IPFS or HTTPS URL
- [ ] Get deployment wallet address for `walletAddress` field

### Step 3: Register on 8004scan.io

1. **Visit:** https://8004scan.io

2. **Connect Wallet:**
   - Click "Connect Wallet" button
   - Select MetaMask (or your wallet)
   - Ensure Celo Mainnet is selected
   - Approve the connection

3. **Create Agent:**
   - Navigate to "Create Agent" page
   - Or click the green **"create"** button

4. **Fill Agent Details:**

   | Field | Value |
   |-------|-------|
   | **Name** | RonPay |
   | **Description** | AI-powered payment agent for Africa. Send money using natural language on Celo. |
   | **Image URL** | `https://ronpay.xyz/images/avatar.png` |
   | **Communication Endpoints** | API: `https://api.ronpay.xyz/v1`<br>WebSocket: `wss://api.ronpay.xyz/chat` |
   | **Capabilities/Tags** | `payments`, `ai`, `africa`, `celo`, `natural-language`, `bills`, `remittance` |
   | **Metadata Storage** | Choose one:<br>• IPFS URL: `ipfs://Qm...`<br>• HTTPS URL: `https://ronpay.xyz/metadata.json`<br>• Auto-upload (let 8004scan host it) |

5. **Preview Metadata:**
   - Review the generated metadata JSON
   - Ensure all fields are correct

6. **Confirm Transaction:**
   - Click "Create Agent"
   - MetaMask will open for signature
   - **Gas Fee:** ~0.01 CELO (very cheap!)
   - Confirm and wait for transaction

7. **Get Agent ID:**
   - Upon success, you'll receive your **Agent ID** (e.g., `#42`)
   - This is an ERC-721 NFT token ID
   - **SAVE THIS ID** - needed for hackathon submission!

8. **Verify Registration:**
   - Visit: `https://8004scan.io/agent/[YOUR_AGENT_ID]`
   - Example: `https://8004scan.io/agent/42`
   - Confirm all details are correct

---

## Post-Registration Tasks

### Update README.md

Replace placeholders with actual Agent ID:

```diff
- Agent ID: [YOUR_AGENT_ID]
+ Agent ID: #42
+ 🔗 View Agent: https://8004scan.io/agent/42
```

### Update Hackathon Submission

**Karma Project:**
- Add Agent ID to project description
- Link to 8004scan profile

**Tweet:**
```
🤖 Built RonPay for @Celo Real World Agents Hackathon!

AI-powered payment agent for Africa 🌍
💬 Send money using natural language
⚡ Powered by Celo + Claude AI

🆔 Agent ID: #42
🔗 8004scan: https://8004scan.io/agent/42
✅ Verified: [SelfClaw Link]

@Celo @CeloDevs #CeloAgents #RealWorldAI
```

---

## Metadata Hosting Options

### Option 1: IPFS (Decentralized - Recommended)

**Pros:** Permanent, decentralized, hackathon-friendly

```bash
# Install IPFS CLI
npm install -g ipfs

# Add metadata file
ipfs add metadata.json
# Output: added QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx metadata.json

# Use this URL in 8004scan:
# ipfs://QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx
```

**Alternative:** Use https://nft.storage or https://pinata.cloud for free pinning

### Option 2: HTTPS (Centralized - Easier)

**Pros:** Simple, familiar, works immediately

```bash
# Host on your domain
# https://ronpay.xyz/erc8004-metadata.json

# Or use GitHub Pages
# https://ronpay.github.io/metadata.json
```

### Option 3: Auto-Upload (Easiest)

Let 8004scan.io host the metadata for you during registration.

**Pros:** Zero setup, just paste the JSON  
**Cons:** Less control, centralized

---

## Agent Avatar Creation

RonPay needs a visual identity for 8004scan.

### Requirements:
- **Format:** PNG with transparency
- **Size:** 256x256px (or larger, will be resized)
- **Style:** Modern, clean, recognizable

### Design Suggestions:
- Combine: 🤖 (AI) + 💳 (Payment) + 🌍 (Africa)
- Use Celo brand colors: #FCFF52 (yellow), #35D07F (green)
- Make it work on light and dark backgrounds

### Quick Generation:
I can generate this using the `generate_image` tool after we agree on a design.

---

## Smart Contract Details

**ERC-8004 Identity Registry (Celo Mainnet):**
- Contract: `0x...` (will be provided by 8004scan)
- Type: ERC-721 (NFT)
- Function: `createAgent(string memory agentURI)`
- Token ID: Your Agent ID

**View on Explorer:**
```
https://celoscan.io/address/[REGISTRY_CONTRACT]
```

---

## Verification Checklist

Before submitting to hackathon:

- [ ] Wallet has CELO for gas
- [ ] Agent metadata JSON created
- [ ] Agent avatar image ready
- [ ] Metadata hosted (IPFS/HTTPS)
- [ ] Registered on 8004scan.io
- [ ] Agent ID obtained (#XX)
- [ ] Agent profile visible: `8004scan.io/agent/XX`
- [ ] README.md updated with Agent ID
- [ ] SelfClaw verification completed (next step)
- [ ] Karma project updated
- [ ] Tweet prepared with Agent ID

---

## Troubleshooting

### "Insufficient Funds for Gas"
- Get free CELO from faucet: https://faucet.celo.org
- Or swap small amount on Uniswap/Mento

### "Transaction Failed"
- Ensure you're on Celo Mainnet (Chain ID: 42220)
- Check gas settings in MetaMask
- Try increasing gas limit slightly

### "Metadata Invalid"
- Validate JSON syntax: https://jsonlint.com
- Ensure all required fields present
- Check image URL is accessible

### "Image Not Loading"
- Use direct image URL (not HTML page)
- Ensure HTTPS or IPFS protocol
- Test URL in browser first
- CORS headers must allow 8004scan.io

---

## Next Steps

After ERC-8004 registration:

1. **SelfClaw Verification** → See: `docs/SELFCLAW-VERIFICATION.md`
2. **Karma Registration** → See: `docs/KARMA-SUBMISSION.md`
3. **Backend Implementation** → Start Celo integration
4. **Frontend Development** → Build chat UI

---

## Resources

- **ERC-8004 Spec:** https://eips.ethereum.org/EIPS/eip-8004
- **8004scan.io:** https://8004scan.io
- **ERC-8004 Contracts:** https://github.com/erc-8004/erc-8004-contracts
- **Best Practices:** https://best-practices.8004scan.io/
- **Celo Docs:** https://docs.celo.org
- **Support:** https://t.me/ERC8004

---

## Estimated Time

- **Preparation:** 30 minutes
- **Registration:** 10 minutes
- **Verification:** 5 minutes
- **Total:** ~45 minutes

**DO THIS TODAY!** (Feb 11, 2026)
