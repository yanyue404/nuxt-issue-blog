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
  return delHtmlTag(str || '')
    .replace(/&quot;|&amp;|&#39;|&lt;|&gt;/g, "")
    .replace(/\s{2,}|\n/g, " ");
}

export function isPC() {
  return !/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);
}

export function toNumber(value) {
  if (typeof value !== "string") {
    return value;
  } else {
    var parsed = Number(value);
    return isNaN(parsed) ? value : parsed;
  }
}

/**
 * getQueryString  从url中拿参数值param
 * @param {str} param 要拿的参数名  字符
 * @param {str} url  要从什么链接上面拿参数  字符  支持密文  可选填
 * @return {str} 参数值
 */
export function getQueryString(param, url) {
  var searchUrl = window.location.href;
  if (url) {
    searchUrl = url.indexOf("?") ? url.substr(url.indexOf("?")) : searchUrl;
  }
  var reg = new RegExp("(^|&|\\?)" + param + "=([^&]+)(&|$)", "i");
  var r = searchUrl.substr(1).match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]) || "";
  }
  return "";
}

/**
 * 从页面url中获取json（url是未被编码的明文格式）
 * <pre>url格式：http://www.baidu.com?action=1&toobar=0
 * @param {str} url  页面的url, 选传, 默认当前页面地址（url是未被编码的明文格式）
 * @returns {obj} json    json对象
 */
export function getQueryJson(url) {
  var json = {};
  var urlStr = isDefined(url) ? url : location.href;
  var splits = urlStr.split("?");
  if (splits && splits.length >= 2) {
    var array = splits[1].split("&");
    if (array && array.length > 0) {
      for (var i = 0; i < array.length; i++) {
        var params = array[i].split("="); // 拆分形式为key=value形式的参数
        json[params[0]] = params[1]; // 第一个参数表示key，第二个参数表示value
      }
    }
  }
  return json;
}

export function debounce(func, wait, immediate) {
  var timeout, result;

  return function () {
    var context = this;
    var args = arguments;

    if (timeout) clearTimeout(timeout);
    if (immediate) {
      // 如果已经执行过，不再执行
      var callNow = !timeout;
      timeout = setTimeout(function () {
        timeout = null;
      }, wait);
      if (callNow) result = func.apply(context, args);
    } else {
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    }
    return result;
  };
}
