const chavy = init()
const cookieName = '苏宁易购'
const KEY_loginurl = 'chavy_login_url_suning'
const KEY_loginbody = 'chavy_login_body_suning'
const KEY_loginheader = 'chavy_login_header_suning'
const KEY_signurl = 'chavy_sign_url_suning'
const KEY_signheader = 'chavy_sign_header_suning'
const KEY_signweburl = 'chavy_signweb_url_suning'
const KEY_signwebheader = 'chavy_signweb_header_suning'
const KEY_signgameurl = 'chavy_signgame_url_suning'
const KEY_signgameheader = 'chavy_signgame_header_suning'
const KEY_signgetgameurl = 'chavy_signgetgame_url_suning'
const KEY_signgetgameheader = 'chavy_signgetgame_header_suning'

if ($request.url.match(/\/ids\/login/)) {
  const VAL_loginurl = $request.url
  const VAL_loginbody = $request.body
  const VAL_loginheader = JSON.stringify($request.headers)
  if (VAL_loginurl) chavy.setdata(VAL_loginurl, KEY_loginurl)
  if (VAL_loginbody) chavy.setdata(VAL_loginbody, KEY_loginbody)
  if (VAL_loginheader) chavy.setdata(VAL_loginheader, KEY_loginheader)
  chavy.msg(`${cookieName}`, '获取Cookie: 成功 (登录链接)', '')
  chavy.log(`❕ ${cookieName} 获取Cookie: 成功, VAL_loginurl: ${VAL_loginurl}`)
  chavy.log(`❕ ${cookieName} 获取Cookie: 成功, VAL_loginbody: ${VAL_loginbody}`)
  chavy.log(`❕ ${cookieName} 获取Cookie: 成功, VAL_loginheader: ${VAL_loginheader}`)
} else if ($request.url.match(/\/sign\/doSign.do/)) {
  const VAL_signurl = $request.url
  const VAL_signheader = JSON.stringify($request.headers)
  if (VAL_signurl) chavy.setdata(VAL_signurl, KEY_signurl)
  if (VAL_signheader) chavy.setdata(VAL_signheader, KEY_signheader)
  chavy.msg(`${cookieName}`, '获取Cookie: 成功 (每日签到)', '')
  chavy.log(`❕ ${cookieName} 获取Cookie: 成功, VAL_signurl: ${VAL_signurl}`)
  chavy.log(`❕ ${cookieName} 获取Cookie: 成功, VAL_signheader: ${VAL_signheader}`)
} else if ($request.url.match(/\/api\/clock_sign.do/)) {
  const VAL_signweburl = $request.url
  const VAL_signwebheader = JSON.stringify($request.headers)
  if (VAL_signweburl) chavy.setdata(VAL_signweburl, KEY_signweburl)
  if (VAL_signwebheader) chavy.setdata(VAL_signwebheader, KEY_signwebheader)
  chavy.msg(`${cookieName}`, '获取Cookie: 成功 (每日红包)', '')
  chavy.log(`❕ ${cookieName} 获取Cookie: 成功, VAL_signweburl: ${VAL_signweburl}`)
  chavy.log(`❕ ${cookieName} 获取Cookie: 成功, VAL_signwebheader: ${VAL_signwebheader}`)
} else if ($request.url.match(/customerSignOperation.do/)) {
  const VAL_signgameurl = $request.url
  const VAL_signgameheader = JSON.stringify($request.headers)
  if (VAL_signgameurl) chavy.setdata(VAL_signgameurl, KEY_signgameurl)
  if (VAL_signgameheader) chavy.setdata(VAL_signgameheader, KEY_signgameheader)
  chavy.msg(`${cookieName}`, '获取Cookie: 成功 (天天低价)', '')
  chavy.log(`❕ ${cookieName} 获取Cookie: 成功, VAL_signgameurl: ${VAL_signgameurl}`)
  chavy.log(`❕ ${cookieName} 获取Cookie: 成功, VAL_signgameheader: ${VAL_signgameheader}`)
} else if ($request.url.match(/queryPrize.do/)) {
  const VAL_signgetgameurl = $request.url
  const VAL_signgetgameheader = JSON.stringify($request.headers)
  if (VAL_signgetgameurl) chavy.setdata(VAL_signgetgameurl, KEY_signgetgameurl)
  if (VAL_signgetgameheader) chavy.setdata(VAL_signgetgameheader, KEY_signgetgameheader)
  chavy.msg(`${cookieName}`, '获取Cookie: 成功 (查询天天低价)', '')
  chavy.log(`❕ ${cookieName} 获取Cookie: 成功, VAL_signgetgameurl: ${VAL_signgetgameurl}`)
  chavy.log(`❕ ${cookieName} 获取Cookie: 成功, VAL_signgetgameheader: ${VAL_signgetgameheader}`)
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
