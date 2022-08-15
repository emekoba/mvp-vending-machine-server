import { UserRoles } from 'src/enums';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @OneToMany(() => Product, (Product) => Product.user)
  products: Product[];

  @Column({ type: 'varchar' })
  username: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', default: '0' })
  deposit: string;

  @Column({ type: 'enum', enum: UserRoles, default: UserRoles.BUYER })
  role: UserRoles;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
