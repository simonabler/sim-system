import { Article } from '../../article/entities/article.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IOrderEntry } from '../interfaces/order-entry.interface';
import { Slipsheet } from './slipsheet.entity';

@Entity({ name: 'order-entries' })
export class OrderEntry implements IOrderEntry {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  text: string;

  @Column({ type: 'real', nullable: false })
  amount: number;

  @Column({ type: 'real', nullable: false })
  price: number;

  @Column({ type: 'real', nullable: false })
  customerRabatt: number;

  @Column({ type: 'real', nullable: false })
  articleGroupRabatt: number;

  @ManyToOne(() => Article, (article) => article.orderEntry, { nullable: true })
  @JoinColumn()
  article: Article;

  @ManyToOne(() => Slipsheet, (slipsheet) => slipsheet.orderEntries)
  @JoinColumn()
  slipsheet: Slipsheet;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;
}
