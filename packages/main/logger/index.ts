import path from "path";
import logger from "electron-log";

logger.transports.console.useStyles = true;
// 设置默认的输出路径
logger.transports.file.resolvePath = () =>
  path.join(process.cwd(), "logs/main.log");
const originLog = logger.log;
const originInfo = logger.info;
const originError = logger.error;
const originWarn = logger.warn;
logger.log = (...params: any[]) => {
  originLog(
    params.reduce((pre, cur) => `${pre} ${cur}`, "%c"),
    "color:unset"
  );
};
logger.info = (...params: any[]) => {
  originInfo(
    params.reduce((pre, cur) => `${pre} ${cur}`, "%c"),
    "color:green"
  );
};
logger.warn = (...params: any[]) => {
  originWarn(
    params.reduce((pre, cur) => `${pre} ${cur}`, "%c"),
    "color:yellow"
  );
};
logger.error = (...params: any[]) => {
  originError(
    params.reduce((pre, cur) => `${pre} ${cur}`, "%c"),
    "color:red"
  );
};
export default logger;
