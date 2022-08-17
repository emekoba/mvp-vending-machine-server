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
  productName: string;

  @Column({ type: 'varchar', default: '0' })
  amountAvailable: string;

  @Column({ type: 'varchar', default: '0' })
  cost: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
