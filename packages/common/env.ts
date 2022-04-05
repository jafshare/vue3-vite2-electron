export const isDev = process.env.NODE_ENV === "development";
// 代理服务器端口
export const proxyServerPort = 12345;
// ws服务端口
export const wsServerPort = 22223;
// 由proxytool触发的请求的前缀
export const requestPrefix = "/__proxyToolRequest__";
