type getNonFunctionAttrsName<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];
// 提取所有的非函数属性
declare type ExtractNonFunctionProps<T> = Pick<T, getNonFunctionAttrsName<T>>;
