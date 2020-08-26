const cookieName = '美团外卖'
const tokenurlKey = 'chavy_tokenurl_wmmeituan'
const tokenheaderKey = 'chavy_tokenheader_wmmeituan'
const signurlKey = 'chavy_signurl_wmmeituan'
const signheaderKey = 'chavy_signheader_wmmeituan'
const signbodyKey = 'chavy_signbody_wmmeituan'
const chavy = init()

const requrl = $request.url
const reqRef = $request.headers.Referer
if ($request && $request.method != 'OPTIONS' && requrl.match(/playcenter\/signIn\/entry/)) {
  const tokenurlVal = requrl
  const tokenheaderVal = JSON.stringify($request.headers)
  if (tokenurlVal) chavy.setdata(tokenurlVal, tokenurlKey)
  if (tokenheaderVal) chavy.setdata(tokenheaderVal, tokenheaderKey)
  title = chavy.msg(cookieName, `获取刷新链接: 成功`, ``)
} else if ($request && $request.method != 'OPTIONS' && requrl.match(/playcenter\/signIn\/doaction/)) {
  const signurlVal = requrl
  const signheaderVal = JSON.stringify($request.headers)
  const signbodyVal = $request.body
  if (signurlVal) chavy.setdata(signurlVal, signurlKey)
  if (signheaderVal) chavy.setdata(signheaderVal, signheaderKey)
  if (signbodyVal) chavy.setdata(signbodyVal, signbodyKey)
  else {
    const tokenurlVal = chavy.getdata(tokenurlKey)
    const body = {}
    body.activityViewId = tokenurlVal.match(/activityViewId=(.*?)(&|$)/)[1]
    body.lat = tokenurlVal.match(/lat=(.*?)(&|$)/)[1]
    body.lng = tokenurlVal.match(/lng=(.*?)(&|$)/)[1]
    body.checkLogin = true
    body.appType = 3
    body.deviceType = 2
    chavy.setdata(JSON.stringify(body), signbodyKey)
  }
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
