import { EventEmitter } from "events";
import WebSocket, { WebSocketServer } from "ws";
import { wsServerPort } from "@common/env";
import { requestTransform, responseTransform, isValid, CMD } from "@common/ws";
import logger from "../logger";
/**
 * WS服务器，单例模式，继承自events.EventEmitter
 */
export class WSServer extends EventEmitter {
  static _instance: WSServer;
  // @ts-ignore
  wsServer: WebSocketServer;
  constructor() {
    super();
    if (WSServer._instance) return WSServer._instance;
    WSServer._instance = this;
  }
  /**
   * 开始ws服务
   */
  start() {
    // 创建一个ws服务器，用于和web端通信
    const wsServer = new WebSocketServer({
      port: wsServerPort,
      perMessageDeflate: {
        zlibDeflateOptions: {
          // See zlib defaults.
          chunkSize: 1024,
          memLevel: 7,
          level: 3,
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024,
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024, // Size (in bytes) below which messages
        // should not be compressed if context takeover is disabled.
      },
    });
    this.wsServer = wsServer;
    wsServer.on("connection", async (ws) => {
      ws.on("message", (rawData) => {
        // 解析指令
        const data = responseTransform(rawData.toString());
        if (!isValid(data)) {
          throw new Error("错误的数据类型");
        }
        if (data.cmd !== CMD.PING) {
          logger.log("收到指令:", data.cmd);
          this.emit(data.cmd, ws, data);
        }
      });
    });
  }
  /**
   * 发送数据
   * @param data 发送的数据
   * @param broadcast 是否把数据发送给所有的客户端
   */
  send(data: any, broadcast = true) {
    if (!this.wsServer) {
      throw new Error("wsServer 服务异常");
    }
    // 将信息广播所有的客户端
    this.wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        let sendData = data;
        if (typeof sendData !== "string") {
          sendData = requestTransform(data);
        }
        client.send(sendData);
      }
    });
  }
  stop() {}
  // 获取实例
  static getInstance() {
    return WSServer._instance ? WSServer._instance : new WSServer();
  }
  /**
   * 监听事件
   * @param event 事件名称
   * @param listener 事件回调，第一个参数为ws客户端连接
   * @returns
   */
  on(
    event: string | symbol,
    listener: (ws: WebSocket, ...args: any[]) => void
  ): this {
    return super.on(event, listener);
  }
  /**
   * 触发事件
   * @param event 事件名称
   * @param args  事件参数
   */
  emit(event: string | symbol, ws: WebSocket, ...args: any[]): boolean {
    return super.emit(event, ws, ...args);
  }
}
