import { Injectable } from '@nestjs/common';
import { Machine } from '@/entity/machine.entity'
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Buffer } from 'node:buffer';
import { calcRawData, getSetpByType } from './util/calc-raw-data';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Machine) private readonly machineRepository: Repository<Machine>,
  ) { }
  getHello(): string {
    return 'Hello World!';
  }

  async getDb() {
    const machines = await this.machineRepository.find({
      where: {
        signalName: 'cycle-time-seconds',
        valueType: Not('STRING')
      },
      take: 10
    });
    const retdata = machines.map((item) => {
      const values = this.calcRawData(item.value, item.timeStamp, item.valueType, item.valueCount);
      return values.map((v) => ({
        signalName: item.signalName,
        valueType: item.valueType,
        ...v,
      }))
    });
    return retdata;
  }

  calcRawData(value: Buffer, timeStamp: number, valueType: string, valueCount: number) {
    const start = timeStamp * 1000;
    const end = start + 1 * 1000 * 1000;
    const intervalUseconds = (start - end) / valueCount;
    const val = [];
    for (let i = 0; i < valueCount; i++) {
      const step = getSetpByType(valueType);
      const buf = value.subarray(i * step, (i + 1) * step);
      val.push(calcRawData.get(valueType)(buf));
    }
    return val;
  }



}
