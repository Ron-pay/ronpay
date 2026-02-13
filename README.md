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
Talk naturally in **4 languages** - RonPay understands what you mean:
- 🇬🇧 English: "Send $100 to Jane in Kenya"
- 🇪🇸 Spanish: "Envía $100 a mamá en Colombia"
- 🇧🇷 Portuguese: "Enviar R$500 para João no Brasil"
- 🇫🇷 French: "Envoyer 10,000 FCFA à papa au Sénégal"

### 💰 Real-Time Exchange Rates & Savings
See exactly how much you save:
- **Real-time Mento Protocol rates** (no hidden markups)
- Compare fees vs Western Union & Wise
- **Save up to 95%** on remittance fees
- Transparent pricing - what you see is what you get

### 🔄 Auto-Pilot Payments
Set it once, forget forever:
- Monthly remittances to family (5th, 15th, any day)
- Recurring bill payments
- Daily/weekly schedules
- Balance checks before execution
- SMS reminders 24h before payment

### 🌍 Multi-Country Support
Send money across borders instantly:
- 🇳🇬 Nigeria (Naira)
- 🇰🇪 Kenya (Shilling)
- 🇧🇷 Brazil (Real)
- 🇨🇴 Colombia (Peso)
- 🇬🇭 Ghana (Cedi)
- 🇵🇭 Philippines (Peso) *coming soon*

### 📺 Nigerian Bill Payments
Auto-pay your bills via VTPASS:
- DSTV, GOtv, Startimes
- MTN, Airtel, Glo, 9mobile airtime & data
- Electricity bills

### 📱 Smart Notifications
Never miss a payment update:
- SMS confirmations
- WhatsApp notifications
- Transaction receipts
- Savings summaries

## Tech Stack

- **Frontend**: Next.js, Wagmi, Tailwind
- **Backend**: NestJS, PostgreSQL, Redis
- **AI**: Claude Sonnet 4 (Anthropic) - Multi-language NLP (EN, ES, PT, FR)
- **Blockchain**: Celo + Mento Protocol (Real-time exchange rates)
- **Bill Payments**: VTPASS API (Nigeria)
- **Notifications**: Twilio (SMS + WhatsApp)
- **Fee Comparison**: Wise API + Western Union integration


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
├── backend/          # NestJS API (ronpay)
│   ├── src/          # Source files
│   │   ├── ai/             # Claude AI integration
│   │   ├── blockchain/     # Celo transactions
│   │   ├── scheduler/      # Recurring payments
│   │   └── bills/          # VTPASS integration
│   ├── test/         # E2E tests
│   └── nest-cli.json # NestJS configuration
├── contracts/        # Smart contracts (if any)
└── docs/            # Documentation
```

## Development

```bash
# Run frontend (port 3000)
pnpm run dev:frontend

# Run backend (port 4000)
pnpm run dev:backend

# Run worker (background jobs)
pnpm run dev:worker

# Run tests
pnpm test

# Run all
pnpm run dev
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

### ✅ Completed (MVP)
- [x] Natural language payments (English)
- [x] Celo blockchain integration
- [x] Scheduled recurring payments
- [x] Nigerian bill payments (VTPASS)
- [x] Multi-stablecoin support (cUSD, cKES, cEUR, cREAL)
- [x] Transaction history tracking

### 🚧 In Progress (Production Ready - 2-3 weeks)
- [/] Multi-language support (English, Spanish, Portuguese, French)
- [/] Real-time Mento Protocol exchange rates
- [/] Fee comparison vs Western Union & Wise
- [/] SMS/WhatsApp notifications
- [/] Enhanced recurring scheduler
- [/] ODIS phone number resolution
- [/] Production deployment

### 🔮 Future (Q1-Q2 2026)
- [ ] MiniPay marketplace launch (March 2026)
- [ ] 15+ African countries
- [ ] WhatsApp bot interface
- [ ] Voice commands integration
- [ ] Telegram bot
- [ ] Agent reputation system (ERC-8004)

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
