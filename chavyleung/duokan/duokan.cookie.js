const DUOKAN_COOKIE_KEY = 'duokan_cookie'
const DUOKAN_DEVICE_ID_KEY = 'duokan_device_id'

let $util = init()

if (typeof $request !== 'undefined') {
  getCookie()
}
$util.done({})

function getCookie() {
  let cookieVal = $request.headers['Cookie']
  $util.log(`cookie: ${cookieVal}`)
  if (cookieVal.indexOf('token=') !== -1 && cookieVal.indexOf('device_id=') !== -1) {
    let regexp = /device_id=(.*?);/g
    let matched = regexp.exec(cookieVal)
    if (matched) {
      let deviceId = matched[1]
      $util.log(`deviceId: ${deviceId}`)
      if ($util.setdata(cookieVal, DUOKAN_COOKIE_KEY) && $util.setdata(deviceId, DUOKAN_DEVICE_ID_KEY)) {
        $util.msg(`获取多看阅读 Cookie 成功 🎉`)
      }
    }
  }
}

function init() {
  isSurge = () => {
    return undefined !== this.$httpClient
  }
  isQuanX = () => {
    return undefined !== this.$task
  }
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle = '', body = '') => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }
  log = (msg) => {
    console.log(`${msg}\n`)
  }
  get = (options, callback) => {
    if (isQuanX()) {
      if (typeof options == 'string') options = { url: options }
      options['method'] = 'GET'
      return $task.fetch(options).then(
        (response) => {
          response['status'] = response.statusCode
          callback(null, response, response.body)
        },
        (reason) => callback(reason.error, null, null)
      )
    }
    if (isSurge()) return $httpClient.get(options, callback)
  }
  post = (options, callback) => {
    if (isQuanX()) {
      if (typeof options == 'string') options = { url: options }
      options['method'] = 'POST'
      $task.fetch(options).then(
        (response) => {
          response['status'] = response.statusCode
          callback(null, response, response.body)
        },
        (reason) => callback(reason.error, null, null)
      )
    }
    if (isSurge()) $httpClient.post(options, callback)
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
}
