import { CMD, wrapData } from "@common/ws";
import type { WSHandler } from "../typings/ws";
import request from "../core/request";
import { startProxyServer, stopProxyServer } from "./proxyServer";
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
      ws.send(wrapData(data.cmd, res, data));
    },
  },
  {
    command: CMD.START_PROXY_SERVER,
    handler: async (ws, data) => {
      startProxyServer();
      // 返回数据
      ws.send(wrapData(data.cmd, {}, data));
    },
  },
  {
    command: CMD.STOP_PROXY_SERVER,
    handler: async (ws, data) => {
      stopProxyServer();
      // 返回数据
      ws.send(wrapData(data.cmd, {}, data));
    },
  },
];
export default handlers;
