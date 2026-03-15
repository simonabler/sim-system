import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { BillState } from '../enums/bill-state.enum';

import { IBill } from '../interfaces/bill.interface';
import { SlipsheetEntity } from '../serializers/slipsheet.serializer';
import { Slipsheet } from './slipsheet.entity';

@Entity({ name: 'bill' })
export class Bill implements IBill {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false, unique: true })
  billNumber: string;

  @Column({ nullable: false, default: BillState.OPEN, length: 20 })
  state: BillState;

  @CreateDateColumn({ nullable: false })
  billDate: Date;

  @Column({ nullable: true, length: 256 })
  path: string;

  @OneToMany(() => Slipsheet, (slipsheet) => slipsheet.bill)
  slipsheets: SlipsheetEntity[];

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;
}
