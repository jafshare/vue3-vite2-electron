import { proxyServerPort } from "@common/env";
import interceptor from "./interceptor";

const AnyProxy = require("anyproxy");

const options = {
  port: proxyServerPort,
  // 自定义拦截器
  rule: interceptor,
  webInterface: {
    enable: false, // 关闭web后台
    webPort: 8002,
  },
  forceProxyHttps: false,
  wsIntercept: false, // 不开启websocket代理
  silent: true, // 禁用默认日志输出
};
// 创建一个代理服务器
let proxyServer: any;

export function startProxyServer() {
  proxyServer = new AnyProxy.ProxyServer(options);
  proxyServer.on("ready", () => {
    /* */
  });
  proxyServer.on("error", (e: Error) => {
    /* */
  });
  // 启动代理
  AnyProxy.utils.systemProxyMgr.enableGlobalProxy("127.0.0.1", proxyServerPort);
  // AnyProxy.utils.systemProxyMgr.disableGlobalProxy();
  proxyServer.start();
}
export function stopProxyServer() {
  // 关闭代理
  AnyProxy.utils.systemProxyMgr.disableGlobalProxy();
  proxyServer.close();
}
