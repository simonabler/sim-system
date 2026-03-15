import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { IAnnotation } from '../interfaces/annotation.interface';
import { Slipsheet } from './slipsheet.entity';

@Entity({ name: 'annotation' })
export class Annotation implements IAnnotation {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  text: string;

  @ManyToOne(() => Slipsheet, (slipsheet) => slipsheet.orderEntries, { nullable: false })
  @JoinColumn()
  slipsheet: Slipsheet;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  updatedAt: Date;
}
