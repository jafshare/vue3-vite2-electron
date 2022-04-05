import type WebSocket from "ws";
// ws处理类型
export type WSHandler = {
  command: string | symbol;
  handler: (ws: WebSocket, ...args: any[]) => void;
};
