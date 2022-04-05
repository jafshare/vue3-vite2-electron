import fetch from "node-fetch";
import HttpProxyAgent from "http-proxy-agent";
import { proxyServerPort } from "@common/env";
// 发送一个请求,这里需要利用http-proxy-agent库将请求转发到代理服务器，否则本次请求不会走代理服务
async function request(requestData: RequestData): Promise<RequestData> {
  // 利用代理转发到本地代理器
  const agent = HttpProxyAgent(
    `${requestData.protocol.toLowerCase()}://127.0.0.1:${proxyServerPort}`
  );
  const finialRequestData: RequestData = {
    ...requestData,
  };
  // TODO 判断协议
  if (requestData.protocol === "http") {
    try {
      const res = await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.requestHeaders,
        agent,
      });
      finialRequestData.requestHeaders = res.headers;
      finialRequestData.result = res.status;
    } catch (error) {}
  }
  return finialRequestData;
}
export default request;
