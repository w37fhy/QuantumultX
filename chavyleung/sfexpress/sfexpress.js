const $ = new Env('顺丰速运')
$.VAL_loginurl = $.getdata('chavy_loginurl_sfexpress')
$.VAL_loginheader = $.getdata('chavy_loginheader_sfexpress')

!(async () => {
  await refresh()
  await loginapp()
  await signapp()
  await getinfo()
  await showmsg()
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())

function refresh() {
  if (!$.isQuanX()) return
  return new Promise((resolve) => {
    const url = { url: `https://sf-integral-sign-in.weixinjia.net/app/signin`, headers: { Cookie: '' } }
    url.body = `date=${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
    $.post(url, () => resolve())
  })
}

function loginapp() {
  return new Promise((resolve) => {
    const url = { url: $.VAL_loginurl }
    $.get(url, () => resolve())
  })
}

function signapp() {
  return new Promise((resolve) => {
    const url = { url: `https://sf-integral-sign-in.weixinjia.net/app/signin`, headers: JSON.parse($.VAL_loginheader) }
    delete url.headers['Cookie']
    url.headers['Origin'] = 'https://sf-integral-sign-in.weixinjia.net'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    url.headers['Accept'] = 'application/json, text/plain, */*'
    url.headers['Host'] = 'sf-integral-sign-in.weixinjia.net'
    url.headers['Accept-Language'] = 'zh-cn'
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.body = `date=${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
    $.post(url, (err, resp, data) => {
      try {
        $.signapp = JSON.parse(data)
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve()
      }
    })
  })
}

function getinfo() {
  return new Promise((resolve) => {
    const url = { url: `https://sf-integral-sign-in.weixinjia.net/app/init`, headers: JSON.parse($.VAL_loginheader) }
    delete url.headers['Cookie']
    url.headers['Origin'] = 'https://sf-integral-sign-in.weixinjia.net'
    url.headers['Connection'] = 'keep-alive'
    url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    url.headers['Accept'] = 'application/json, text/plain, */*'
    url.headers['Host'] = 'sf-integral-sign-in.weixinjia.net'
    url.headers['Accept-Encoding'] = 'gzip, deflate, br'
    url.headers['Accept-Language'] = 'zh-cn'
    $.post(url, (err, resp, data) => {
      try {
        $.info = JSON.parse(data)
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve()
      }
    })
  })
}

function showmsg() {
  return new Promise((resolve) => {
    if ($.signapp.code == 0 && $.signapp.msg == 'success') {
      $.subt = `签到: 成功`
    } else if ($.signapp.code == -1) {
      if ($.signapp.msg == 'ALREADY_CHECK') {
        $.subt = `签到: 重复`
      } else {
        $.subt = `签到: 失败`
      }
    } else {
      $.subt = `签到: 未知`
      $.desc = `说明: ${$.signapp.msg}`
    }
    if ($.info && $.info.code == 0) {
      $.desc = `积分: ${$.info.data.member_info.integral}, 本周连签: ${$.info.data.check_count}天`
    }
    $.msg($.name, $.subt, $.desc)
    resolve()
  })
}

// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient}isLoon(){return"undefined"!=typeof $loon}loaddata(){if(!this.isNode)return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch{return{}}}}}writedata(){if(this.isNode){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),h=JSON.stringify(this.data);e?this.fs.writeFileSync(t,h):i?this.fs.writeFileSync(s,h):this.fs.writeFileSync(t,h)}}getdata(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setdata(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status,s(t,e,i))}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status,s(t,e,i))});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t))}}msg(s=t,e="",i="",h){this.isSurge()||this.isLoon()?$notification.post(s,e,i):this.isQuanX()&&$notify(s,e,i),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.message)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t=null){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
