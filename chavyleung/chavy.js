/**
 * [main.js]
 * const cookieVal = $persistentStore.read(cookieKey)
 * =>
 * const chavy = init()
 * const cookieVal = chavy.getdata(cookieKey)
 *
 * $httpClient.get => chavy.get
 * $httpClient.post => chavy.post
 * $notification.post => chavy.msg
 * console.log => chavy.log
 * $done({}) => chavy.done()
 *
 * [main.cookie.js]
 * const cookieVal = $request.headers['Cookie']
 * =>
 * const chavy = init()
 * const cookieVal = $request.headers['Cookie']
 *
 * $persistentStore.write => chavy.setdata
 * $notification.post => chavy.msg
 * console.log => chavy.log
 * $done({}) => chavy.done()
 */

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
