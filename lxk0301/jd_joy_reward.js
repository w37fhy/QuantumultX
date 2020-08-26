/*
宠汪汪积分兑换奖品脚本, 目前脚本只兑换京豆
更新时间; 2020-08-26
兑换规则：一个账号一天只能兑换一次京豆。
1-5级：360积分兑换20京豆，6-10级：1600积分兑换100京豆， 11-20级：800积分兑换 50 ，21-25级：1600积分兑换100京豆。
再往上的等级兑换规则目前不知，欢迎大家提供信息
兑换奖品成功后才会有系统弹窗通知
每日京豆库存会在0:00、8:00、16:00更新，经测试发现中午12:00也会有补发京豆。
支持京东双账号
脚本兼容: Quantumult X, Surge, Loon, JSBox, Node.js
// Quantumult X
[task_local]
#宠汪汪积分兑换奖品
0 0-16/8 * * * https://raw.githubusercontent.com/lxk0301/scripts/master/jd_joy_reward.js, tag=宠汪汪积分兑换奖品, enabled=true
// Loon
[Script]
cron "0 0-16/8 * * *" script-path=https://raw.githubusercontent.com/lxk0301/scripts/master/jd_joy_reward.js,tag=宠汪汪积分兑换奖品
// Surge
宠汪汪积分兑换奖品 = type=cron,cronexp=0 0-16/8 * * *,wake-system=1,timeout=20,script-path=https://raw.githubusercontent.com/lxk0301/scripts/master/jd_joy_reward.js
 */
