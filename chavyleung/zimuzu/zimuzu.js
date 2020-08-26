const $ = new Env('字幕组')
$.VAL_cookie = $.getdata('chavy_cookie_zimuzu')
$.VAL_appurl = $.getdata('chavy_auth_url_zimuzu_app')

!(async () => {
  await web()
  await app()
  await showmsg()
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())

function web() {
  return new Promise((resove) => {
    const url = { url: `http://www.rrys2020.com/user/login/getCurUserTopInfo`, headers: {} }
    url.headers['Cookie'] = $.VAL_cookie
    url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.4 Safari/605.1.15'
    $.get(url, (error, response, data) => ($.web = JSON.parse(data, resove())))
  })
}

async function app() {
  await loginapp()
  await refreshapp()
  await signapp()
}

function loginapp() {
  return new Promise((resove) => {
    const url = { url: $.VAL_appurl, headers: {} }
    url.headers['Accept'] = `*/*`
    url.headers['Accept-Encoding'] = `gzip;q=1.0, compress;q=0.5`
    url.headers['Accept-Language'] = `zh-Hans-CN;q=1.0, en-US;q=0.9`
    url.headers['Connection'] = `close`
    url.headers['Host'] = `ios.zmzapi.com`
    url.headers['Referer'] = `http://h5.rrhuodong.com/mobile/mission/pages/task.html`
    url.headers['User-Agent'] = `YYets_swift/2.5.7 (com.yyets.ZiMuZu; build:29; iOS 13.3.1) Alamofire/4.9.1`
    $.get(url, (error, response, data) => (($.loginapp = JSON.parse(data)), resove()))
  })
}

function refreshapp() {
  return new Promise((resove) => {
    const uid = $.loginapp && $.loginapp.data && $.loginapp.data.uid
    const token = $.loginapp && $.loginapp.data && $.loginapp.data.token
    const url = { url: `http://h5.rrhuodong.com/index.php?g=api/mission&m=index&a=login&uid=${uid}&token=${token}`, headers: {} }
    url.headers['Accept'] = `application/json, text/plain, */*`
    url.headers['Accept-Encoding'] = `gzip, deflate`
    url.headers['Accept-Language'] = `zh-cn`
    url.headers['Connection'] = `close`
    url.headers['Host'] = `h5.rrhuodong.com`
    url.headers['Referer'] = `http://h5.rrhuodong.com/mobile/mission/pages/task.html`
    url.headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    $.get(url, (error, response, data) => resove())
  })
}

function signapp() {
  return new Promise((resove) => {
    const url = { url: `http://h5.rrhuodong.com/index.php?g=api/mission&m=clock&a=store&id=2`, headers: {} }
    url.headers['Accept'] = `application/json, text/plain, */*`
    url.headers['Accept-Encoding'] = `gzip, deflate`
    url.headers['Accept-Language'] = `zh-cn`
    url.headers['Connection'] = `close`
    url.headers['Host'] = `h5.rrhuodong.com`
    url.headers['Referer'] = `http://h5.rrhuodong.com/mobile/mission/pages/task.html`
    url.headers['User-Agent'] = `Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148`
    $.get(url, (error, response, data) => (($.app = JSON.parse(data)), resove()))
  })
}

function showmsg() {
  return new Promise((resove) => {
    $.subt = ''
    $.desc = ''
    // web
    $.subt += '网页: '
    if ($.web.status == 1) {
      if ($.web.data.new_login) $.subt += '成功'
      else $.subt += '成功 (重复)'
      $.desc = `人人钻: ${$.web.data.userinfo.point}, 登录天数: ${$.web.data.usercount.cont_login}`
    } else if ($.web.status == 4001) {
      $.subt += '未登录'
    } else {
      $.subt += '失败'
    }

    // app
    $.subt += '; APP: '
    if ($.app.status == 1) $.subt += '成功'
    else if ($.app.status == 4005) $.subt += '成功 (重复)'
    else if ($.app.status == 1021) $.subt += '未登录'
    else $.subt += '失败'
    $.msg($.name, $.subt, $.desc)
    resove()
  })
}

// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient}isLoon(){return"undefined"!=typeof $loon}loaddata(){if(!this.isNode)return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch{return{}}}}}writedata(){if(this.isNode){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i),console.log(`${i}: ${JSON.stringify(s)}`)}catch{const s={};this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i),console.log(`${i}: ${JSON.stringify(s)}`)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status,s(t,e,i))}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status,s(t,e,i))});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}msg(s=t,e="",i="",o){this.isSurge()||this.isLoon()?$notification.post(s,e,i,o):this.isQuanX()&&$notify(s,e,i,o),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.message)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t=null){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
