import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => User, (User) => User.products)
  @JoinColumn({ name: 'sellerId' })
  user: User;

  @Column({ type: 'varchar' })
  productName: boolean;

  @Column({ type: 'boolean', default: false })
  amountAvailable: boolean;

  @Column({ type: 'boolean', default: false })
  cost: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
