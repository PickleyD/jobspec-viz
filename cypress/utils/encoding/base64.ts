export const decode = (str: any):string => Buffer.from(str, 'base64').toString('binary');
export const encode = (str: any):string => Buffer.from(str, 'binary').toString('base64');
