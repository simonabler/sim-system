import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { SlipsheetState } from '../enums/slipsheet-state.enum';
import { ISlipsheet } from '../interfaces/slipsheet.interface';
import { Annotation } from './annotation.entity';
import { Bill } from './bill.entity';
import { OrderEntry } from './order-entry.entity';

@Entity({ name: 'slipsheet' })
export class Slipsheet implements ISlipsheet {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true, unique: true })
  slipsheetnumber: string;

  @CreateDateColumn({ nullable: false })
  printDate: Date;

  @Column({ nullable: false, default: SlipsheetState.OPEN, length: 20 })
  state: SlipsheetState;

  @Column({ nullable: true, length: 256 })
  path: string;

  @OneToMany(() => OrderEntry, (orderEntrie) => orderEntrie.slipsheet, { cascade: false, onDelete: 'CASCADE' })
  orderEntries: OrderEntry[];

  @OneToMany(() => Annotation, (annotation) => annotation.slipsheet)
  annotations: Annotation[];

  @ManyToOne(() => Bill, (slipsheet) => slipsheet.slipsheets, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  bill: Bill;

  @Column({ nullable: true })
  billId: number;

  @ManyToOne(() => Customer, (customer) => customer.slipsheets, { nullable: true })
  @JoinColumn()
  customer: Customer;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;
}
