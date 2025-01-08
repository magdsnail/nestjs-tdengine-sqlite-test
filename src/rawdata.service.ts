import { Inject, Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

import { TdengineService } from './../../core/tdengine.service';
import { caseConverter, helper } from '@/utils/index';
import { RawDataBO } from '../bo/rawdata.bo';
import { getSetpByType, calcRawData } from '@/utils/helper';
import { BaseService } from '@/core/base.service';
import { AnyType } from '@/common/type';
import { REPORT_TYPE_ENUM } from '@/common/enum/report.enum';
import { RawdataDownloadDto } from '../dto/rawdata.dto';

@Injectable()
export class RawDataService extends BaseService {
  private readonly logger = new Logger(RawDataService.name, { timestamp: true });
  constructor(
    private readonly tdengineService: TdengineService,
  ) {
    super();
  }

  /**
   * 处理原始数据
   * @param payload 
   */
  async save(payload: RawDataBO, responseTopic: string) {
    this.logger.debug('收到原始数据mqtt 数据包 - ** ', JSON.stringify(payload));
    const { deviceId, start, end, items } = payload;
    try {
      const result = {};// 原始数据拆分
      const fields = {};// 原始数据字段
      const inst = []; //数据库组装实例
      const stableTags = {};// 标签
      // 组装配置信息，将配置信息中的字段添加到fields中
      for (const item of items) {
        if (!fields[item.sensorType]) {
          fields[item.sensorType] = [];
        }
        if (!stableTags[item.sensorType]) {
          stableTags[item.sensorType] = new Set();
        }
        if (!result[item.sensorType]) {
          result[item.sensorType] = {};
        }
        if (!result[item.sensorType][item.sensorId]) {
          result[item.sensorType][item.sensorId] = {};
        }
        if (!result[item.sensorType][item.sensorId][item.signalName]) {
          result[item.sensorType][item.sensorId][item.signalName] = {};
        }
        result[item.sensorType][item.sensorId][item.signalName] = item;
        fields[item.sensorType].push({
          type: item.valueType,
          name: item.signalName,
        });
        stableTags[item.sensorType].add(deviceId);
        stableTags[item.sensorType].add(item.machineId);
        stableTags[item.sensorType].add(item.adapterId);
      }
      // 添加字段
      for (const stable in fields) {
        await this.tdengineService.addColumn(stable, fields[stable]);
      }
      // 组装数据
      for (const stable in result) {
        // if (stable === 'nc') continue;
        for (const table in result[stable]) {
          const columns = ['ts', ...fields[stable].map(item => item.name), 'is_realed'];
          const st = {
            stable,
            table,
            columns,
            tags: [...stableTags[stable]],
            values: []
          }
          //@ts-ignore
          const lengths = Object.values(result[stable][table]).map(item => item.value.length);
          const maxLength = Math.max(...lengths);

          for (const column of columns) {
            const element = result[stable][table][column];
            if (column === 'ts') {
              st.values.push({
                value: helper.calcRawStamp(maxLength, start * 1000, end * 1000),
                type: 'TIMESTAMP',
              });
            } else if (column === 'is_realed') {// 是否真实数据
              const realedArr = Array(maxLength).fill(false);
              realedArr[0] = true;
              st.values.push({
                type: 'BOOL',
                value: realedArr
              });
            } else {
              st.values.push({
                value: [...element.value, ...Array(maxLength - element.value.length).fill(null)],
                type: element.valueType,
              });
            }
          }
          inst.push(st);
        }
      }
     try {
      const insertPromises = inst.map(item => 
        this.tdengineService.insert(item.stable, item.table, item.columns, {
          tags: item.tags,
          values: item.values,
        })
      );
      await Promise.all(insertPromises);
     } catch (error) {
      this.mqttService.emit(responseTopic, {
        type: REPORT_TYPE_ENUM.ERROR,
        start
      });
     }
      this.mqttService.emit(responseTopic, {
        type: REPORT_TYPE_ENUM.SUCCESS,
        start
      });
    } catch (error) {
      this.logger.error(error);
      this.mqttService.emit(responseTopic, {
        type: REPORT_TYPE_ENUM.REPRTY,
        start
      });
    }
  }

  async download(body: RawdataDownloadDto) {
    const { start, end, config } = body;
    const conn = this.tdengineService.taosConnect;
    const result = {};
    for (const { stable, table } of config) {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(stable);
      const cursor = await conn.query(`select ${stable}.* from rawdata.${stable} where ts >= ${new Date(start).getTime() * 1000} and ts <= ${new Date(end).getTime() * 1000}`);
      const meta = cursor.getMeta();
      sheet.addRow(meta.map(item => item.name));
      while (await cursor.next()) {
        const row = await cursor.getData();
        for (let i = 0; i < row.length; i++) {
          if (meta[i].type === 'BIGINT') {
            row[i] = Number(row[i]);
          }
          if (meta[i].type === 'TIMESTAMP') {
            row[i] = new Date(Number(row[i]) / 1000).toISOString();
          }
        }
        sheet.addRow(row);
      }
      await cursor.close(); // 关闭游标
      result[stable] = await workbook.csv.writeBuffer();
    }
    return {
      data: result,
    };
  }

}
