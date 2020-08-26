const cookieName = 'QQ音乐'
const signurlKey = 'chavy_signurl_qqmusic'
const signheaderKey = 'chavy_header_qqmusic'
const signbodyKey = 'chavy_body_qqmusic'
const signFlagKey = 'chavy_flag_qqmusic'
const chavy = init()

if ($request && $request.body) {
  // 每日签到: UserGrow.UserGrowScore receive_score
  // 每月签到: music.activeCenter.MonthLoginSvr MonthScore
  // 签到记录: UserGrow.UserGrowScore sign_record
  const is_receive_score = $request.body.indexOf(`receive_score`) >= 0
  const is_MonthScore = $request.body.indexOf(`MonthScore`) >= 0
  const is_sign_record = $request.body.indexOf(`sign_record`) >= 0
  if ($request.headers['Cookie'] && is_receive_score) {
    let signFlagVal = is_receive_score ? `receive_score` : ``
    signFlagVal = is_MonthScore ? `MonthScore` : signFlagVal
    signFlagVal = is_sign_record ? `sign_record` : signFlagVal
    const signurlVal = $request.url
    const signheaderVal = JSON.stringify($request.headers)
    const signbodyVal = $request.body
    if (signurlVal) chavy.setdata(signurlVal, signurlKey)
    if (signheaderVal) chavy.setdata(signheaderVal, signheaderKey)
    if (signbodyVal) chavy.setdata(signbodyVal, signbodyKey)
    if (signFlagVal) chavy.setdata(signFlagVal, signFlagKey)
    chavy.msg(`${cookieName}`, '获取Cookie: 成功', '')
    // chavy.log(`[${cookieName}] 获取Cookie: 成功, SignUrl: ${signurlVal}`)
    // chavy.log(`[${cookieName}] 获取Cookie: 成功, SignHeader: ${signheaderVal}`)
    // chavy.log(`[${cookieName}] 获取Cookie: 成功, SignBody: ${signbodyVal}`)
  }
} else if ($response && $response.body && $request.url == chavy.getdata(signurlKey) && `receive_score` == chavy.getdata(signFlagKey)) {
  const respbodyObj = JSON.parse($response.body)
  if (respbodyObj && respbodyObj.req_0 && respbodyObj.req_0.data && respbodyObj.req_0.data.totalDays) {
    chavy.msg(`${cookieName}`, '手动签到: 成功 (每日签到)', `共签: ${respbodyObj.req_0.data.totalDays}天, 今天积分: +${respbodyObj.req_0.data.todayScore}, 明天积分: +${respbodyObj.req_0.data.tomrrowScore}`)
    chavy.log(`[${cookieName}] 手动签到: 成功 (每日签到), 共签: ${respbodyObj.req_0.data.totalDays}天, 今天积分: +${respbodyObj.req_0.data.todayScore}, 明天积分: +${respbodyObj.req_0.data.tomrrowScore}`)
  }
} else if ($response && $response.body && $request.url == chavy.getdata(signurlKey) && `MonthScore` == chavy.getdata(signFlagKey)) {
  const respbodyObj = JSON.parse($response.body)
  if (respbodyObj && respbodyObj.req_0 && respbodyObj.req_0.data && respbodyObj.req_0.data.totalDays) {
    chavy.msg(`${cookieName}`, '手动签到: 成功 (每月首签)', `共签: ${respbodyObj.req_0.data.totalDays}天, 积分: +${respbodyObj.req_0.data.todayScore}`)
    chavy.log(`[${cookieName}] 手动签到: 成功 (每月首签), 说明: 共签: ${respbodyObj.req_0.data.totalDays}天, 积分: +${respbodyObj.req_0.data.todayScore}`)
  }
} else if ($response && $response.body && $request.url == chavy.getdata(signurlKey) && `sign_record` == chavy.getdata(signFlagKey)) {
  const respbodyObj = JSON.parse($response.body)
  if (respbodyObj && respbodyObj.req_0 && respbodyObj.req_0.data && respbodyObj.req_0.data.totalDays) {
    chavy.msg(`${cookieName}`, '获取签到: 成功', `共签: ${respbodyObj.req_0.data.totalDays}天, 积分: +${respbodyObj.req_0.data.todayScore}`)
    chavy.log(`[${cookieName}] 获取签到: 成功, 说明: 共签: ${respbodyObj.req_0.data.totalDays}天, 积分: +${respbodyObj.req_0.data.todayScore}`)
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
