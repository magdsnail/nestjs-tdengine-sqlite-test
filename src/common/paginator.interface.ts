export interface AnyObject {
  [k: string]: any;
}

export interface PaginatorI<T> {
  /**
   * 分页数据
   */
  items: T[];
  /**
   * 总条数
   */
  total: number;
}
