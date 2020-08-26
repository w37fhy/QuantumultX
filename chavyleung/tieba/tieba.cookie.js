const cookieName = '百度贴吧'
const cookieKey = 'chavy_cookie_tieba'
const chavy = init()
const cookieVal = $request.headers['Cookie']

if (cookieVal.indexOf('BDUSS') > 0) {
  let cookie = chavy.setdata(cookieVal, cookieKey)
  if (cookie) {
    let subTitle = '获取Cookie: 成功'
    chavy.msg(`${cookieName}`, subTitle, '')
    chavy.log(`[${cookieName}] ${subTitle}, cookie: ${cookieVal}`)
  }
} else {
  let subTitle = '获取Cookie: 失败'
  let detail = `请确保在已登录状态下获取Cookie`
  chavy.msg(`${cookieName}`, subTitle, detail)
  chavy.log(`[${cookieName}] ${subTitle}, cookie: ${cookieVal}`)
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
