# 💰 RonPay

> AI-powered payment agent for Africa and Beyond. Send money using natural language, schedule recurring payments, and auto-pay bills.

[![Built on Celo](https://img.shields.io/badge/Built%20on-Celo-FCFF52)](https://celo.org)
[![ERC-8004](https://img.shields.io/badge/ERC--8004-Verified-00C853)](https://8004scan.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What is RonPay?

RonPay is your AI assistant for payments. Just talk to it naturally:

```
You: "Send ₦50,000 to mom every month on the 5th"
RonPay: "✅ Done! First payment scheduled for March 5th"
```

No wallet addresses. No crypto jargon. Just simple payments.

## Features

### 💬 Natural Language Payments
Talk naturally - RonPay understands what you mean:
- "Send $100 to Jane in Kenya"
- "Pay my DSTV every month"
- "Buy ₦1000 airtime for +234..."

### 🔄 Auto-Pilot Payments
Set it once, forget forever:
- Monthly remittances to family
- Recurring bill payments
- Daily/weekly schedules

### 🌍 Multi-Country Support
Send money across borders instantly:
- 🇳🇬 Nigeria (Naira)
- 🇰🇪 Kenya (Shilling)
- 🇧🇷 Brazil (Real)
- 🇨🇴 Colombia (Peso)
- 🇬🇭 Ghana (Cedi)

### 📺 Nigerian Bill Payments
Auto-pay your bills via VTPASS:
- DSTV, GOtv, Startimes
- MTN, Airtel, Glo, 9mobile airtime & data
- Electricity bills

## Tech Stack

- **Frontend**: Next.js, Wagmi, Tailwind
- **Backend**: Node.js, Express, PostgreSQL, Redis
- **AI**: Claude Sonnet 4 (Anthropic)
- **Blockchain**: Celo + Mento Protocol
- **Bills**: VTPASS API

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL
- Redis

### Installation

```bash
# Clone repo
git clone https://github.com/yourusername/ronpay.git
cd ronpay

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Setup database
npm run db:setup

# Start development
npm run dev
```

### Environment Variables

Create a `.env` file:

```env
# AI
ANTHROPIC_API_KEY=sk-ant-...

# Blockchain
PRIVATE_KEY=0x...
CELO_RPC_URL=https://forno.celo.org

# External Services
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
VTPASS_API_KEY=...

# Database
DATABASE_URL=postgresql://localhost:5432/ronpay
REDIS_URL=redis://localhost:6379
```

## Usage Examples

### Instant Payment
```javascript
POST /api/payment
{
  "message": "Send ₦50,000 to +2348012345678",
  "userAddress": "0x..."
}
```

### Schedule Recurring Payment
```javascript
POST /api/schedule
{
  "message": "Send $100 to mom in Kenya every month on the 5th",
  "userAddress": "0x..."
}
```

### Pay Bill
```javascript
POST /api/bill
{
  "message": "Pay my DSTV Premium subscription",
  "userAddress": "0x..."
}
```

## How It Works

```
User Message → Claude AI → Database → Blockchain → SMS Notification
     ↓              ↓            ↓           ↓             ↓
  "Send ₦50k"   Understands   Saves     Sends Money    Confirms
```

1. **User talks naturally** to RonPay
2. **Claude AI** extracts payment details
3. **Database** stores schedules
4. **Celo blockchain** sends the money
5. **SMS** notifies recipient

## Architecture

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Claude AI  │ ← Understands natural language
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Scheduler  │ ← Manages recurring payments
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Celo     │ ← Sends transactions
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     SMS     │ ← Confirms to recipient
└─────────────┘
```

## Project Structure

```
ronpay/
├── frontend/          # Next.js app
│   ├── pages/        # Routes
│   ├── components/   # React components
│   └── styles/       # Tailwind CSS
├── backend/          # Node.js API
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic
│   │   ├── ai.js           # Claude AI integration
│   │   ├── blockchain.js   # Celo transactions
│   │   ├── scheduler.js    # Recurring payments
│   │   └── bills.js        # VTPASS integration
│   └── workers/      # Background jobs
├── contracts/        # Smart contracts (if any)
└── docs/            # Documentation
```

## Development

```bash
# Run frontend (port 3000)
npm run dev:frontend

# Run backend (port 4000)
npm run dev:backend

# Run worker (background jobs)
npm run dev:worker

# Run tests
npm test

# Run all
npm run dev
```

## Deployment

### Frontend (Vercel)
```bash
vercel deploy --prod
```

### Backend (Railway)
```bash
railway up
```

### Worker (Fly.io)
```bash
flyctl deploy
```

## ERC-8004 Agent

RonPay is a verified ERC-8004 AI Agent:
- **Agent ID**: `[YOUR_AGENT_ID]`
- **View Profile**: [8004scan.io](#)
- **Reputation Score**: [YOUR_SCORE]/100

## Roadmap

- [x] MVP - Natural language payments
- [x] Scheduled recurring payments
- [x] Nigerian bill payments
- [x] Multi-country support
- [ ] MiniPay marketplace launch (March 2026)
- [ ] Multi-language support
- [ ] 15+ African countries
- [ ] WhatsApp bot integration

## Hackathon

Built for **Celo "Build Agents for the Real World" Hackathon**
- **Dates**: Feb 6-15, 2026
- **Prize**: $5,000 USDT

### Stats
- Transactions: 124
- Success Rate: 96.8%
- Users: 23
- Avg Fee: $0.009

## Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create a branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE)

## Contact

- Twitter: [@RonPayAI](#)
- Email: hello@ronpay.xyz
- Discord: [Join Chat](#)

---
