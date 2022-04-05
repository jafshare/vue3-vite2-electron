import { CMD, wrapMessage } from "@common/ws";
import type { WSHandler } from "../typings/ws";
import request from "../core/request";
// websocket处理指令
const handlers: WSHandler[] = [
  // 如果是一个请求指令，则新建一个请求
  {
    command: CMD.NEW_REQUEST,
    handler: async (ws, data) => {
      const requestData = data.data;
      console.log("新建一个请求", requestData.url);
      const res = await request(requestData);
      // 返回数据
      ws.send(wrapMessage(data.cmd, res, data));
    },
  },
];
export default handlers;
