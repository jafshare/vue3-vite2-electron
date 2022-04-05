import { RequestDetail, ResponseDetail } from "anyproxy";
import { WSServer } from "./wsServer";
import { wrapData, CMD } from "@common/ws";
import { genUUID } from "@common/utils";
const wsServer = WSServer.getInstance();
export default {
  // 发送请求之前
  *beforeSendRequest(requestDetail: RequestDetail) {
    console.log("发送http请求:", requestDetail.url);
    yield new Promise((resolve, reject) => {
      resolve(null);
    });
  },
  // 处理https请求发送前
  *beforeDealHttpsRequest(requestDetail: RequestDetail) {
    console.log("发送https请求:", requestDetail.url);
    yield new Promise((resolve, reject) => {
      // 返回true才会配置密钥,解析数据,false则只是流量转发
      resolve(false);
    });
  },
  // 返回响应之前
  *beforeSendResponse(
    requestDetail: RequestDetail,
    responseDetail: ResponseDetail
  ) {
    console.log("返回响应:", requestDetail);
    wsServer.send(
      wrapData(CMD.NEW_RECORD, {
        // 为每一个请求增加一个唯一id
        id: genUUID(),
        method: requestDetail.requestOptions.method,
        protocol: requestDetail.protocol,
        result: responseDetail.response.statusCode,
        host: requestDetail.requestOptions.hostname,
        path: requestDetail.requestOptions.path,
        port: requestDetail.requestOptions.port,
        // 完整的请求路径
        url: requestDetail.url,
        clientIP: requestDetail.requestOptions.localAddress,
        clientPort: requestDetail.requestOptions.port,
        // 请求头
        requestHeaders: requestDetail.requestOptions.headers,
        // TODO 目前是buffer类型，最后根据类型转换数据
        //请求数据
        requestData: requestDetail.requestData,
        // 响应头
        responseHeaders: responseDetail.response.header,
        // 响应数据
        responseData: JSON.parse(responseDetail.response.body),
      })
    );
    yield new Promise((resolve, reject) => {
      resolve(null);
    });
  },
  // 请求过程中发生错误的回调
  *onError(requestDetail: RequestDetail, error: Error) {
    console.log("发送http请求错误:", requestDetail.url, error);
    yield new Promise((resolve, reject) => {
      resolve(null);
    });
  },
  // 与目标HTTPS服务器建立连接的过程中，如果发生错误
  *onConnectError(requestDetail: RequestDetail, error: Error) {
    console.log("发送https请求错误:", requestDetail.url, error);
    yield;
  },
};
