const $ = new Env('什么值得买')
$.VAL_cookies = $.getdata('chavy_cookie_smzdm')
$.VAl_accounts = $.getdata('chavy_accounts_smzdm')
$.CFG_tokens = 'chavy_tokens_smzdm'

!(async () => {
  await signapp()
  await signweb()
  await showmsg()
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())

function signweb() {
  return new Promise((resove) => {
    const url = { url: 'https://zhiyou.smzdm.com/user/checkin/jsonp_checkin', headers: {} }
    url.headers['Cookie'] = $.VAL_cookies
    url.headers['Referer'] = 'http://www.smzdm.com/'
    url.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.132 Safari/537.36'
    $.get(url, (err, resp, data) => {
      try {
        $.web = JSON.parse(data)
      } catch (e) {
        $.token = null
        $.logErr(e, resp)
      } finally {
        resove()
      }
    })
  })
}

async function signapp() {
  const accounts = getAccounts()
  for (let accIdx = 0; accIdx < accounts.length; accIdx++) {
    const account = accounts[accIdx]
    await loginapp(account)
    await $.wait(account.isCached ? 0 : 3000)
    await signinapp(account)
    await $.wait(3000)
  }
  $.accounts = accounts
}

function loginapp(account) {
  const tokens = getTokens()
  if (tokens[account.acc]) {
    account.isCached = true
    account.token = tokens[account.acc]
    return
  }
  return new Promise((resove) => {
    const url = { url: 'https://api.smzdm.com/v1/user/login', headers: {} }
    url.body = `user_login=${account.acc}&user_pass=${account.pwd}&f=win`
    $.post(url, (err, resp, data) => {
      try {
        account.token = $.lodash_get(JSON.parse(data), 'data.token')
        const tokens = getTokens()
        tokens[account.acc] = account.token
        $.setdata(JSON.stringify(tokens), $.CFG_tokens)
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resove()
      }
    })
  })
}

function signinapp(account) {
  return new Promise((resove) => {
    const url = { url: 'https://api.smzdm.com/v1/user/checkin', headers: {} }
    url.body = `f=win&token=${account.token}`
    $.post(url, (err, resp, data) => {
      try {
        const _data = JSON.parse(data)
        const errCode = _data.error_code
        if (errCode === '0' && _data.data.checkin_status === '0') account.issuc = true
        else if (errCode === '0' && _data.data.checkin_status === '1') account.isrepeat = true
        else account.msg = _data.error_msg
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resove()
      }
    })
  })
}

function getAccounts() {
  const accounts = []
  $.VAl_accounts &&
    $.VAl_accounts.split('\n').forEach((account) => {
      let [acc, pwd] = account.split(',')
      acc = acc ? acc.trim() : acc
      pwd = pwd ? pwd.trim() : pwd
      if (acc && pwd) {
        accounts.push({ acc, pwd })
      }
    })
  return accounts
}

function getTokens() {
  const tokendat = $.getdata($.CFG_tokens)
  return [undefined, null, 'null', 'undefined', ''].includes(tokendat) ? {} : JSON.parse(tokendat)
}

function showmsg() {
  return new Promise((resolve) => {
    $.subt = ''
    $.desc = []
    $.subt = $.web.error_code === 0 ? 'PC: 成功' : $.web.error_code === 99 ? 'PC: 未登录' : 'PC: 失败'
    if ($.web.error_code === 0 && $.web.data) {
      $.desc.push(`累计: ${$.web.data.checkin_num}次, 经验: ${$.web.data.exp}, 金币: ${$.web.data.gold}, 积分: ${$.web.data.point}`)
    }
    if (Array.isArray($.accounts) && $.accounts.length > 0) {
      $.desc.push('点击查看详情', '')
      let signedCnt = 0
      for (let accIdx = 0; accIdx < $.accounts.length; accIdx++) {
        const account = $.accounts[accIdx]
        signedCnt += account.issuc || account.isrepeat ? 1 : 0
        $.desc.push(`${account.acc}: ${account.issuc ? '成功' : account.isrepeat ? '重复' : `失败. ${account.msg}`}`)
      }
      $.subt += `, APP: ${signedCnt}/${$.accounts.length}`
    } else {
      $.subt += ', APP: 在BoxJs设置签到账号'
    }
    $.msg($.name, $.subt, $.desc.join('\n'))
    resolve()
  })
}

// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient}isLoon(){return"undefined"!=typeof $loon}loaddata(){if(!this.isNode)return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch{return{}}}}}writedata(){if(this.isNode){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i),console.log(`${i}: ${JSON.stringify(s)}`)}catch{const s={};this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i),console.log(`${i}: ${JSON.stringify(s)}`)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status,s(t,e,i))}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status,s(t,e,i))});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}msg(s=t,e="",i="",o){this.isSurge()||this.isLoon()?$notification.post(s,e,i):this.isQuanX()&&$notify(s,e,i),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.message)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t=null){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
