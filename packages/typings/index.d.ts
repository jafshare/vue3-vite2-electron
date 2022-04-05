type RequestData = {
  id: number;
  result: number;
  method: string;
  protocol: string;
  host: string;
  path: string;
  url: string;
  clientIP: string;
  clientPort: number;
  serverIP: string;
  serverPort: number;
  requestHeaders: any;
  requestData: any;
  responseHeaders: any;
  responseData: any;
  time: number;
};
type ResponseData = {};
