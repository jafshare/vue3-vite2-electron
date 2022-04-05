import { startProxyServer, stopProxyServer } from "./proxyServer";
import { WSServer } from "./wsServer";
import wsHandlers from "./wsHandlers";
function start() {
  const options = {
    webInterface: {
      enable: true,
    },
  };
  // 开启ws服务
  const wsServer = WSServer.getInstance();
  wsServer.start();
  // 遍历所有需要监听的事件
  wsHandlers.forEach((handler) => {
    wsServer.on(handler.command, handler.handler);
  });
  // 开启代理服务
  startProxyServer();
}
function stop() {
  // 关闭代理服务
  stopProxyServer();
}

export { start, stop };
