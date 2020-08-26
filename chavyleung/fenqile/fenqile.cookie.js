const cookieName = '分期乐'
const signurlKey = 'senku_signurl_fenqile'
const signheaderKey = 'senku_signheader_fenqile'
const signbodyKey = 'senku_signbody_fenqile'
const signDailyKey = 'senku_signDailyKey_fenqile'
const signDailyUrlKey = 'senku_signDailyUrlKey_fenqile'
const senku = init()

const requrl = $request.url
if ($request && $request.method != 'OPTIONS' && requrl.match(/\/route0014\/star\/sign\//)) {
  const signurlVal = requrl
  const signheaderVal = JSON.stringify($request.headers)
  const signbodyVal = $request.body
  if (signurlVal) senku.setdata(signurlVal, signurlKey)
  if (signheaderVal) senku.setdata(signheaderVal, signheaderKey)
  if (signbodyVal) senku.setdata(signbodyVal, signbodyKey)
  senku.msg(cookieName, `获取Cookie: 成功`, `签到领乐星`)
} else {
  const signDailyUrlVal = $request.url
  const signDailyVal = $request.body;
  if (signDailyUrlVal) senku.setdata(signDailyUrlVal,signDailyUrlKey)
  if (signDailyVal) senku.setdata(signDailyVal,signDailyKey)
  senku.msg(cookieName, `获取Cookie: 成功`, `天天领乐星`)
  senku.log()
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
