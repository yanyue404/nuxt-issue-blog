import { isString } from 'lodash'
/**
 * 距离指定时间（未指定时，计算当前日期）多久前（后）
 * @param {Date|String} date 字符串日期  YYYY-MM-dd ||
 * @param {Number} y 年
 * @param {Number} m 月
 * @param {Number} d 日
 * @returns {Date}
 */
export function getRangeToDate({ date, y = 0, m = 0, d = 0 } = {}) {
  var now = new Date()
  if (date) {
    now = isString(date) ? new Date(date.replace(/-/g, '/')) : date
  }
  now.setFullYear(now.getFullYear() + y)
  now.setMonth(now.getMonth() + m)
  now.setDate(now.getDate() + d)
  return now
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
  var now = getRangeToDate(params)
  var sy = now.getFullYear()
  var sm =
    now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1
  var sd = now.getDate() < 10 ? '0' + now.getDate() : now.getDate()
  return sy + '-' + sm + '-' + sd
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
    console.error(`compareDate ====>> ${strDataMax} === ${strDateMin}`)
    return
  }
  if (isString(strDataMax)) {
    strDataMax = strToDate(strDataMax)
  }
  if (isString(strDateMin)) {
    strDateMin = strToDate(strDateMin)
  }
  let maxTime = strDataMax.getTime()
  let minTime = strDateMin.getTime()
  return containEq ? maxTime >= minTime : maxTime > minTime
}

/**
 * 字符串格式日期转换为日期对象
 * @param {String} str 字符串日期  YYYY-MM-dd
 *
 */
export function strToDate(str) {
  if (str) {
    var arr = str.split('-')
    arr[1] = arr[1] - 1
    return new Date(...arr)
  }
  console.warn(`strToDate ===>  请传入YYYY-MM-dd格式的日期. 你传人的是 ${str}`)
}

/**
 * 时间格式化方法
 * @param {String} 格式 yyyyMMdd hhmmssqqS
 * @param {Date} date
 */
export function dateFormat(fmt, date) {
  date = date || new Date()
  var o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds() //毫秒
  }
  if (/([yY]+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}

/**
 * @desc   格式化${startTime}距现在的已过时间
 * @param  {Date} startTime
 * @return {String}
 */
export function formatPassTime(dateTime) {
  if (!dateTime) return ''

  const now = new Date().getTime()
  const timestamp = new Date(dateTime).getTime()
  const passTime = now - timestamp

  const minute = 1000 * 60
  const hour = minute * 60
  const day = hour * 24
  const month = day * 30
  const year = month * 12

  if (passTime < minute) {
    return '刚刚'
  } else if (passTime < hour) {
    return Math.floor(passTime / minute) + '分钟前'
  } else if (passTime < day) {
    return Math.floor(passTime / hour) + '小时前'
  } else if (passTime < month) {
    return Math.floor(passTime / day) + '天前'
  } else if (passTime < year) {
    return Math.floor(passTime / month) + '个月前'
  } else {
    return Math.floor(passTime / year) + '年前'
  }
}

export function formatDateTime(dateTime, showHour = false) {
  if (!dateTime) return ''

  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  if (showHour) {
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
  return `${year}-${month}-${day}`
}
