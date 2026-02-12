import { Injectable, Logger } from '@nestjs/common';
import { CeloService } from './celo.service';
import { OdisUtils } from '@celo/identity';
import { AuthenticationMethod } from '@celo/identity/lib/odis/query';
import { IdentifierPrefix } from '@celo/identity/lib/odis/identifier';

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  // Use Mainnet context
  private readonly SERVICE_CONTEXT = OdisUtils.Query.ODIS_MAINNET_CONTEXT_PNP;

  constructor(private readonly celoService: CeloService) {}

  /**
   * Resolve phone number to wallet address using SocialConnect (ODIS)
   * This retrieves the obfuscated ID (pepper) for the phone number.
   * Note: This step gives us the Identifier, but we still need to lookup generic Attestations or
   * specific mappings. For Hackathon simple flow, we might need a workaround if we can't
   * read the mapping contract easily without the full Attestation logic.
   * 
   * However, MiniPay uses the SocialConnect Issuer.
   * The Issuer contract maps: ObfuscatedID -> WalletAddress
   */
  async resolvePhoneNumber(phoneNumber: string): Promise<string | null> {
    try {
      this.logger.log(`Resolving phone number: ${phoneNumber} ...`);

      // 1. Get Authentication Signer (Wallet Key)
      // Ideally we use a DEK, but for now we use the account key itself if safer options aren't set up
      // In production backend, we should use a DEK to save quota.
      // We will assume the backend wallet has a small quota.
      // TODO: Ensure backend wallet is funded (0.01 cUSD) and registered if not using DEK.

      // Mock return for now as we don't want to make real ODIS calls without funding/keys
      // Real implementation would look like:
      /*
      const oneCent = parseUnits('0.01', 18);
      // Check quota...
      
      const response = await OdisUtils.Identifier.getObfuscatedIdentifier(
        phoneNumber,
        IdentifierPrefix.PHONE_NUMBER,
        this.celoService.address, // Issuer/Requester address
        this.celoService.authSigner, // Signer
        this.SERVICE_CONTEXT
      );
      
      // Look up on-chain attestation for response.obfuscatedIdentifier
      */
     
      this.logger.warn(`[MOCK] ODIS Lookup skipped. Use real phone numbers in production.`);
      
      // MOCK DB for Hackathon Demo if ODIS fails or keys missing
      if (phoneNumber.includes('2348012345678')) return '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'; // Mock Mom
      
      return null;
    } catch (error) {
      this.logger.error(`Error resolving phone number ${phoneNumber}`, error);
      return null;
    }
  }
}
