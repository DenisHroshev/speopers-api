import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OperationTypesEnum } from '../constants/operation-types.enum';
import { Transport } from '../../transports/entitites/transport.entity';
import { OperationStatusesEnum } from '../constants/operation-statuses.enum';

@Entity('operations')
export class Operation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  date: Date;

  @Column({ type: 'decimal', nullable: true })
  latitude: number;

  @Column({ type: 'decimal', nullable: true })
  longitude: number;

  @Column({ enum: OperationTypesEnum })
  type: OperationTypesEnum;

  @Column({ enum: OperationStatusesEnum })
  status: OperationStatusesEnum;

  @Column({ nullable: true, type: 'text' })
  photoUrl: string;

  @ManyToMany(() => Transport)
  @JoinTable()
  transports: Transport[];
}
