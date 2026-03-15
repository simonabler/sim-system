import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Discount } from '../../bills/entities/discount.entity';
import { Slipsheet } from '../../bills/entities/slipsheet.entity';
import { ICustomer } from '../interfaces/customer.interface';


@Entity({ name: 'customer' })
export class Customer implements ICustomer {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @Column({ length: 150 })
  firstName: string;
  @Column({ length: 150 })
  lastName: string;
  @Column({nullable: false, unique:true, length: 150})
  customerNumber: string;
  @Column({nullable: false, default:0})
  customerDiscount: number;
  @Column({ length: 150 })
  email: string;
  @Column({ length: 150 })
  companyName: string;
  @Column({ length: 150 })
  address: string;
  @Column({ length: 10 })
  postcode: string;
  @Column({ length: 150 })
  phoneCompany: string;
  @Column({ length: 150 })
  phonePrivate: string;
  @Column({ length: 50 })
  uid: string;
  @Column({ length: 50 })
  country: string;

  @OneToMany(() => Discount, (discount) => discount.customer)
  discounts: Discount[];

  @OneToMany(() => Slipsheet, (slipsheets) => slipsheets.customer)
  slipsheets: Slipsheet[];
  

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
