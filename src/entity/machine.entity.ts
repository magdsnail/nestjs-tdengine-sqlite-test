import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('machine')
export class Machine {
  @PrimaryColumn()
  id: number;
  
  @Column({
    type: 'integer',
    name: 'time_stamp'
  })
  timeStamp: number;

  @Column({
    type: 'integer',
    name: 'sync_id'
  })
  syncId: number;

  @Column({
    type: 'integer',
    name: 'machine_id'
  })
  machineId: number;

  @Column({
    type: 'integer',
    name: 'adapter_id'
  })
  adapterId: number;

  @Column({
    type: 'text',
    name: 'signal_name'
  })
  signalName: string;

  @Column({
    type: 'text',
    name: 'value_type'
  })
  valueType: string;

  @Column({
    type: 'integer',
    name: 'value_count'
  })
  valueCount: number;

  @Column({
    type: 'blob',
    name: 'value'
  })
  value: Buffer;

  @Column({
    type: 'text',
  })
  string: string;
}