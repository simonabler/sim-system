import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IInventory } from '../interfaces/inventory.interface';
import { Article } from './article.entity';

@Entity({ name: 'inventory' })
export class Inventory implements IInventory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false, default: 0.0, precision: 5, scale: 2 })
  amountNew!: number;

  @Column({ nullable: false, default: 0.0, precision: 5, scale: 2 })
  diff!: number;

  @ManyToOne(() => Article)
  @JoinColumn()
  article: Article;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
