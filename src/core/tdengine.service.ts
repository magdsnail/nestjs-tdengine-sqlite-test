import { ConfigService } from '@nestjs/config';
import * as taos from '@tdengine/websocket'
import { TdengineConfigI } from '../configs/tdengine.config';
import { Injectable, Logger } from '@nestjs/common';
import { AnyType } from '@/common/type';

@Injectable()
export class TdengineService {
  protected db: string;
  protected conf: taos.WSConfig;
  protected taosWsSql: taos.WsSql;
  private logger = new Logger(TdengineService.name);

  constructor(
    private configService: ConfigService,
  ) {
    // 初始化
    this.init();
  }

  async init() {
    try {
      const { uri, db } = this.configService.get<TdengineConfigI>('tdengine');
      this.conf = new taos.WSConfig(uri);
      this.conf.setDb(db);
      this.conf.setTimeOut(120000);
      this.taosWsSql = await taos.sqlConnect(this.conf);
    } catch (error) {
      this.logger.error('TDengine 连接失败' + error);
    }
  }

  // 获取数据库连接
  get taosConnect() {
    return this.taosWsSql;
  }
  /**
   * 保存数据
   * 注意
   * @param db 
   * @param table 
   * @param columns 列参数
   * @param data 
   * @returns 
   */
  async insert(stable: string, table: string, columns: string[], data: {
    tags: AnyType;
    values: AnyType;
  }, db: string = 'rawdata') {
    this.logger.log(`${stable} ${table} ${columns}`);
    const { tags = [], values = [] } = data;
    const taosStmt = await this.taosWsSql.stmtInit();
    const prepareSql = `INSERT INTO ? USING ${db}.${stable} TAGS (${Array(tags.length).fill('?').join(',')}) (${columns.join(',')}) VALUES (${Array(columns.length).fill('?').join(',')})`;
    this.logger.log('sql', prepareSql);
    await taosStmt.prepare(prepareSql);
    await taosStmt.setTableName(`d_${table}`);

    let tagParams = taosStmt.newStmtParam();
    for (let i = 0; i < tags.length; i++) {
      if (typeof tags[i] === 'number') {
        tagParams.setInt([tags[i]]);
      } else {
        tagParams.setVarchar([tags[i]]);
      }
    }
    await taosStmt.setTags(tagParams);

    let bindParams = taosStmt.newStmtParam();
    for (const { type, value } of values) {
      if (type === 'TIMESTAMP') {
        bindParams.setTimestamp(value);
      } else if (type === 'BOOL') {
        bindParams.setBoolean(value);
      } else if (type === 'STRING') {
        bindParams.setVarchar(value);
      } else if (type === 'DOUBLE') {
        bindParams.setDouble(value);
      } else if (type === 'INT32') {
        bindParams.setInt(value);
      }
    }
    await taosStmt.bind(bindParams);
    await taosStmt.batch();
    await taosStmt.exec();
  }


  /**
   * 动态添加列
   * @param db 
   * @param table 
   * @param columns 
   */
  async addColumn(stable: string, columns: {
    type: string;
    name: string;
  }[], db: string = 'rawdata') {
    try {
      const { fields } = await this.describe(stable);
      const result = columns.filter(c => !fields.includes(c.name));
      if (!result.length) { return; }
      for (const { type, name } of result) {
        let sql = `ALTER STABLE ${db}.${stable} ADD COLUMN ${name} `;
        if (type === 'STRING') {
          sql += 'VARCHAR(64);';
        } else if (type === 'INT32') {
          sql += 'INT;';
        } else if (type === 'TIMESTAMP') {
          sql += 'TIMESTAMP;';
        } else if (type === 'BOOL') {
          sql += 'BOOL;';
        } else {
          sql += 'DOUBLE;';
        }
        await this.taosWsSql.exec(sql);
      }
    } catch (error) {
      this.logger.error('TDengine 添加列失败', error, stable, JSON.stringify(columns));
    }
  }

  /**
   * 获取版本信息
   * @returns 
   */
  getVersion() {
    return this.taosWsSql.version();
  }

  /**
   * 获取表结构
   * @param db 
   * @param stable 
   * @returns 
   */
  async describe(stable: string, db: string = 'rawdata') {
    const reast = await this.taosWsSql.exec(`describe ${db}.${stable}`);
    const data = reast.getData();
    const fields = [];
    const tags = [];
    for (const element of data) {
      const [field, , , type] = element;
      if (type === 'TAG') {
        tags.push(field);
      } else {
        fields.push(field);
      }
    }
    return {
      tags,
      fields
    };
  }

  onApplicationShutdown() {
    this.close();
  }

  close() {
    if (this.taosWsSql) {
      this.taosWsSql.close();
    }
  }
}