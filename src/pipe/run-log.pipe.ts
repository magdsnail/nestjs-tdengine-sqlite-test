import { PipeTransform, Injectable } from '@nestjs/common';
import { caseConverter } from '../utils';

@Injectable()
export class RunLogPipe implements PipeTransform {
  async transform(value: any) {
    const {
      param: { tid = '', log_info = [] },
    } = value;
    return {
      data: log_info.map((l) => {
        const datetime = new Date(l.datetime).getTime();
        return {
          ...caseConverter.objectToCamel(l),
          dataId: `${tid}_${datetime}`,
          datetime,
          deviceId: tid,
        };
      }),
    };
  }
}
