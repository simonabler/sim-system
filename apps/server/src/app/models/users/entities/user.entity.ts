import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  AfterLoad,
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';

import { IUser } from '../interfaces/user.interface';

@Entity({ name: 'users' })
export class User implements IUser {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ nullable: true, default: null })
  email: string;

  @Column({ nullable: true, default: null })
  name: null | string;

  @Column({ nullable: false, default: null, unique: true })
  username: null | string;

  @Column()
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
