import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

//废弃-替换为装饰器RowBodyDecorator
@Injectable()
export class RowBodyPipe implements PipeTransform {
  transform(value: any) {
    if (!value) {
      throw new BadRequestException('No data found');
    }
    const rowBody = value.toString();
    return JSON.parse(rowBody);
  }
}
