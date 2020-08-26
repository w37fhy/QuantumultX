const cookieName = '网易新闻'
const cookieKey = 'chavy_cookie_neteasenews'
const bodyKey = 'chavy_body_neteasenews'
const chavy = init()
let cookieVal = null
let bodyVal = ``

if ($request.body) {
  cookieVal = JSON.stringify($request.headers)
  bodyVal = bodyVal ? bodyVal : $request.body
} else {
  // ([^:]*):\s(.*)\n?
  // cookieObj['$1'] = $request.headers['$1']\n
  const cookieObj = {}
  cookieObj['Content-Length'] = `699`
  cookieObj['isDirectRequest'] = `1`
  cookieObj['X-NR-Trace-Id'] = $request.headers['X-NR-Trace-Id']
  cookieObj['User-DA'] = $request.headers['User-DA']
  cookieObj['Accept-Encoding'] = `gzip, deflate, br`
  cookieObj['Connection'] = `keep-alive`
  cookieObj['Content-Type'] = `application/x-www-form-urlencoded`
  cookieObj['User-D'] = $request.headers['User-D']
  cookieObj['User-U'] = $request.headers['User-U']
  cookieObj['User-id'] = $request.headers['User-id']
  cookieObj['User-C'] = $request.headers['User-C']
  cookieObj['User-tk'] = $request.headers['User-tk']
  cookieObj['User-N'] = $request.headers['User-N']
  cookieObj['User-Agent'] = `NewsApp/64.1 iOS/13.3 (iPhone10,1)`
  cookieObj['Host'] = `c.m.163.com`
  cookieObj['User-LC'] = $request.headers['User-LC']
  cookieObj['Accept-Language'] = `zh-cn`
  cookieObj['Accept'] = `*/*`
  cookieObj['User-L'] = $request.headers['User-L']
  cookieVal = JSON.stringify(cookieObj)
}

if (cookieVal) {
  chavy.setdata(cookieVal, cookieKey)
  chavy.msg(`${cookieName}`, '获取Cookie: 成功', '')
  chavy.log(`[${cookieName}] 获取Cookie: 成功, cookie: ${cookieVal}`)
} else {
  chavy.msg(`${cookieName}`, '获取Cookie: 失败', '说明: 未知')
  chavy.log(`[${cookieName}] 获取Cookie: 失败, cookie: ${cookieVal}`)
}
if (bodyVal) {
  chavy.setdata(bodyVal, bodyKey)
  chavy.msg(`${cookieName}`, '获取Body: 成功', '')
  chavy.log(`[${cookieName}] 获取Body: 成功, body: ${bodyVal}`)
} else {
  if (isQuanX()) {
    chavy.msg(`${cookieName}`, '获取Body: 失败', '说明: QuanX用户请手动抓包 body 参数!')
    chavy.log(`[${cookieName}] 获取Body: 失败, 说明: QuanX用户请手动抓包 body 参数!`)
  } else {
    chavy.msg(`${cookieName}`, '获取Body: 失败', '说明: 未知')
    chavy.log(`[${cookieName}] 获取Body: 失败, body: ${bodyVal}`)
  }
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
