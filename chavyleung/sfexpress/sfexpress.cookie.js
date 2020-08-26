const chavy = init()
const cookieName = '顺丰速运'
const KEY_loginurl = 'chavy_loginurl_sfexpress'
const KEY_loginheader = 'chavy_loginheader_sfexpress'
const KEY_login27url = 'chavy_login27url_sfexpress'
const KEY_login27header = 'chavy_login27header_sfexpress'

if ($request && $request.method != 'OPTIONS' && $request.url.match(/app\/index/)) {
  const VAL_loginurl = $request.url
  const VAL_loginheader = JSON.stringify($request.headers)
  if (VAL_loginurl) chavy.setdata(VAL_loginurl, KEY_loginurl)
  if (VAL_loginheader) chavy.setdata(VAL_loginheader, KEY_loginheader)
  chavy.msg(cookieName, `获取Cookie: 成功`, ``)
} else if ($request && $request.method != 'OPTIONS' && $request.url.match(/mcs-mimp\/share\/(.*?)Redirect/)) {
  const VAL_login27url = $request.url
  const VAL_login27header = JSON.stringify($request.headers)
  if (VAL_login27url) chavy.setdata(VAL_login27url, KEY_login27url)
  if (VAL_login27header) chavy.setdata(VAL_login27header, KEY_login27header)
  chavy.msg(cookieName, `获取Cookie: 成功 (27周年)`, ``)
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
