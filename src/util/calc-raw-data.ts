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