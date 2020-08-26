const $ = new Env('喜马拉雅')

$.KEY_signcookie = 'chavy_cookie_ximalaya'
$.signinfo = {}

let VAL_signcookie = $.getdata($.KEY_signcookie)
let time = new Date().getTime()

;(exec = async () => {
  await getinfo()
  if ($.signinfo.info.isTickedToday == 0) await signapp()
  // await browseapp()
  await getacc()
  showmsg()
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())

function signapp() {
  return new Promise((resolve, reject) => {
    const url = {
      url: `https://hybrid.ximalaya.com/web-activity/signIn/action?aid=8&ts=${time}&_sonic=0&impl=com.gemd.iting&_sonic=0`,
      headers: { Cookie: VAL_signcookie }
    }
    url.headers['Accept'] = 'application/json, text/plain, */*'
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Host'] = 'hybrid.ximalaya.com'
    url.headers['User-Agent'] =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iting/6.6.45 kdtunion_iting/1.0 iting(main)/6.6.45/ios_1'
    $.post(url, (error, response, data) => {
      try {
        $.signinfo.sign = JSON.parse(response.body)
        resolve()
      } catch (e) {
        $.msg($.name, `签到结果: 失败`, `说明: ${e}`)
        $.log(`❌ ${$.name} signapp - 签到失败: ${e}`)
        $.log(`❌ ${$.name} signapp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function browseapp() {
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(new Date().getTime() / 1000).toString()
    const browseappurl = `https://mobile.ximalaya.com/daily-label-mobile/v1/task/checkIn/ts-${timestamp}?coinSwitch=true`
    const url = { url: browseappurl, headers: { Cookie: VAL_signcookie } }
    url.headers['Accept'] = '*/*'
    url.headers['Accept-Encoding'] = 'gzip, deflate'
    url.headers['Accept-Language'] = 'zh-Hans-CN;q=1, en-US;q=0.9'
    url.headers['Connection'] = 'close'
    url.headers['Host'] = 'mobile.ximalaya.com'
    url.headers['User-Agent'] =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iting/6.6.45 kdtunion_iting/1.0 iting(main)/6.6.45/ios_1'
    $.get(url, (error, response, data) => {
      try {
        $.log(`❕ ${$.name} browseapp - response: ${JSON.stringify(response)}`)
        $.signinfo.browseapp = JSON.parse(data)
        resolve()
      } catch (e) {
        $.msg($.name, `每日浏览: 失败`, `说明: ${e}`)
        $.log(`❌ ${$.name} browseapp - 每日浏览: ${e}`)
        $.log(`❌ ${$.name} browseapp - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getinfo() {
  return new Promise((resolve, reject) => {
    const url = { url: `https://m.ximalaya.com/starwar/lottery/check-in/record`, headers: { Cookie: VAL_signcookie } }
    url.headers['Accept'] = `application/json, text/plain, */*`
    url.headers['Accept-Encoding'] = `gzip, deflate, br`
    url.headers['Accept-Language'] = `zh-cn`
    url.headers['Connection'] = `keep-alive`
    url.headers['Content-Type'] = `application/json;charset=utf-8`
    url.headers['Host'] = `m.ximalaya.com`
    url.headers['User-Agent'] =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iting/6.6.45 kdtunion_iting/1.0 iting(main)/6.6.45/ios_1'
    $.get(url, (error, response, data) => {
      try {
        $.signinfo.info = JSON.parse(data)
        resolve()
      } catch (e) {
        $.msg($.name, `获取签到信息: 失败`, `说明: ${e}`)
        $.log(`❌ ${$.name} getinfo - 获取签到信息失败: ${e}`)
        $.log(`❌ ${$.name} getinfo - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function getacc() {
  return new Promise((resolve, reject) => {
    const url = { url: `https://m.ximalaya.com/starwar/task/listen/account`, headers: { Cookie: VAL_signcookie } }
    url.headers['Accept'] = `application/json, text/plain, */*`
    url.headers['Accept-Encoding'] = `gzip, deflate, br`
    url.headers['Accept-Language'] = `zh-cn`
    url.headers['Connection'] = `keep-alive`
    url.headers['Content-Type'] = `application/json;charset=utf-8`
    url.headers['Host'] = `m.ximalaya.com`
    url.headers['User-Agent'] =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 iting/6.6.45 kdtunion_iting/1.0 iting(main)/6.6.45/ios_1'
    $.get(url, (error, response, data) => {
      try {
        $.signinfo.acc = JSON.parse(data)
        resolve()
      } catch (e) {
        $.msg($.name, `获取账号信息: 失败`, `说明: ${e}`)
        $.log(`❌ ${$.name} getacc - 获取账号信息失败: ${e}`)
        $.log(`❌ ${$.name} getacc - response: ${JSON.stringify(response)}`)
        resolve()
      }
    })
  })
}

function showmsg() {
  let subTitle = ''
  let detail = ''
  if ($.signinfo.info.isTickedToday == false) {
    if ($.signinfo.sign.data.status == 0) {
      subTitle = '签到: 成功'
      detail = `当前连签: ${$.signinfo.info.continuousDays + 1}天, 积分: ${$.signinfo.acc.data.score}(+${$.signinfo.info.awardAmount})`
    } else if ($.signinfo.sign.data.msg != undefined) {
      subTitle = '签到: 失败'
      detail = `说明: ${$.signinfo.sign.data.msg}`
    } else {
      subTitle = '签到: 失败'
      detail = `说明: Cookie失效`
    }
  } else {
    subTitle = `签到: 重复`
    detail = `当前连签: ${$.signinfo.info.continuousDays}天, 积分: ${$.signinfo.acc.data.score}(+${$.signinfo.info.awardAmount})`
  }

  if ($.signinfo.browseapp) {
    if ($.signinfo.browseapp.ret == 0 && $.signinfo.browseapp.data && $.signinfo.browseapp.data.awards) {
      if ($.signinfo.browseapp.data.awards) subTitle += `, 每日浏览: 成功 (${$.signinfo.browseapp.data.awards})`
      else subTitle += ', 每日浏览: 重复'
    } else {
      subTitle += ', 每日浏览: 失败'
    }
  }
  $.msg($.name, subTitle, detail)
}

// prettier-ignore
function Env(t,s){class e{constructor(t){this.env=t}send(t,s="GET"){t="string"==typeof t?{url:t}:t;let e=this.get;return"POST"===s&&(e=this.post),new Promise((s,i)=>{e.call(this,t,(t,e,o)=>{t?i(t):s(e)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,s){this.name=t,this.http=new e(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,s=null){try{return JSON.parse(t)}catch{return s}}toStr(t,s=null){try{return JSON.stringify(t)}catch{return s}}getjson(t,s){let e=s;const i=this.getdata(t);if(i)try{e=JSON.parse(this.getdata(t))}catch{}return e}setjson(t,s){try{return this.setdata(JSON.stringify(t),s)}catch{return!1}}getScript(t){return new Promise(s=>{this.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};this.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=this.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;this.isMute||(this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o)));let a=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];a.push(s),e&&a.push(e),i&&a.push(i),console.log(a.join("\n")),this.logs=this.logs.concat(a)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
