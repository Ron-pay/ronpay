# Celo Stablecoin Support - Token Reference

## Overview
RonPay uses the modern Mento Protocol naming convention for all stablecoins.

## Currently Supported Tokens

### ✅ Fully Integrated (Production Ready)

| Token Symbol | Name | Address | Type |
|-------------|------|---------|------|
| `USDm` | Mento Dollar | `0x765DE816845861e75A25fCA122bb6898B8B1282a` | Mento Stablecoin |
| `EURm` | Mento Euro | `0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73` | Mento Stablecoin |
| `BRLm` | Mento Brazilian Real | `0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787` | Mento Stablecoin |
| `KESm` | Mento Kenyan Shilling | `0x456a3D042C0DbD3db53D5489e98dFb038553B0d0` | Mento Stablecoin |
| `NGNm` | Mento Nigerian Naira | `0xC6a531d7CdEbaD7FDFAfb6d96D9C8724Ceb9C0A7` | Mento Stablecoin |
| `cUSDC` | Native USDC | `0xceb09c2a6886ed289893d562b87f8d689b9d118c` | Circle Stablecoin |
| `cUSDT` | Native USDT | `0xb020D981420744F6b0FedD22bB67cd37Ce18a1d5` | Tether Stablecoin |
| `CELO` | Celo Native Token | Native | Utility Token |

### 🔜 Coming Soon (Mento Stablecoins Available for Integration)

| Token Symbol | Name | Status |
|-------------|------|--------|
| `COPm` | Mento Colombian Peso | Need to verify mainnet address |
| `XOFm` | Mento West African Franc | Need to verify mainnet address |
| `PHPm` | Mento Philippine Peso | Need to verify mainnet address |
| `GHSm` | Mento Ghanaian Cedi | Need to verify mainnet address |
| `ZARm` | Mento South African Rand | Need to verify mainnet address |
| `GBPm` | Mento British Pound | Need to verify mainnet address |
| `CADm` | Mento Canadian Dollar | Need to verify mainnet address |
| `JPYm` | Mento Japanese Yen | Need to verify mainnet address |
| `CHFm` | Mento Swiss Franc | Need to verify mainnet address |
| `AUDm` | Mento Australian Dollar | Need to verify mainnet address |

## Native USDC and USDT

**✅ Both cUSDC and cUSDT are supported!**

- **cUSDC** (Native USDC): `0xceb09c2a6886ed289893d562b87f8d689b9d118c`
- **cUSDT** (Native USDT): `0xb020D981420744F6b0FedD22bB67cd37Ce18a1d5`

Both are native Celo tokens issued by Circle and Tether, fully ERC-20 compatible and work with Mento Protocol for swaps.

## Remittance Corridors

### Supported Corridors (Current)
- 🇺🇸 → 🇳🇬 (USD → NGN) via USDm → NGNm
- 🇺🇸 → 🇰🇪 (USD → KES) via USDm → KESm  
- 🇺🇸 → 🇧🇷 (USD → BRL) via USDm → BRLm
- 🇪🇺 → 🇳🇬 (EUR → NGN) via EURm → NGNm
- 🇪🇺 → 🇰🇪 (EUR → KES) via EURm → KESm

### Pending Corridors (Once addresses verified)
- 🇺🇸 → 🇵🇭 (USD → PHP) via USDm → PHPm
- 🇬🇧 → 🇰🇪 (GBP → KES) via GBPm → KESm
- 🇺🇸 → 🇨🇴 (USD → COP) via USDm → COPm
- 🇺🇸 → 🇬🇭 (USD → GHS) via USDm → GHSm

## Usage in Code

### Mento Stablecoins
```typescript
const quote = await mentoService.getSwapQuote('USDm', 'NGNm', '100');
const balance = await celoService.getBalance(address, 'KESm');
```

### Native USDC/USDT
```typescript
const usdcBalance = await celoService.getBalance(address, 'cUSDC');
const usdtBalance = await celoService.getBalance(address, 'cUSDT');
```

## Next Steps for Additional Tokens

To add COPm, XOFm, PHPm, etc.:

1. **Find Contract Addresses**: Check [Mento Protocol docs](https://docs.mento.org/) or [CeloScan](https://celoscan.io/)
2. **Update `celo.service.ts`**: Add addresses to `CELO_TOKENS`
3. **Update Type Definitions**: Ensure TypeScript types are correct
4. **Test on Alfajores**: Test token swaps on testnet first
5. **Add to Mento Service**: Ensure Mento SDK supports the corridor
6. **Document Corridors**: Update API docs and frontend

## References

- **Mento Protocol**: https://mento.org/
- **Celo Docs**: https://docs.celo.org/
- **CeloScan (Mainnet)**: https://celoscan.io/
- **Circle USDC on Celo**: https://www.circle.com/en/usdc-multichain/celo
- **Celo Token List**: https://celo.org/build/tokens
