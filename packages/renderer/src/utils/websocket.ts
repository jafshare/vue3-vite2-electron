import { wsServerPort } from "@common/env";
import { genUUID } from "@common/utils";
import {
  requestTransform,
  responseTransform,
  isValid,
  simpleData,
} from "@common/ws";
export type MessageCallback = (data: any) => void;
export type MessageHander = {
  // 唯一标识，当提供该字段后，仅返回的信息中和当前uuid匹配才会触发handler
  uuid?: string;
  //是否执行一次，如果是，则执行完毕后自动销毁
  once: boolean;
  handler: MessageCallback;
};
export type WebsocketOptions = {
  autoClose?: boolean;
  retry?: number;
  reconnect?: boolean;
  heartbeat?: { message?: string; interval?: number };
};
export type Options = {
  //是否执行一次，如果是，则执行完毕后自动销毁
  once: boolean;
  // 唯一标识
  uuid?: string;
};
function useInterval(handler: () => void, interval = 1000) {
  let timer: NodeJS.Timer | null;
  const pause = () => {
    timer && clearInterval(timer);
    timer = null;
  };
  const resume = () => {
    handler();
    timer = setInterval(handler, interval);
  };
  return {
    pause,
    resume,
  };
}
/**
 * websocket封装
 * 主要有三种回调监听:
 * 1、发送后需要获取响应结果，客户端发起
 * 2、监听一次，服务端返回
 * 3、监听多次，服务端返回
 */
export class SimpleWebSocket {
  static _instance: SimpleWebSocket;
  static _id = 1;
  //@ts-ignore
  websocket: WebSocket;
  // 是否正常关闭
  explicitlyClosed = false;
  // 已重连次数
  retries = 0;
  // 订阅列表
  subs: Map<string, MessageHander[]> = new Map();
  constructor(options?: WebsocketOptions) {
    if (SimpleWebSocket._instance) return SimpleWebSocket._instance;
    this.init(options);
    SimpleWebSocket._instance = this;
  }
  init(options: WebsocketOptions = {}) {
    const {
      autoClose = true,
      retry = 3,
      heartbeat = { interval: 30000, message: "ping" },
    } = options;
    // 初始化websocket
    const ws = new WebSocket(`ws://127.0.0.1:${wsServerPort}`);
    this.websocket = ws;
    const { resume: heartbeatResume, pause: heartbeatPause } = useInterval(
      () => {
        this.send("PING", { cmd: "PING", data: {} });
      },
      heartbeat.interval
    );
    ws.addEventListener("open", () => {
      console.log("connect");
      // 开始心跳
      heartbeatResume();
      // 如果重连成功则清空重连次数
      this.retries = 0;
    });

    ws.addEventListener("message", (event) => {
      const res = responseTransform(event.data);
      const cmd = res.cmd;
      const data = res.data;
      const uuid = res.uuid;
      if (!isValid(res)) {
        throw new Error("错误的响应类型");
      }
      if (this.subs.has(cmd)) {
        const removeHandlerIds: number[] = [];
        const handlers = this.subs.get(cmd) as MessageHander[];
        handlers.some((handler, idx) => {
          // 如果指定once，则回调完自动销毁
          if (handler.once) {
            removeHandlerIds.push(idx);
          }
          // 当前handler如果有uuid，则说明是客户端发起的，需要对比响应信息的uuid才可以
          if (handler.uuid) {
            // 如果两者的uuid无法匹配则继续循环，否则直接执行handler并退出循环
            if (handler.uuid !== uuid) return false;
            handler.handler(data);
            return true;
          } else {
            handler.handler(data);
          }
          return false;
        });
        // 删除只执行一次的回调
        removeHandlerIds.forEach((idx) => {
          handlers.splice(idx, 1);
        });
      }
    });
    ws.addEventListener("close", (close) => {
      console.log("close");
      heartbeatPause();
      // 判断是否可重连
      if (!this.explicitlyClosed && this.retries < retry) {
        this.retries++;
        this.init(options);
      }
    });
    ws.addEventListener("error", function close(event) {
      console.log("error", event);
    });
    // 是否在页面关闭时关闭websocket
    if (autoClose) {
      window.onbeforeunload = () => {
        heartbeatPause();
        this.close();
      };
    }
  }
  // 关闭ws code->1000 为正常关闭状态 https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
  close(code = 1000) {
    // 如果ws状态未关闭则手动关闭
    if (this.websocket && this.websocket.readyState !== WebSocket.CLOSED) {
      this.websocket.close(code);
    }
    this.explicitlyClosed = true;
  }
  /**
   * 发送数据，由于是主动发起，所以会生成一个uuid,专门用于比对返回值，保证能够正确触发handler
   * @param cmd 指令
   * @param data 数据
   */
  async send(cmd: string, data?: string | WebsocketRequestBody) {
    if (this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error("websocket is not open");
    }
    return new Promise((resolve, reject) => {
      let sendMessage = data;
      const uuid = genUUID();
      // 如果未传data,则构造一个简易的data
      if (!data) {
        sendMessage = simpleData(cmd);
      } else if (typeof data === "object") {
        // 如果是对象则需要同时满足cmd和data
        if (!isValid(data)) {
          throw new Error("错误的数据类型");
        }
      } else {
        if (typeof data === "string") {
          // 如果已经是JSON字符串，需要重新解析
          sendMessage = JSON.parse(data);
        } else {
          throw new Error("错误的数据类型");
        }
      }
      // 发送信息添加uuid数据
      (sendMessage as WebsocketRequestBody).uuid = uuid;
      // 将最后的数据转为字符串
      const finalMessage = requestTransform(
        sendMessage as WebsocketRequestBody
      );
      // 生成一个新的handler,设置为一次性,且设置一个uuid，用来和返回值做对比
      this.on(cmd, resolve, { once: true, uuid });
      this.websocket.send(finalMessage);
    });
  }
  /**
   * 添加订阅
   * @param cmd 命令
   * @param cb 回调
   * @param once 是否执行一次后自动销毁
   */
  on(cmd: string, cb: MessageCallback, options?: Options) {
    if (typeof cb === "function") {
      const handlers = this.subs.get(cmd);
      const handlerOptions = {
        once: !!options?.once,
        handler: cb,
      };
      if (options?.uuid) {
        (handlerOptions as MessageHander).uuid = options.uuid;
      }
      if (handlers) {
        // 去重后新增
        if (handlers.findIndex((handler) => handler.handler === cb) < 0) {
          handlers.push(handlerOptions);
        }
      } else {
        // 如果不存在则新增一个订阅列表
        this.subs.set(cmd, [handlerOptions]);
      }
    } else {
      throw new Error("type is error");
    }
  }
  /**
   * 取消订阅
   * @param cmd 命令
   * @param cb 回调
   */
  off(cmd: string, cb: MessageCallback) {
    const handlers = this.subs.get(cmd);
    if (handlers) {
      const idx = handlers.findIndex((handler) => handler.handler === cb);
      // 删除对应回调
      if (idx >= 0) {
        handlers.splice(idx, 1);
      }
    }
  }
  /**
   * 创建一个websocket实例
   */
  static getInstance() {
    return SimpleWebSocket._instance
      ? SimpleWebSocket._instance
      : new SimpleWebSocket();
  }
}
