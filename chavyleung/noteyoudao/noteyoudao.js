const $ = new Env('有道云笔记')
$.VAL_login = $.getdata('chavy_login_noteyoudao')
$.VAL_sign_url = $.getdata('chavy_signurl_noteyoudao')
$.VAL_sign_body = $.getdata('chavy_signbody_noteyoudao')
$.VAL_sign_headers = $.getdata('chavy_signheaders_noteyoudao')

!(async () => {
  await loginapp()
  await signinapp()
  await logindaily()
  await showmsg()
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())

function loginapp() {
  return new Promise((resove) => {
    const { url, body, headers } = JSON.parse($.VAL_login)
    $.post({ url, body, headers: JSON.parse(headers) }, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        $.log(`❕ ${$.name}, 登录: ${JSON.stringify(response)}`)
      } catch (e) {
        $.log(`❗️ ${$.name}, 每日登录: 失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  })
}

function logindaily() {
  return new Promise((resove) => {
    const url = { url: 'https://note.youdao.com/yws/api/daupromotion?method=sync', headers: JSON.parse($.VAL_sign_headers) }
    delete url.headers.Cookie
    $.post(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        $.log(`❕ ${$.name}, 每日登录: ${data}`)
        $.daily = JSON.parse(data)
      } catch (e) {
        $.log(`❗️ ${$.name}, 每日登录: 失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  })
}

function signinapp() {
  return new Promise((resove) => {
    const url = { url: $.VAL_sign_url, body: $.VAL_sign_body, headers: JSON.parse($.VAL_sign_headers) }
    delete url.headers.Cookie
    $.post(url, (error, response, data) => {
      try {
        if (error) throw new Error(error)
        $.log(`❕ ${$.name}, 每日签到: ${data}`)
        $.signin = JSON.parse(data)
      } catch (e) {
        $.log(`❗️ ${$.name}, 每日登录: 失败!`, ` error = ${error || e}`, `response = ${JSON.stringify(response)}`, `data = ${data}`, '')
      } finally {
        resove()
      }
    })
  })
}

function showmsg() {
  return new Promise((resove) => {
    const dailyFlag = $.daily.accept === true ? '成功' : '重复'
    const signinFlag = $.signin.success === 1 ? '成功' : $.signin.success === 0 ? '重复' : '错误'
    $.subt = `每日登录: ${dailyFlag}, 每日签到: ${signinFlag}`
    const continuousDays = `连签: ${$.daily.rewardSpace / 1024 / 1024}天`
    const rewardSpace = `本次获得: ${$.daily.rewardSpace / 1024 / 1024}MB`
    const totalReward = `总共获得: ${$.daily.totalRewardSpace / 1024 / 1024}MB`
    $.desc = `${continuousDays}, ${rewardSpace}, ${totalReward}`
    resove()
  })
}

// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient}isLoon(){return"undefined"!=typeof $loon}loaddata(){if(!this.isNode)return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch{return{}}}}}writedata(){if(this.isNode){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),h=JSON.stringify(this.data);e?this.fs.writeFileSync(t,h):i?this.fs.writeFileSync(s,h):this.fs.writeFileSync(t,h)}}getdata(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setdata(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status,s(t,e,i))}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status,s(t,e,i))});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:h,body:o}=t;s(null,{status:e,statusCode:i,headers:h,body:o},o)},t=>s(t))}}msg(s=t,e="",i="",h){this.isSurge()||this.isLoon()?$notification.post(s,e,i):this.isQuanX()&&$notify(s,e,i),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.message)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t=null){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
