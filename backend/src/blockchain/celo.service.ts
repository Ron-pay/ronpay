import { Injectable } from '@nestjs/common';
import { createPublicClient, http, parseUnits, formatUnits, Address } from 'viem';
import { celo } from 'viem/chains';
import { ERC20_ABI } from '../abis/erc20';

// Celo token addresses on Mainnet
// NOTE: Mento Protocol rebranded stablecoins from 'cXXX' to 'XXXm' in November 2025
// Both naming conventions are supported for backwards compatibility
export const CELO_TOKENS = {
  // === Mento Protocol Stablecoins (Original 'c' prefix) ===
  cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',    // Mento Dollar (now USDm)
  cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',    // Mento Euro (now EURm)
  cREAL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',   // Mento Brazilian Real (now BRLm)
  cKES: '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',    // Mento Kenyan Shilling (now KESm)
  cNGN: '0xC6a531d7CdEbaD7FDFAfb6d96D9C8724Ceb9C0A7',    // Mento Nigerian Naira (now NGNm)

  // === Mento Protocol Stablecoins (New 'm' suffix - Same addresses as above) ===
  USDm: '0x765DE816845861e75A25fCA122bb6898B8B1282a',   // Mento Dollar (formerly cUSD)
  EURm: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',   // Mento Euro (formerly cEUR)
  BRLm: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',   // Mento Brazilian Real (formerly cREAL)
  KESm: '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',   // Mento Kenyan Shilling (formerly cKES)
  NGNm: '0xC6a531d7CdEbaD7FDFAfb6d96D9C8724Ceb9C0A7',   // Mento Nigerian Naira (formerly cNGN)

  // === Additional Mento Stablecoins (Production-ready) ===
  // Note: Add these addresses once you deploy on Celo mainnet and verify
  // COPm: '0x...',  // Mento Colombian Peso
  // XOFm: '0x...',  // Mento West African Franc
  // PHPm: '0x...',  // Mento Philippine Peso
  // GHSm: '0x...',  // Mento Ghanaian Cedi
  // ZARm: '0x...',  // Mento South African Rand

  // === Native Circle & Tether Stablecoins on Celo ===
  cUSDC: '0xceb09c2a6886ed289893d562b87f8d689b9d118c',  // Native USDC on Celo
  cUSDT: '0xb020D981420744F6b0FedD22bB67cd37Ce18a1d5',  // Native USDT on Celo

  // === Native Celo Token ===
  CELO: 'native',
} as const;

@Injectable()
export class CeloService {
  private publicClient;

  constructor() {
    this.publicClient = createPublicClient({
      chain: celo,
      transport: http(process.env.CELO_RPC_URL || 'https://forno.celo.org'),
    });
  }

  /**
   * Build transaction data for client-side signing (MiniPay compatible)
   * Returns unsigned transaction that MiniPay will sign
   */
  async buildPaymentTransaction(
    to: Address,
    amount: string,
    token: keyof typeof CELO_TOKENS = 'cUSD',
    feeCurrency?: Address,
  ) {
    const amountInWei = parseUnits(amount, 18);

    if (token === 'CELO') {
      // Native CELO transfer
      return {
        to,
        value: amountInWei.toString(),
        data: '0x' as `0x${string}`,
        feeCurrency: feeCurrency || CELO_TOKENS.cUSD, // Pay gas in cUSD by default
      };
    } else {
      // ERC20 token transfer
      const tokenAddress = CELO_TOKENS[token] as Address;
      
      // Encode transfer function call
      const data = this.publicClient.encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to, amountInWei],
      });

      return {
        to: tokenAddress,
        value: '0',
        data,
        feeCurrency: feeCurrency || CELO_TOKENS.cUSD, // Pay gas in cUSD
      };
    }
  }

  /**
   * Get balance of a wallet address
   */
  async getBalance(
    address: Address,
    token: keyof typeof CELO_TOKENS = 'cUSD',
  ): Promise<string> {
    if (token === 'CELO') {
      const balance = await this.publicClient.getBalance({ address });
      return formatUnits(balance, 18);
    } else {
      const tokenAddress = CELO_TOKENS[token] as Address;
      
      const balance = await this.publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      });

      return formatUnits(balance as bigint, 18);
    }
  }

  /**
   * Get multiple token balances at once
   */
  async getAllBalances(address: Address) {
    const [cUSD, CELO, cKES, cEUR, cREAL] = await Promise.all([
      this.getBalance(address, 'cUSD'),
      this.getBalance(address, 'CELO'),
      this.getBalance(address, 'cKES'),
      this.getBalance(address, 'cEUR'),
      this.getBalance(address, 'cREAL'),
    ]);

    return {
      cUSD: parseFloat(cUSD),
      CELO: parseFloat(CELO),
      cKES: parseFloat(cKES),
      cEUR: parseFloat(cEUR),
      cREAL: parseFloat(cREAL),
    };
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: `0x${string}`) {
    return this.publicClient.getTransactionReceipt({ hash: txHash });
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash: `0x${string}`) {
    return this.publicClient.waitForTransactionReceipt({
      hash: txHash,
      timeout: 60_000, // 60 seconds
    });
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(transaction: {
    to: Address;
    value?: bigint;
    data?: `0x${string}`;
  }) {
    return this.publicClient.estimateGas(transaction);
  }

  /**
   * Get all supported tokens
   */
  getSupportedTokens() {
    return Object.keys(CELO_TOKENS);
  }

  /**
   * Get token address by symbol
   */
  getTokenAddress(token: keyof typeof CELO_TOKENS): Address | 'native' {
    return CELO_TOKENS[token];
  }

  /**
   * Validate Celo address
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}
