import { AggregateOptions, ClientSession, Model, PipelineStage, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

import { Base } from '@/schema/base';
import { AnyType } from '@/common/type';
import { PAGE } from '@/common/constant/page.constant';
import { BaseService } from './base.service';
import { Injectable } from '@nestjs/common';

export class MongodbService<T extends Base> extends BaseService {
  @InjectConnection()
  private readonly connection: Connection;

  constructor(
    protected readonly model: Model<T>,
  ) {
    super();
  }

  async bulkWrite(writes: AnyType) {
    const result = await this.model.bulkWrite(writes);
    return result;
  }

  async modify(entity: Partial<T>) {
    const createdEntity = new this.model(entity);
    return await createdEntity.save();
  }

  async create(doc: Partial<T>) {
    return await this.model.create(doc);
  }

  async createMany(docs: Partial<T>[]) {
    return await this.model.insertMany(docs);
  }

  async findOne(conditions: AnyType, projection?: AnyType, options?: AnyType) {
    return await this.model.findOne(conditions, projection, options);
  }

  async updateOne(conditions: AnyType, doc: AnyType, options?: AnyType) {
    return await this.model.updateOne(conditions, doc, options);
  }

  async findByDataIds(dataIds: string[]) {
    return await this.model.find({ dataId: { $in: dataIds } });
  }

  async findAllLeanPaginator(conditions: AnyType, options?: AnyType) {
    return await this.model.find(
      conditions,
      {
        created: 0,
        updated: 0,
      },
      {
        skip: 0,
        limit: PAGE.PAGE_SIZE,
        sort: { created: -1 },
        lean: true,
        ...options,
      },
    );
  }

  async findAllLean(conditions: AnyType, options?: AnyType) {
    return await this.model.find(
      conditions,
      {
        created: 0,
        updated: 0,
      },
      {
        lean: true,
        ...options,
      },
    );
  }

  async findAll(conditions: AnyType, projection?: AnyType, options?: AnyType) {
    return await this.model.find(conditions, projection, options);
  }

  async count(conditions: AnyType) {
    return await this.model.countDocuments(conditions);
  }

  translateAliases(conditions: AnyType) {
    return this.model.translateAliases(conditions);
  }

  async findPaginator(conditions: AnyType = {}, options?: AnyType) {
    return {
      items: await this.findAllLeanPaginator(conditions, options),
      total: await this.count(conditions),
    };
  }

  async aggregation(pipeline: PipelineStage[], options?: AggregateOptions) {
    return await this.model.aggregate(pipeline, options);
  }

  async deleteMany(conditions?: AnyType) {
    return await this.model.deleteMany(conditions);
  }
  /**
   * 处理事务
   * @param cb 回调函数
   * @returns 
   */
  async transactionExec(cb: (session: ClientSession) => Promise<AnyType>) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const result = await cb(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

}