const $ = new Env('宠汪汪积分兑换奖品');
const joyRewardName = $.getdata('joyRewardName') || '1';//是否兑换京豆，默认开启兑换功能，其中'1'为兑换，'0'为不兑换京豆
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const notify = $.isNode() ? require('./sendNotify') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
} else {
  cookiesArr.push($.getdata('CookieJD'));
  cookiesArr.push($.getdata('CookieJD2'));
}
let UserName = '';
const JD_API_HOST = 'https://jdjoy.jd.com';
!(async () => {
  if (!cookiesArr[0]) {
    $.msg('【京东账号一】宠汪汪积分兑换奖品失败', '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      console.log(`\n开始【京东账号${$.index}】${UserName}\n`);
      message = '';
      subTitle = '';
      await joyReward();
      // $.msg($.name, '兑换脚本暂不能使用', `请停止使用，等待后期更新\n如果新版本兑换您有兑换机会，请抓包兑换\n再把抓包数据发送telegram用户@lxk0301`);
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })

async function joyReward() {
  const getExchangeRewardsRes = await getExchangeRewards();
  if (getExchangeRewardsRes.success) {
    // console.log('success', getExchangeRewardsRes);
    const data = getExchangeRewardsRes.data;
    const levelSaleInfos = data.levelSaleInfos;
    const giftSaleInfos = levelSaleInfos.giftSaleInfos;
    console.log(`当前积分 ${data.coin}\n`);
    console.log(`宠物等级 ${data.level}\n`);
    console.log(`京东昵称 ${UserName}\n`);
    let saleInfoId = '', giftName= '', extInfo = '', leftStock = 0, salePrice = 0;
    for (let item of giftSaleInfos) {
      if (item.giftType === 'jd_bean') {
        saleInfoId = item.id;
        leftStock = item.leftStock;
        salePrice = item.salePrice;
        giftName = item.giftName;
      }
    }
    // 兼容之前BoxJs兑换设置的数据
    if (joyRewardName && (joyRewardName === '-1' || joyRewardName === '1' || joyRewardName === '20' || joyRewardName === '50' || joyRewardName === '100' || joyRewardName === '500' || joyRewardName === '1000')) {
      if (leftStock) {
        if (!saleInfoId) return
        //开始兑换
        if (data.coin >= salePrice) {
          const exchangeRes = await exchange(saleInfoId, 'pet');
          if (exchangeRes.success) {
            if (exchangeRes.errorCode === 'buy_success') {
              console.log(`兑换${giftName}成功,【宠物等级】${data.level}\n【消耗积分】${salePrice}个\n【剩余积分】${data.coin - salePrice}个\n`)
              $.msg($.name, `兑换${giftName}成功`, `【京东账号${$.index}】${UserName}\n【宠物等级】${data.level}\n【消耗积分】${salePrice}分\n【当前剩余】${data.coin - salePrice}积分\n`);
              if ($.isNode() && notify.SCKEY) {
                await notify.sendNotify(`${$.name}`, `【京东账号${$.index}】 ${UserName}\n\n【兑换${giftName}】成功\n\n【宠物等级】${data.level}\n\n【消耗积分】${salePrice}分\n\n【当前剩余】${data.coin - salePrice}积分\n\n`);
              }
            } else if (exchangeRes.errorCode === 'buy_limit') {
              console.log('兑换失败，原因：兑换京豆已达上限，请把机会留给更多的小伙伴~')
              //$.msg($.name, `兑换${giftName}失败`, `【京东账号${$.index}】${UserName}\n兑换京豆已达上限\n请把机会留给更多的小伙伴~\n`)
            }
          }
        } else {
          console.log(`兑换失败，原因：您目前只有${data.coin}积分，已不足兑换${giftName}所需的${salePrice}积分`)
          //$.msg($.name, `兑换${giftName}失败`, `【京东账号${$.index}】${UserName}\n目前只有${data.coin}积分\n已不足兑换${giftName}所需的${salePrice}积分\n`)
        }
      } else {
        console.log('兑换失败，原因：京豆库存不足，已抢完，请下一场再兑换')
      }
    } else {
      console.log('您设置了不兑换京豆,如需兑换京豆，请去BoxJs重新设置或修改第20行代码')
    }
  } else if (!getExchangeRewardsRes.success && getExchangeRewardsRes.errorCode === 'B0001') {
    $.msg($.name, `【提示】京东账号${$.index}${UserName}cookie已失效,请重新登录获取`, '请点击此处去获取Cookie\n https://bean.m.jd.com/ \n', {"open-url": "https://bean.m.jd.com/"});
    if ($.index === 1) {
      $.setdata('', 'CookieJD');//cookie失效，故清空cookie。
    } else if ($.index === 2){
      $.setdata('', 'CookieJD2');//cookie失效，故清空cookie。
    }
    if ($.isNode() && notify.SCKEY) {
      await notify.sendNotify(`${$.name}cookie已失效`, `京东账号${$.index} ${UserName}\n\n请重新登录获取cookie`);
    }
    // $.done();
  }
}
function getExchangeRewards() {
  return new Promise((resolve) => {
    const option = {
      url: `${JD_API_HOST}/gift/getHomeInfo`,
      headers: {
        "Host": "jdjoy.jd.com",
        "Content-Type": "application/json",
        "Cookie": cookie,
        "reqSource": "h5",
        "Connection": "keep-alive",
        "Accept": "*/*",
        "User-Agent": "jdapp;iPhone;9.0.4;13.5.1;e35caf0a69be42084e3c97eef56c3af7b0262d01;network/4g;ADID/3B3AD5BC-B5E6-4A08-B32A-030CD805B5DD;supportApplePay/3;hasUPPay/0;pushNoticeIsOpen/1;model/iPhone11,8;addressid/2005183373;hasOCPay/0;appBuild/167283;supportBestPay/0;jdSupportDarkMode/1;pv/169.3;apprpd/MyJD_Main;ref/MyJdMTAManager;psq/2;ads/;psn/e35caf0a69be42084e3c97eef56c3af7b0262d01|638;jdv/0|iosapp|t_335139774|appshare|CopyURL|1596547194976|1596547198;adk/;app_device/IOS;pap/JA2015_311210|9.0.4|IOS 13.5.1;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        "Referer": "https://jdjoy.jd.com/pet/index",
        "Accept-Language": "zh-cn",
        "Accept-Encoding": "gzip, deflate, br"
      },
    }
    $.get(option, (err, resp, data) => {
      try {
        // console.log('data', data)
        data = JSON.parse(data);
        // console.log('data', data)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    });
  })
}
function exchange(rewardId, orderSource) {
  return new Promise((resolve) => {
    const option = {
      url: `${JD_API_HOST}/gift/exchange`,
      body: `${JSON.stringify({'saleInfoId':rewardId, 'orderSource': orderSource})}`,
      headers: {
        "Host": "jdjoy.jd.com",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Content-Type": "application/json",
        "Origin": "https://jdjoy.jd.com",
        "reqSource": "h5",
        "Connection": "keep-alive",
        "User-Agent": "jdapp;iPhone;9.0.4;13.5.1;e35caf0a69be42084e3c97eef56c3af7b0262d01;network/4g;ADID/3B3AD5BC-B5E6-4A08-B32A-030CD805B5DD;supportApplePay/3;hasUPPay/0;pushNoticeIsOpen/1;model/iPhone11,8;addressid/2005183373;hasOCPay/0;appBuild/167283;supportBestPay/0;jdSupportDarkMode/1;pv/169.3;apprpd/MyJD_Main;ref/MyJdMTAManager;psq/2;ads/;psn/e35caf0a69be42084e3c97eef56c3af7b0262d01|638;jdv/0|iosapp|t_335139774|appshare|CopyURL|1596547194976|1596547198;adk/;app_device/IOS;pap/JA2015_311210|9.0.4|IOS 13.5.1;Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1",
        "Referer": "https://jdjoy.jd.com/pet/index",
        "Content-Length": "10",
        "Cookie": cookie
      },
    }
    $.post(option, (err, resp, data) => {
      try {
        // console.log('exchange', data)
        data = JSON.parse(data);
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    });
  })
}
// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{$.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};$.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;$.isMute||(this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o))),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}