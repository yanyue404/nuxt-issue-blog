export const isArray = Array.isArray;

export const isServer = () => process.server;

/** 判断是不是开发环境 */
export function isDev() {
  return process.env.NODE_ENV === "development";
}
