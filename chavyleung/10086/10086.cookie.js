const cookieName = '中国移动'
const tokenurlKey = 'chavy_tokenurl_10086'
const tokenheaderKey = 'chavy_tokenheader_10086'
const signurlKey = 'chavy_signurl_10086'
const signheaderKey = 'chavy_signheader_10086'
const chavy = init()

const requrl = $request.url
const reqRef = $request.headers.Referer
if ($request && $request.method != 'OPTIONS' && requrl.indexOf('website/taskCenter/index') >= 0 && requrl.indexOf('mobile=') >= 0) {
  const tokenurlVal = requrl
  const tokenheaderVal = JSON.stringify($request.headers)
  if (tokenurlVal) chavy.setdata(tokenurlVal, tokenurlKey)
  if (tokenheaderVal) chavy.setdata(tokenheaderVal, tokenheaderKey)
  title = chavy.msg(cookieName, `获取刷新链接: 成功`, ``)
} else if ($request && $request.method != 'OPTIONS' && requrl.indexOf('website/taskCenter/sign') >= 0) {
  const signurlVal = requrl
  const signheaderVal = JSON.stringify($request.headers)
  if (signurlVal) chavy.setdata(signurlVal, signurlKey)
  if (signheaderVal) chavy.setdata(signheaderVal, signheaderKey)
  title = chavy.msg(cookieName, `获取Cookie: 成功`, ``)
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
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
chavy.done()
