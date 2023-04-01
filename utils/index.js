export const isArray = Array.isArray;

export const isServer = () => process.server;

/** 判断是不是开发环境 */
export function isDev() {
  return process.env.NODE_ENV === "development";
}

export function delHtmlTag(str) {
  return str.replace(/<[^>]+>/g, ""); //去掉所有的html标记
}

export function displayCodeText(str) {
  return delHtmlTag(str)
    .replace(/&quot;|&amp;|&#39;|&lt;|&gt;/g, "")
    .replace(/\s{2,}|\n/g, " ");
}
