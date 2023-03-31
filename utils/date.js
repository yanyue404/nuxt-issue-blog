import { isString } from "lodash";
/**
 * 距离指定时间（未指定时，计算当前日期）多久前（后）
 * @param {Date|String} date 字符串日期  YYYY-MM-dd ||
 * @param {Number} y 年
 * @param {Number} m 月
 * @param {Number} d 日
 * @returns {Date}
 */
export function getRangeToDate({ date, y = 0, m = 0, d = 0 } = {}) {
  var now = new Date();
  if (date) {
    now = isString(date) ? new Date(date.replace(/-/g, "/")) : date;
  }
  now.setFullYear(now.getFullYear() + y);
  now.setMonth(now.getMonth() + m);
  now.setDate(now.getDate() + d);
  return now;
}

/**
 * 距离指定时间（未指定时，计算当前日期）多久前（后）
 * @param {Date|String} params.date 字符串日期  YYYY-MM-dd
 * @param {Number} params.y 年
 * @param {Number} params.m 月
 * @param {Number} params.d 日
 * @returns {String} 'YYYY-MM-DD'
 */
export function getRangeToStrDate(params = {}) {
  var now = getRangeToDate(params);
  var sy = now.getFullYear();
  var sm =
    now.getMonth() + 1 < 10 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1;
  var sd = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();
  return sy + "-" + sm + "-" + sd;
}

/**
 * 比较第一个字符串时间是不是大于(等于)第二字符串时间
 * @param {Date|String} strDataMax 字符串日期  YYYY-MM-dd
 * @param {Date|String} strDateMin 字符串日期  YYYY-MM-dd
 * @param {Boolean} containEq  相等时的返回正确还是错误
 * @returns {Boolean} strDataMax > strDateMin
 *
 */
export function compareDate(strDataMax, strDateMin, containEq) {
  if (!strDataMax || !strDateMin) {
    console.error(`compareDate ====>> ${strDataMax} === ${strDateMin}`);
    return;
  }
  if (isString(strDataMax)) {
    strDataMax = strToDate(strDataMax);
  }
  if (isString(strDateMin)) {
    strDateMin = strToDate(strDateMin);
  }
  let maxTime = strDataMax.getTime();
  let minTime = strDateMin.getTime();
  return containEq ? maxTime >= minTime : maxTime > minTime;
}

/**
 * 字符串格式日期转换为日期对象
 * @param {String} str 字符串日期  YYYY-MM-dd
 *
 */
export function strToDate(str) {
  if (str) {
    var arr = str.split("-");
    arr[1] = arr[1] - 1;
    return new Date(...arr);
  }
  console.warn(`strToDate ===>  请传入YYYY-MM-dd格式的日期. 你传人的是 ${str}`);
}

/**
 * 时间格式化方法
 * @param {String} 格式 yyyyMMdd hhmmssqqS
 * @param {Date} date
 */
export function dateFormat(fmt, date) {
  date = date || new Date();
  var o = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "h+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  };
  if (/([yY]+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return fmt;
}

/**
 * @desc   格式化${startTime}距现在的已过时间
 * @param  {Date} startTime
 * @return {String}
 */
export function formatPassTime(startTime) {
  var currentTime = Date.parse(new Date()),
    time = currentTime - startTime,
    day = parseInt(time / (1000 * 60 * 60 * 24)),
    hour = parseInt(time / (1000 * 60 * 60)),
    min = parseInt(time / (1000 * 60)),
    month = parseInt(day / 30),
    year = parseInt(month / 12);

  if (year) return year + "年前";

  if (month) return month + "个月前";

  if (day) return day + "天前";

  if (hour) return hour + "小时前";

  if (min) return min + "分钟前";

  return "刚刚";
}
