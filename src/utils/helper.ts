import { AnyType } from "@/common/type";
import { caseConverter } from ".";

/**
 * 求和
 * @param numbers
 * @returns
 */
export function evalSum(numbers: number[]) {
  return numbers.reduce((a, b) => a + b, 0);
}

export const calcRawData = new Map<string, (value: Buffer | string, offset?: number) => number | string>([
  ['INT32',
    function (value: Buffer, offset: number = 0) {
      return value.readInt32LE(offset);
    }
  ],
  ['DOUBLE',
    function (value: Buffer, offset: number = 0) {
      return value.readDoubleLE(offset);
    }
  ],
  ['STRING',
    function (value: string) {
      return value;
    }
  ],
]);

export const calcRawStamp = (count: number, start: number, end: number) => {
  const intervalMicroseconds = (end - start) / count;
  const val = [];
  for (let i = 0; i < count; i++) {
    val.push(Math.floor(start + intervalMicroseconds * i));
  }
  return val;
}

export const getSetpByType = (type: string) => {
  switch (type) {
    case 'INT32':
      return 4;
    case 'DOUBLE':
      return 8;
    case 'STRING':
      return 0;
    default:
      break;
  }
}

export const tranform = (value: AnyType) => {
  const {
    param: { tid = '', log_info = [] },
  } = value;
  const arr = log_info.map((l) => {
    const datetime = new Date(l.datetime).getTime();
    return {
      ...caseConverter.objectToCamel(l),
      dataId: `${tid}_${datetime}`,
      datetime,
    };
  });
  return arr;
}