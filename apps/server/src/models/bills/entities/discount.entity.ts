import { ArticleGroup } from '../../article/entities/article-group.entity';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { IDiscount } from '../interfaces/discount.interface';
import { Customer } from '../../customer/entities/customer.entity';


@Entity({ name: 'discount' })
export class Discount implements IDiscount {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  value!: number;

  @ManyToOne(() => ArticleGroup)
  @JoinColumn()
  articleGroup!: ArticleGroup;
  @Column({ nullable: false })
  articleGroupId!: number;

  @ManyToOne(() => Customer)
  @JoinColumn()
  customer!: Customer;
  @Column({ nullable: false })
  customerId!: number;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;
}
