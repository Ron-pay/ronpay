# 🚀 Quick Start: ERC-8004 Registration (DO THIS NOW!)

**Time Required:** 15 minutes  
**Cost:** ~$0.02 worth of CELO for gas

---

## ✅ Pre-Flight Checklist

- [ ] MetaMask installed
- [ ] Celo Mainnet added to MetaMask
- [ ] Small amount of CELO in wallet (~0.01 CELO)

---

## 🎯 Step-by-Step Guide

### 1. Add Celo Network to MetaMask

Click "Add Network" in MetaMask and enter:

```
Network Name: Celo Mainnet
RPC URL: https://forno.celo.org
Chain ID: 42220
Currency Symbol: CELO
Block Explorer: https://celoscan.io
```

### 2. Get CELO for Gas

**Option A:** Free Faucet (if available)
- Visit: https://faucet.celo.org
- Request test CELO

**Option B:** Bridge from another chain
- Use: https://app.celo.org/bridge
- Bridge small amount from Ethereum/Polygon

### 3. Register on 8004scan.io

1. **Visit:** https://8004scan.io

2. **Connect Wallet:**
   - Click "Connect Wallet"
   - Select MetaMask
   - Approve connection

3. **Create Agent:**
   - Click green **"create"** button
   - Fill in the form:

   ```
   Name: RonPay
   
   Description: AI-powered payment agent for Africa. Send money using natural language on Celo.
   
   Image URL: https://ronpay.xyz/images/ronpay-agent-avatar.png
   (or upload the file from: public/images/ronpay-agent-avatar.png)
   
   Tags: payments, ai, africa, celo, natural-language, bills, remittance
   
  Communication Endpoints:
   - API: https://api.ronpay.xyz/v1
   - WebSocket: wss://api.ronpay.xyz/chat
   
   Metadata: (paste contents from metadata/ronpay-agent-metadata.json)
   ```

4. **Confirm Transaction:**
   - Click "Create Agent"
   - Approve in MetaMask
   - Wait ~5 seconds for confirmation

5. **Save Your Agent ID!**
   - You'll get an Agent ID like `#42`
   - **COPY THIS NUMBER**
   - Save it to a safe place

### 4. Update README

```bash
# In the project root
nano README.md

# Find the line:
Agent ID: [YOUR_AGENT_ID]

# Replace with:
Agent ID: #<YOUR_NUMBER>
🔗 View Agent: https://8004scan.io/agent/<YOUR_NUMBER>

# Save and commit
git add README.md
git commit -m "feat: add ERC-8004 Agent ID"
git push
```

---

## 🎉 You're Done!

Your RonPay agent is now:
- ✅ Registered on blockchain
- ✅ Discoverable on 8004scan.io
- ✅ Has a unique Agent ID
- ✅ Ready for hackathon submission

---

## 📋 Next Steps

1. **SelfClaw Verification**
   - Visit: https://selfclaw.app/?v=1
   - Complete verification
   - Get badge

2. **Karma Registration**
   - Visit: https://www.karmahq.xyz/community/celo?programId=1044
   - Register RonPay project
   - Add Agent ID

3. **Start Building**
   - Implement Celo payment functionality
   - Add Claude AI integration
   - Build frontend

---

## 🆘 Need Help?

- **Telegram:** https://t.me/ERC8004
- **Celo Discord:** https://discord.gg/celo
- **Hackathon Group:** https://t.me/realworldagentshackathon

---

## 📸 Screenshot This!

Take a screenshot of your agent page for:
- Karma submission
- Twitter announcement
- Demo video

**Your agent URL:**
```
https://8004scan.io/agent/<YOUR_AGENT_ID>
```

---

**⏰ DO THIS TODAY (Feb 11)** - Don't wait until the last minute!
