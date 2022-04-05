/** ws指令*/
export const CMD = {
  PING: "ping",
  // 新请求
  NEW_REQUEST: "newRequest",
  // 新增一条数据
  NEW_RECORD: "newRecord",
  // 更新某一条数据
  UPDATE_RECORD: "updateRecord",
  // 开启proxy服务
  START_PROXY_SERVER: "startProxyServer",
  // 关闭proxy服务
  STOP_PROXY_SERVER: "stopProxyServer",
};
// 转换请求
export function requestTransform(data: WebsocketRequestBody): string {
  return JSON.stringify(data);
}
// 转换响应
export function responseTransform(data: string): WebsocketResponseBody {
  return JSON.parse(data);
}
/**
 * 包装send信息
 * @param cmd 指令
 * @param data 数据
 * @param originData 原始数据,保证从客户端传过来的多余字段都能够返回
 * @returns
 */
export function wrapMessage(
  cmd: string,
  data: any,
  originData?: Record<string, any>
): string {
  return requestTransform({ ...originData, cmd, data });
}
// 校验数据是否有效
export function isValid(data: Record<string, any>) {
  if (typeof data !== "object") {
    throw new Error("错误的数据类型");
  }
  return data.cmd && data.data;
}
