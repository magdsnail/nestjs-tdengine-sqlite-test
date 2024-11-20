import { Injectable, Logger } from '@nestjs/common';
import { Machine } from '@/entity/machine.entity'
import { In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Buffer } from 'node:buffer';
import { calcRawData, getSetpByType } from './util/calc-raw-data';
import * as taos from '@tdengine/websocket'

@Injectable()
export class AppService {
  public taosClient: any;
  public conf: any;
  private readonly logger = new Logger(AppService.name);
  constructor(
    @InjectRepository(Machine) private readonly machineRepository: Repository<Machine>,
  ) {
    this.conf = new taos.WSConfig('ws://192.168.0.52:6041');
    this.conf.setUser('root');
    this.conf.setPwd('taosdata');
  }

  async onApplicationBootstrap() {
    this.logger.log('初始化taos连接 start');
    this.taosClient = await taos.sqlConnect(this.conf);
    this.logger.log('初始化taos连接 end');
  }

  async getHello() {
    await this.taosClient.exec(`use rawdata`);
    const a = await this.taosClient.exec(`insert into 
      rawdata.d6660004fff0469eaaf588501
      using rawdata.usv (tid, mid, signal_name, adapter_id, type) tags(1,2,3,4,5) values(NOW + 1a, 1,2,3)`);
    return 'Hello World!';
  }

  async getDb() {
    const tid = '6660004fff0469eaaf588501';
    const mid = '801607107';
    const machines = await this.machineRepository.find({
      where: {
        signalName: In(['usv-x', 'usv-y', 'usv-z']),
      },
    });
    const result: any = {};
    for (const item of machines) {
      if (!result[`${item.timeStamp}`] || !result[`${item.timeStamp}`][`${item.signalName}`]) {
        result[`${item.timeStamp}`] = {
          [`usv-x`]: {},
          [`usv-y`]: {},
          [`usv-z`]: {},
        }
      }
      result[`${item.timeStamp}`] = {
        ['usv-x']: result[`${item.timeStamp}`]['usv-x'],
        ['usv-y']: result[`${item.timeStamp}`]['usv-y'],
        ['usv-z']: result[`${item.timeStamp}`]['usv-z'],
        [`${item.signalName}`]: {
          value: item.value,
          valueType: item.valueType,
          timeStamp: item.timeStamp,
          valueCount: item.valueCount
        },
      };
    }

    const sqls = [];
    for (const k in result) {
      const element = result[k];
      const x = this.calcRawData(element['usv-x'].value, element['usv-x'].timeStamp, element['usv-x'].valueType, element['usv-x'].valueCount);
      const y = this.calcRawData(element['usv-y'].value, element['usv-y'].timeStamp, element['usv-y'].valueType, element['usv-y'].valueCount);
      const z = this.calcRawData(element['usv-z'].value, element['usv-z'].timeStamp, element['usv-z'].valueType, element['usv-z'].valueCount);
      for (let i = 0; i < x.length; i++) {
        const sql = 'INSERT INTO ' +
          'rawdata.d6660004fff0469eaaf588501 using rawdata.usv (tid, mid) tags(1, 1)' +
          'values(NOW + 1u,' +
          ` ${x[i].v}, ${y[i].v}, ${z[i].v}` + ')';
        const a = await this.taosClient.exec(sql);
        console.log(a);
      }
    }
    return sqls;
  }

  calcRawData(value: Buffer, timeStamp: number, valueType: string, valueCount: number) {
    const start = timeStamp * 1000;
    const end = start + 1 * 1000 * 1000;
    const intervalUseconds = (end - start) / valueCount;
    const val = [];
    for (let i = 0; i < valueCount; i++) {
      const step = getSetpByType(valueType);
      const buf = value.subarray(i * step, (i + 1) * step);
      val.push({
        v: calcRawData.get(valueType)(buf),
        ts: new Date((new Date(start).getTime() + intervalUseconds * i * 1000))
      });
    }
    return val;
  }



}
