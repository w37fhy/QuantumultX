var appName = 'ZAKER新闻'
var zaker = init()
var URL = zaker.getdata("UrlZK")
var KEY = zaker.getdata("CookieZK")

let isGetCookie = typeof $request !== 'undefined'

if (isGetCookie) {
   getcookie()
} else {
   sign()
}

function getcookie() {
  var url = $request.url;
  if (url) {
     var UrlKeyZK = "UrlZK";
     var UrlValueZK = url;
     if (zaker.getdata(UrlKeyZK) != (undefined || null)) {
        if (zaker.getdata(UrlKeyZK) != UrlValueZK) {
           var url = zaker.setdata(UrlValueZK, UrlKeyZK);
           if (!url) {
              zaker.msg("更新" + appName + "Url失败‼️", "", "");
              } else {
              zaker.msg("更新" + appName + "Url成功🎉", "", "");
              }
           } else {
           zaker.msg(appName + "Url未变化❗️", "", "");
           }
        } else {
        var url = zaker.setdata(UrlValueZK, UrlKeyZK);
        if (!url) {
           zaker.msg("首次写入" + appName + "Url失败‼️", "", "");
           } else {
           zaker.msg("首次写入" + appName + "Url成功🎉", "", "");
           }
        }
     } else {
     zaker.msg("写入" + appName + "Url失败‼️", "", "配置错误, 无法读取URL, ");
     }
  if ($request.headers) {
     var CookieKeyZK = "CookieZK";
     var CookieValueZK = JSON.stringify($request.headers);
     if (zaker.getdata(CookieKeyZK) != (undefined || null)) {
        if (zaker.getdata(CookieKeyZK) != CookieValueZK) {
           var cookie = zaker.setdata(CookieValueZK, CookieKeyZK);
           if (!cookie) {
              zaker.msg("更新" + appName + "Cookie失败‼️", "", "");
              } else {
              zaker.msg("更新" + appName + "Cookie成功🎉", "", "");
              }
           } else {
           zaker.msg(appName + "Cookie未变化❗️", "", "");
           }
        } else {
        var cookie = zaker.setdata(CookieValueZK, CookieKeyZK);
        if (!cookie) {
           zaker.msg("首次写入" + appName + "Cookie失败‼️", "", "");
           } else {
           zaker.msg("首次写入" + appName + "Cookie成功🎉", "", "");
           }
        }
     } else {
     zaker.msg("写入" + appName + "Cookie失败‼️", "", "配置错误, 无法读取请求头, ");
     }
  zaker.done()
}
   
function sign() {
  const url = { url: URL, headers: JSON.parse(KEY) }
  zaker.get(url, (error, response, data) => {
    zaker.log(`${appName}, data: ${data}`)
    const title = `${appName}`
    let subTitle = ''
    let detail = ''
    const result = JSON.parse(data)
    if (result.stat == 1) {
      subTitle = `签到结果: 成功`
      detail = `签到奖励: ${result.data.tips}, 总签到天数: ${result.data.total_day_count}天`
    } else {
      subTitle = `签到结果: 未知`
      detail = `说明: ${result.msg}`
    }
    zaker.msg(title, subTitle, detail)
    zaker.done()
  })
}

function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  put = (url, cb) => {
    if (isSurge()) {
      $httpClient.put(url, cb)
    }
    if (isQuanX()) {
      url.method = 'PUT'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, put, done }
}