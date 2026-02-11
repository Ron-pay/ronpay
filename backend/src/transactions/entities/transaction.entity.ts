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
  status: string; // pending, success, failed

  @Column({ type: 'text', nullable: true })
  intent: string; // Original user command

  @Column({ type: 'text', nullable: true })
  memo: string;

  @CreateDateColumn()
  createdAt: Date;
}
