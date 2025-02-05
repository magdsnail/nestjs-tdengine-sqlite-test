import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { Type } from 'class-transformer';
import { PAGE } from './constant/page.constant';
export type OrderType<T> = Record<
  keyof T,
  'asc' | 'desc' | 'ascending' | 'descending' | 1 | -1
>;

export class PaginationDto<T = any> {
  @IsOptional()
  @Type()
  @IsNumber()
  @Min(PAGE.PAGE_NUMBER)
  pageNum?: number;

  @IsOptional()
  @Type()
  @IsNumber()
  pageSize?: number;

  /* 排序字段 */
  @IsOptional()
  @Type()
  @IsString()
  order?: OrderType<T>;

  // 分页使用
  skip: number;
  limit: number;
}
