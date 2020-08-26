const $ = new Env('百度签到')
$.VAL_cookies = $.getdata('chavy_cookie_tieba') || $.getdata('CookieTB')

$.CFG_isOrderBars = $.getdata('CFG_tieba_isOrderBars') || 'false' // 1: 经验排序, 2: 连签排序
$.CFG_maxShowBars = $.getdata('CFG_tieba_maxShowBars') * 1 || 15 //每次通知数量
$.CFG_maxSignBars = $.getdata('CFG_tieba_maxSignBars') * 1 || 5 // 每次并发执行多少个任务
$.CFG_signWaitTime = $.getdata('CFG_tieba_signWaitTime') * 1 || 2000 // 每次并发间隔时间 (毫秒)

!(async () => {
  await tieba()
  await zhidao()
  await showmsg()
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done())

// 贴吧
function tieba() {
  return new Promise((resove) => {
    const url = { url: 'https://tieba.baidu.com/mo/q/newmoindex', headers: { Cookie: $.VAL_cookies } }
    $.get(url, async (err, resp, data) => {
      try {
        const _data = JSON.parse(data)
        // 处理异常
        if (_data.no !== 0) {
          throw new Error(`获取清单失败! 原因: ${_data.error}`)
        }
        // 组装数据
        $.bars = []
        $.tieba = { tbs: _data.data.tbs }
        _data.data.like_forum.forEach((bar) => $.bars.push(barWrapper(bar)))
        $.bars = $.bars.sort((a, b) => b.exp - a.exp)
        // 开始签到
        await signbars($.bars)
        await getbars($.bars)
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resove()
      }
    })
  })
}

async function signbars(bars) {
  let signbarActs = []
  // 处理`已签`数据
  bars.filter((bar) => bar.isSign).forEach((bar) => (bar.iscurSign = false))
  // 处理`未签`数据
  let _curbarIdx = 1
  let _signbarCnt = 0
  bars.filter((bar) => !bar.isSign).forEach((bar) => _signbarCnt++)
  for (let bar of bars.filter((bar) => !bar.isSign)) {
    const signbarAct = (resove) => {
      const url = { url: 'https://tieba.baidu.com/sign/add', headers: { Cookie: $.VAL_cookies } }
      url.body = `ie=utf-8&kw=${encodeURIComponent(bar.name)}&tbs=${$.tieba.tbs}`
      url.headers['Host'] = 'tieba.baidu.com'
      url.headers['User-Agent'] = 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1'
      $.post(url, (err, resp, data) => {
        try {
          const _data = JSON.parse(data)
          bar.iscurSign = true
          bar.issignSuc = _data.no === 0 || _data.no === 1101
          bar.signNo = _data.no
          bar.signMsg = _data.no === 1102 ? '签得太快!' : _data.error
          bar.signMsg = _data.no === 2150040 ? '需要验证码!' : _data.error
        } catch (e) {
          bar.iscurSign = true
          bar.issignSuc = false
          bar.signNo = null
          bar.signMsg = err !== null ? error : e
          $.logErr(e, resp)
        } finally {
          $.log(`❕ 贴吧:【${bar.name}】签到完成!`)
          resove()
        }
      })
    }
    signbarActs.push(new Promise(signbarAct))
    if (signbarActs.length === $.CFG_maxSignBars || _signbarCnt === _curbarIdx) {
      $.log('', `⏳ 正在发起 ${signbarActs.length} 个签到任务!`)
      await Promise.all(signbarActs)
      await $.wait($.CFG_signWaitTime)
      signbarActs = []
    }
    _curbarIdx++
  }
}

function getbars(bars) {
  const getBarActs = []
  for (let bar of bars) {
    const getBarAct = (resove) => {
      const url = { url: `http://tieba.baidu.com/sign/loadmonth?kw=${encodeURIComponent(bar.name)}&ie=utf-8`, headers: { Cookie: $.VAL_cookies } }
      url.headers['Host'] = 'tieba.baidu.com'
      url.headers['User-Agent'] = 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1'
      $.get(url, (err, resp, data) => {
        try {
          const _signinfo = JSON.parse(data).data.sign_user_info
          bar.signRank = _signinfo.rank
          bar.contsignCnt = _signinfo.sign_keep
          bar.totalsignCnt = _signinfo.sign_total
        } catch (e) {
          bar.contsignCnt = '❓'
          $.logErr(e, response)
        } finally {
          resove()
        }
      })
    }
    getBarActs.push(new Promise(getBarAct))
  }
  return Promise.all(getBarActs)
}

async function zhidao() {
  await loginZhidao()
  await signZhidao()
}

function loginZhidao() {
  return new Promise((resove) => {
    const url = { url: 'https://zhidao.baidu.com/', headers: { Cookie: $.VAL_cookies } }
    url.headers['Host'] = 'zhidao.baidu.com'
    url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15'
    $.zhidao = {}
    $.post(url, (err, resp, data) => {
      try {
        $.zhidao.stoken = data.match(/"stoken"[^"]*"([^"]*)"/)[1]
        if (!$.zhidao.stoken) {
          throw new Error(`获取 stoken 失败! stoken: ${$.zhidao.stoken}`)
        }
        $.zhidao.isloginSuc = true
        $.zhidao.loginMsg = '登录成功'
      } catch (e) {
        $.zhidao.isloginSuc = false
        $.zhidao.loginMsg = '登录失败'
        $.logErr(e, resp)
      } finally {
        resove()
      }
    })
  })
}

function signZhidao() {
  // 登录失败, 直接跳出
  if (!$.zhidao.isloginSuc) {
    return null
  }
  return new Promise((resove) => {
    const url = { url: 'https://zhidao.baidu.com/submit/user', headers: { Cookie: $.VAL_cookies } }
    url.headers['Host'] = 'zhidao.baidu.com'
    url.headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15'
    const timestamp = Date.parse(new Date())
    const utdata = `61,61,7,0,0,0,12,61,5,2,12,4,24,5,4,1,4,${timestamp}`
    url.body = `cm=100509&utdata=${utdata}&stoken=${$.zhidao.stoken}`
    $.post(url, (err, resp, data) => {
      try {
        const _data = JSON.parse(data)
        $.zhidao.isSignSuc = true
        $.zhidao.signNo = _data.errorNo
        $.zhidao.signMsg = _data.errorMsg
      } catch (e) {
        $.zhidao.isSignSuc = false
        $.zhidao.signNo = null
        $.zhidao.signMsg = e
        $.logErr(e, resp)
      } finally {
        resove()
      }
    })
  })
}

function barWrapper(bar) {
  return { id: bar.forum_id, name: bar.forum_name, exp: bar.user_exp, level: bar.user_level, isSign: bar.is_sign === 1 }
}

function showmsg() {
  return new Promise((resolve) => {
    // 数据: 签到数量
    const allbarCnt = $.bars.length
    let allsignCnt = 0
    let cursignCnt = 0
    let curfailCnt = 0
    $.bars.filter((bar) => bar.isSign).forEach((bar) => (allsignCnt += 1))
    $.bars.filter((bar) => bar.iscurSign && bar.issignSuc).forEach((bar) => (cursignCnt += 1))
    $.bars.filter((bar) => bar.iscurSign && !bar.issignSuc).forEach((bar) => (curfailCnt += 1))
    $.bars = [true, 'true'].includes($.CFG_isOrderBars) ? $.bars.sort((a, b) => b.contsignCnt - a.contsignCnt) : $.bars
    allsignCnt += cursignCnt
    // 通知: 副标题
    let tiebasubt = '贴吧: '
    if (allbarCnt == allsignCnt) tiebasubt += '成功'
    else if (allbarCnt == curfailCnt) tiebasubt += '失败'
    else tiebasubt += '部分'
    let zhidaosubt = '知道: '
    if ($.zhidao.isSignSuc && $.zhidao.signNo === 0) zhidaosubt += '成功'
    else if ($.zhidao.isSignSuc && $.zhidao.signNo === 2) zhidaosubt += '重复'
    else zhidaosubt += '失败'
    // 通知: 详情
    let _curPage = 1
    const _totalPage = Math.ceil(allbarCnt / $.CFG_maxShowBars)

    $.desc = []
    $.bars.forEach((bar, index) => {
      const barno = index + 1
      const signbar = `${bar.isSign || bar.issignSuc ? '🟢' : '🔴'} [${barno}]【${bar.name}】排名: ${bar.signRank}`
      const signlevel = `等级: ${bar.level}`
      const signexp = `经验: ${bar.exp}`
      const signcnt = `连签: ${bar.contsignCnt}/${bar.totalsignCnt}天`
      const signmsg = `${bar.isSign || bar.issignSuc ? '' : `失败原因: ${bar.signMsg}\n`}`
      $.desc.push(`${signbar}`)
      $.desc.push(`${signlevel}, ${signexp}, ${signcnt}`)
      $.desc.push(`${signmsg}`)
      if (barno % $.CFG_maxShowBars === 0 || barno === allbarCnt) {
        const _descinfo = []
        _descinfo.push(`共签: ${allsignCnt}/${allbarCnt}, 本次成功: ${cursignCnt}, 本次失败: ${curfailCnt}`)
        _descinfo.push(`点击查看详情, 第 ${_curPage++}/${_totalPage} 页`)
        $.subt = `${tiebasubt}, ${zhidaosubt}`
        $.desc = [..._descinfo, '', ...$.desc].join('\n')
        $.msg($.name, $.subt, $.desc)
        $.desc = []
      }
    })
    resolve()
  })
}

// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{this.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};this.post(n,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=this.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;this.isMute||(this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o)));let a=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];a.push(s),e&&a.push(e),i&&a.push(i),console.log(a.join("\n")),this.logs=this.logs.concat(a)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
