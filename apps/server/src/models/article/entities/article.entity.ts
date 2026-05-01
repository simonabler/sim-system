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
import { OrderEntry } from '../../bills/entities/order-entry.entity';
import { IArticle } from '../interfaces/article.interface';
import { ArticleGroup } from './article-group.entity';

@Entity({ name: 'article' })
export class Article implements IArticle {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false, length: 50 })
  name!: string;

  @Column({ nullable: false, unique: true, length: 50 })
  code!: string;

  @Column({ nullable: false, default: 0.0, precision: 5, scale: 2 })
  price!: number;

  stock!: number | null;

  @Column({ nullable: false, default: 0.0, precision: 5, scale: 2 })
  netto!: number;

  @Column({ default: 0 })
  inventoryStock: number;

  // Bug #4 fix: was @CreateDateColumn() which auto-sets on INSERT — should be a plain nullable column
  @Column({ type: 'datetime', nullable: true })
  inventoryDate: Date;

  @Column({ default: '', length: 50 })
  type: string;

  @Column({ default: '', length: 250, nullable: true })
  description: string;

  @Column({ default: '', length: 100, nullable: true })
  supplier: string;

  @Column({ default: '', length: 250 })
  imgPath: string;

  @Column({ default: '', length: 50 })
  unit: string;

  @Column({ default: '', length: 50 })
  artNumber: string;

  @Column('boolean', { default: false })
  singlePos: boolean = false;

  @Column('boolean', { default: true })
  trackStock: boolean = true;

  @Column('boolean', { default: false })
  noDiscount: boolean = false;

  @OneToMany(() => OrderEntry, (orderEntry) => orderEntry.article)
  orderEntry: OrderEntry[];

  @ManyToOne(() => ArticleGroup)
  @JoinColumn()
  articleGroup: ArticleGroup;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({ select: false, insert: false, readonly: true, update: false, nullable: true })
  totalAmount: number;
}
