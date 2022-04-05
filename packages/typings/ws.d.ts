/** websocket请求体 */
declare type WebsocketRequestBody = {
  cmd: string;
  data: any;
  uuid?: string;
};
/** websocket返回 */
declare type WebsocketResponseBody = {
  cmd: string;
  data: any;
  uuid?: string;
};
