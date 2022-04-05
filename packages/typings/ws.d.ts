/** websocket请求体 */
type WebsocketRequestBody = {
  cmd: string;
  data: any;
  uuid?: string;
};
/** websocket返回 */
type WebsocketResponseBody = {
  cmd: string;
  data: any;
  uuid?: string;
};
