import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TransportTypes } from '../constants/transport-types.enum';

@Entity('transport')
export class Transport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  peopleCapacity: number;

  @Column({ enum: TransportTypes })
  type: TransportTypes;

  @Column({ nullable: true, type: 'text' })
  photoUrl: string;
}
