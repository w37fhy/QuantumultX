const cookieName = 'CSDN'
const tokenurlKey = 'chavy_tokenurl_csdn'
const tokenheaderKey = 'chavy_tokenheader_csdn'
const signurlKey = 'chavy_signurl_csdn'
const signheaderKey = 'chavy_signheader_csdn'
const chavy = init()

let title = ``
let detail = ``
if ($request && $request.method != 'OPTIONS' && $request.headers.Host == 'passport.csdn.net') {
  const tokenurlVal = $request.url
  const tokenheaderVal = JSON.stringify($request.headers)
  if (tokenurlVal) chavy.setdata(tokenurlVal, tokenurlKey)
  if (tokenheaderVal) chavy.setdata(tokenheaderVal, tokenheaderKey)
  title = `获取刷新链接: 成功`
  detail = `请进入 "我的>签到" 并手动签到1次`
  chavy.msg(`${cookieName}`, title, detail)
} else if ($request && $request.method != 'OPTIONS' && $request.headers.Host == 'gw.csdn.net') {
  const signurlVal = $request.url
  const signheaderVal = JSON.stringify($request.headers)
  if (signurlVal) chavy.setdata(signurlVal, signurlKey)
  if (signheaderVal) chavy.setdata(signheaderVal, signheaderKey)
  title = `获取Cookie: 成功 (手动签到)`
  chavy.msg(`${cookieName}`, title, detail)
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
