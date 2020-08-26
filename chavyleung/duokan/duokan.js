const DUOKAN_COOKIE_KEY = 'duokan_cookie'
const DUOKAN_DEVICE_ID_KEY = 'duokan_device_id'
const API_HOST = 'https://www.duokan.com'
const TASK_NAME = '多看阅读'

let $util = init()

;(async () => {
  let cookieVal = $util.getdata(DUOKAN_COOKIE_KEY)
  let deviceId = $util.getdata(DUOKAN_DEVICE_ID_KEY)
  if (!cookieVal || !deviceId) {
    $util.msg(TASK_NAME, '⚠️ 请先获取 Cookie')
    $util.done({})
    return
  }
  await checkin(cookieVal, deviceId).then(() => {
    $util.done({})
  })
})()

function checkin(cookieVal, deviceId) {
  return new Promise((resolve, reject) => {
    let options = {
      url: `${API_HOST}/checkin/v0/checkin`,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        Cookie: cookieVal
      },
      body: signature(deviceId)
    }
    $util.post(options, (error, response, data) => {
      if (error) {
        $util.log(`签到失败，error：${error}`)
        $util.msg(TASK_NAME, '⚠️ 签到失败，详情请查看日志')
        resolve()
        return
      }
      let result = JSON.parse(data)
      if (result && result.result === 0 && result.data) {
        $util.log(`签到成功，response: ${data}`)
        let subtitle = `签到成功，已连续签到 ${result.data.today} 天`
        let body = ''
        if (result.data.gift && Array.isArray(result.data.gift) && result.data.gift.length > 0) {
          body = result.data.gift.reduce((prev, cur) => {
            return (prev += `获得 ${cur.value} 个${cur.name} \n`)
          }, '')
        }
        $util.msg(TASK_NAME, subtitle, body)
        resolve()
      } else {
        $util.log(`签到失败，response: ${data}`)
        $util.msg(TASK_NAME, `⚠️ 签到失败，${result.msg}`)
        resolve()
      }
    })
  })
}

function signature(deviceId) {
  let t = parseInt(new Date().getTime() / 1000)
  let c = 0
  for (char of `${deviceId}&${t}`) {
    c = (c * 131 + char.charCodeAt(0)) % 65536
  }
  return `_t=${t}&_c=${c}`
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
