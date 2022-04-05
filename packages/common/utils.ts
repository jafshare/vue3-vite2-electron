import { nanoid } from "nanoid";
export function genUUID() {
  // 使用nanoid生成uuid，相对来说比uuid库效率更高
  return nanoid();
}
