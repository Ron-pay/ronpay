# Quick Start Guide

## 1. Install Dependencies

```bash
cd backend/
pnpm install
```

## 2. Setup Database

```bash
# Create PostgreSQL database
createdb ronpay

# Or with docker
docker run --name ronpay-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ronpay -p 5432:5432 -d postgres:16
```

## 3. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

**Required environment variables:**

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ronpay
ANTHROPIC_API_KEY=your_claude_api_key
CELO_RPC_URL=https://forno.celo.org
```

**Get API Keys:**
- Claude AI: https://console.anthropic.com/
- Celo RPC: Use public `https://forno.celo.org` (no key needed)

## 4. Run Development Server

```bash
pnpm run start:dev
```

Server will start on `http://localhost:3001`

## 5. Test API

```bash
# Health check
curl http://localhost:3001/payments/health

# Check balance
curl http://localhost:3001/payments/balance/0xYourAddress

# Natural language payment (requires wallet private key in .env for MVP)
curl -X POST http://localhost:3001/payments/natural-language \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Send 1 cUSD to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "senderAddress": "0xYourAddress"
  }'
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments/health` | Health check |
| POST | `/payments/natural-language` | Process NL payment |
| GET | `/payments/balance/:address` | Get wallet balance |
| GET | `/payments/history/:address` | Transaction history |
| GET | `/payments/transaction/:hash` | Get transaction details |

## Database Schema

Tables are auto-created on first run (TypeORM synchronize):

- `users` - User wallet addresses
- `transactions` - Payment history

## Troubleshooting

**Database connection error:**
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string in .env
```

**Claude API error:**
```bash
# Verify API key is valid
# Get key from: https://console.anthropic.com/settings/keys
```

**Celo RPC error:**
```bash
# Try alternative RPC:
CELO_RPC_URL=https://celo-mainnet.public.blastapi.io
```

## Development Tips

```bash
# Watch mode
pnpm run start:dev

# Build
pnpm run build

# Run tests
pnpm run test

# Format code
pnpm run format

# Lint
pnpm run lint
```

## Next Steps

1. Get Anthropic API key
2. Setup .env file
3. Run `pnpm run start:dev`
4. Test with Postman/curl
5. Build frontend integration
