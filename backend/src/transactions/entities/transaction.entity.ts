import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('transactions')
@Index(['fromAddress'])
@Index(['toAddress'])
@Index(['txHash'], { unique: true })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fromAddress: string;

  @Column()
  toAddress: string;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: number;

  @Column({ default: 'cUSD' })
  currency: string; // cUSD, cKES, cREAL, CELO

  @Column({ unique: true })
  txHash: string;

  @Column({ default: 'pending' })
  status: string; // 'pending', 'success', 'failed'

  @Column({ nullable: true })
  intent: string; // Original NL command

  @Column({ nullable: true })
  memo: string;

  // Fields for AI Context & Bill Payments
  @Column({ default: 'transfer' })
  type: string; // 'transfer', 'airtime', 'data', 'electricity', 'tv'

  @Column({ nullable: true })
  serviceId: string; // e.g., 'mtn-airtime', 'dstv'

  @Column('jsonb', { nullable: true })
  metadata: any; // Store phone numbers, meter numbers, data plans, etc.

  @CreateDateColumn()
  createdAt: Date;
}
