import { Injectable } from '@nestjs/common';
import { createPublicClient, createWalletClient, http, parseUnits, formatUnits, Address } from 'viem';
import { celo } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { ERC20_ABI } from '../abis/erc20';

// Celo token addresses on Mainnet
const CELO_TOKENS = {
  cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
  cREAL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
  cKES: '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',
  CELO: 'native',
} as const;


@Injectable()
export class CeloService {
  private publicClient;
  private walletClient;

  constructor() {
    this.publicClient = createPublicClient({
      chain: celo,
      transport: http(process.env.CELO_RPC_URL || 'https://forno.celo.org'),
    });

    // For demo purposes - in production, use user's wallet via wallet connect
    // This is just for backend-initiated transactions if needed
    if (process.env.CELO_PRIVATE_KEY) {
      const account = privateKeyToAccount(process.env.CELO_PRIVATE_KEY as `0x${string}`);
      this.walletClient = createWalletClient({
        account,
        chain: celo,
        transport: http(process.env.CELO_RPC_URL || 'https://forno.celo.org'),
      });
    }
  }

  /**
   * Send payment on Celo network
   */
  async sendPayment(
    to: Address,
    amount: string,
    token: keyof typeof CELO_TOKENS = 'cUSD',
  ): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet client not configured. Set CELO_PRIVATE_KEY in .env');
    }

    const amountInWei = parseUnits(amount, 18);

    if (token === 'CELO') {
      // Send native CELO
      const hash = await this.walletClient.sendTransaction({
        to,
        value: amountInWei,
      });
      return hash;
    } else {
      // Send ERC20 token (cUSD, cEUR, etc.)
      const tokenAddress = CELO_TOKENS[token] as Address;
      
      const hash = await this.walletClient.writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to, amountInWei],
      });

      return hash;
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
      // Get native CELO balance
      const balance = await this.publicClient.getBalance({ address });
      return formatUnits(balance, 18);
    } else {
      // Get ERC20 token balance
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
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash: `0x${string}`) {
    return this.publicClient.getTransactionReceipt({ hash: txHash });
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash: `0x${string}`) {
    return this.publicClient.waitForTransactionReceipt({ hash: txHash });
  }

  /**
   * Get all supported tokens
   */
  getSupportedTokens() {
    return Object.keys(CELO_TOKENS);
  }

  /**
   * Validate Celo address
   */
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}
