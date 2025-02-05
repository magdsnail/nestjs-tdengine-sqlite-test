import { PAGE } from '@/common/constant/page.constant';
import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(value: any) {
    const skip = value.pageNum ? (value.pageNum - 1) * value.pageSize : 0;
    const limit = value.pageSize ? +value.pageSize : PAGE.PAGE_SIZE;
    value.skip = skip;
    value.limit = limit;
    return value;
  }
}
