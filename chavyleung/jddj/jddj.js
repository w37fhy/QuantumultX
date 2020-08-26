const cookieName ='京东到家'
const signheaderKey = 'chen_signheader_jddj'
const chen = init()
const signheaderVal = chen.getdata(signheaderKey)
sign()
function sign() {
    let url = {url: `https://daojia.jd.com/client?functionId=signin%2FuserSigninNew&body=%7B%7D`,headers: JSON.parse(signheaderVal)}
    chen.get(url, (error, response, data) => {
      chen.log(`${cookieName}, data: ${data}`)
      let res = JSON.parse(data)
      const title = `${cookieName}`
      let subTitle = ``
      let detail = ``
      if (res.success&&res.result.points!='undefined') {
        subTitle = `签到结果:成功`
        detail = `获取鲜豆：${res.result.points}`
      } else if(!res.success&&res.code==202){
        subTitle = `签到结果: 失败`
        detail = `说明: ${res.msg}`
      }
      else if (!res.success&&res.code==-1){
        subTitle = `签到成功,请勿重复操作`
      }
      else{
        subTitle = `未知错误,截图日志`
      }
      chen.msg(title, subTitle, detail)
    })
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