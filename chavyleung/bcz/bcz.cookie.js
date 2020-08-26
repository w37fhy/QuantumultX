const cookieName = '百词斩'
const cookieKey = 'senku_cookie_bcz'
const shareKey = 'senku_key_bcz'
const senku = init()

if (this.$request && this.$request.headers) {
  const cookieVal = $request.headers['Cookie']
  const url = $request.url
  const index1 = url.indexOf('=')
  const index2 = url.indexOf('&')
  const shareVal = url.substring(index1 + 1, index2)
  if (cookieVal && shareVal) {
    if (senku.setdata(cookieVal, cookieKey) && senku.setdata(shareVal, shareKey)) {
      senku.msg(`${cookieName}`, '获取Cookie: 成功', '')
      senku.log(`[${cookieName}] 获取Cookie: 成功, cookie: ${cookieVal}`)
    }
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
senku.done()
