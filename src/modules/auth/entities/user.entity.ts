import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../constants/roles.enum';
import { TransportTypes } from '../../transports/constants/transport-types.enum';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.WORKER })
  role: Role;

  @Column({ type: 'enum', enum: TransportTypes, nullable: true })
  serviceType?: TransportTypes;
}
