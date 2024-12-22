import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('operation_types')
export class OperationType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}
