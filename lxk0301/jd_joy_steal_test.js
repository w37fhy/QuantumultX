/*
jd宠汪汪偷好友积分与狗粮,及给好友喂食
IOS用户支持京东双账号,NodeJs用户支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
更新时间:2020-08-25
建议凌晨0-1点左右运行，可偷好友狗粮与积分
注：如果使用Node.js, 需自行安装'crypto-js,got,http-server,tough-cookie'模块. 例: npm install crypto-js http-server tough-cookie got --save
*/
// quantumultx
// [task_local]
// #宠汪汪偷好友积分与狗粮
// 0 1,6 * * * https://raw.githubusercontent.com/lxk0301/scripts/master/jd_joy_steal.js, tag=京东宠汪汪, img-url=https://raw.githubusercontent.com/znz1992/Gallery/master/jdww.png, enabled=true
// Loon
// [Script]
// cron "0 1,6 * * *" script-path=https://raw.githubusercontent.com/lxk0301/scripts/master/jd_joy_steal.js,tag=宠汪汪偷好友积分与狗粮
// Surge
// 宠汪汪偷好友积分与狗粮 = type=cron,cronexp=0 1,6 * * *,wake-system=1,timeout=20,script-path=https://raw.githubusercontent.com/lxk0301/scripts/master/jd_joy_steal.js
const $ = new Env('宠汪汪偷好友积分与狗粮');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

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
let message = '', subTitle = '', UserName = '';

const jdNotify = $.getdata('jdJoyNotify');//是否关闭通知，false打开，true通知
let jdJoyHelpFeed = 'true'//是否给好友喂食，'false'为不给喂食，'true'为给好友喂食，默认是给
const weAppUrl = 'https://draw.jdfcloud.com//pet';
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      console.log(`\n开始【京东账号${$.index}】${UserName}\n`);
      message = '';
      subTitle = '';
      await jdJoySteal();
    }
  }
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })
async function jdJoySteal() {
  await getFriends();
  if ($.getFriendsData.success) {
    message += `【京东账号${$.index}】${UserName}\n`;
    await getCoinChanges();
    if ($.getFriendsData.datas && $.getFriendsData.datas.length  > 0) {
      const { lastPage } = $.getFriendsData.page;
      console.log('lastPage', lastPage)
      $.allFriends = [];
      for (let i = 1; i <= new Array(lastPage).fill('').length; i++) {
        console.log(`开始查询第${i}页好友\n`);
        await getFriends(i);
        $.allFriends = $.allFriends.concat($.getFriendsData.datas);
      }
      for (let index = 0; index < $.allFriends.length; index ++) {
        //剔除自己
        if (!$.allFriends[index].stealStatus) {
          $.allFriends.splice(index, 1);
        }
      }
      console.log(`共${$.allFriends.length}个好友`);
      $.helpFood = 0;
      $.stealFriendCoin = 0;
      $.stealFood = 0;
      for (let friends of $.allFriends) {
        const { friendPin, status, stealStatus } = friends;
        console.log(`${friendPin}--偷食状态：${stealStatus}`);
        console.log(`${friendPin}--喂食状态：${status}`);
        if ($.visit_friend !== 100) {
          await stealFriendCoin(friendPin);//领好友积分
        } else {
          $.stealFriendCoin = `已达上限(100积分)`
        }
        if (stealStatus === 'can_steal') {
          //可偷狗粮
          //偷好友狗粮
          await doubleRandomFood(friendPin);
          const getRandomFoodRes = await getRandomFood(friendPin);
          if (getRandomFoodRes.success && getRandomFoodRes.errorCode === 'steal_ok') {
            $.stealFood += getRandomFoodRes.data;
          }
        } else if (stealStatus === 'chance_full') {
          $.stealFood = '已达上限';
        } else if (stealStatus === 'cannot_steal') {
          $.stealFood = '未到可偷时间，请稍后再试';
        }
        if ($.help_feed !== 200) {
          //可给好友喂食
          jdJoyHelpFeed = $.getdata('jdJoyHelpFeed') ? $.getdata('jdJoyHelpFeed') : jdJoyHelpFeed
          if (jdJoyHelpFeed && jdJoyHelpFeed === 'true') {
            if (status === 'not_feed') {
              const helpFeedRes = await helpFeed(friendPin);
              if (helpFeedRes.errorCode === 'help_ok' && helpFeedRes.success) {
                $.helpFood += 10;
              } else if (helpFeedRes.errorCode === 'chance_full') {
                console.log('喂食已达上限,不再喂食')
                //break
              } else if (helpFeedRes.errorCode === 'food_insufficient') {
                console.log('帮好友喂食失败，您的狗粮不足10g')
                //break
              }
            } else if (status === 'time_error') {
              console.log(`好友 ${friendPin} 的汪汪正在食用`)
            }
          }
        } else {
          $.helpFood = '已达上限(20个好友)'
        }
      }
      await showMsg();
    }
  } else {
    if ($.getFriendsData.errorCode === 'B0001') {
      $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${UserName}\n请重新登录获取\nhttps://bean.m.jd.com/`, {"open-url": "https://bean.m.jd.com/"});
      if ($.index === 1) {
        $.setdata('', 'CookieJD');//cookie失效，故清空cookie。
      } else if ($.index === 2){
        $.setdata('', 'CookieJD2');//cookie失效，故清空cookie。
      }
      if ($.isNode() && notify.SCKEY) {
        await notify.sendNotify(`${$.name}cookie已失效`, `京东账号${$.index} ${UserName}\n\n请重新登录获取cookie`);
      }
    } else {
      message += `${$.getFriendsData.errorMessage}\n`;
    }
  }
}

function getFriends(currentPage = '1') {
  return new Promise(resolve => {
    const options = {
      url: `${weAppUrl}/getFriends?itemsPerPage=20&currentPage=${currentPage}`,
      headers: {
        'Cookie': cookie,
        'reqSource': 'weapp',
        'Host': 'draw.jdfcloud.com',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Referer': 'https://jdjoy.jd.com/pet/index',
        'User-Agent': 'jdapp;iPhone;8.5.8;13.4.1;9b812b59e055cd226fd60ebb5fd0981c4d0d235d;network/wifi;supportApplePay/3;hasUPPay/0;pushNoticeIsOpen/0;model/iPhone9,2;addressid/138109592;hasOCPay/0;appBuild/167169;supportBestPay/0;jdSupportDarkMode/0;pv/200.75;apprpd/MyJD_Main;ref/MyJdMTAManager;psq/29;ads/;psn/9b812b59e055cd226fd60ebb5fd0981c4d0d235d|608;jdv/0|direct|-|none|-|1587263154256|1587263330;adk/;app_device/IOS;pap/JA2015_311210|8.5.8|IOS 13.4.1;Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // console.log('JSON.parse(data)', JSON.parse(data))
          $.getFriendsData = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

async function stealFriendCoin(friendPin) {
  // console.log(`进入好友 ${friendPin}的房间`)
  const enterFriendRoomRes = await enterFriendRoom(friendPin);
  const { friendHomeCoin, stealFood, helpFeedStatus } = enterFriendRoomRes.data;
  if (friendHomeCoin > 0) {
    //领取好友积分
    console.log(`好友 ${friendPin}的房间可领取积分${friendHomeCoin}个\n`)
    const getFriendCoinRes = await getFriendCoin(friendPin);
    //TODO
    console.log(`偷好友积分结果：${JSON.stringify(getFriendCoinRes)}\n`)
    if (getFriendCoinRes.errorCode === 'coin_took_ok') {
      $.stealFriendCoin += getFriendCoinRes.data;
    }
  } else {
    console.log(`好友 ${friendPin}的房间暂无可领取积分`)
  }
}
//进入好友房间
function enterFriendRoom(friendPin) {
  return new Promise(resolve => {
    $.get(taskUrl('enterFriendRoom', (friendPin)), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // console.log('进入好友房间', JSON.parse(data))
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//收集好友金币
function getFriendCoin(friendPin) {
  return new Promise(resolve => {
    $.get(taskUrl('getFriendCoin', friendPin), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          console.log('收集好友金币', JSON.parse(data))
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//帮好友喂食
function helpFeed(friendPin) {
  return new Promise(resolve => {
    $.get(taskUrl('helpFeed', friendPin), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          console.log(`帮忙喂食${data}`)
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//收集好友狗粮,已实现分享可得双倍狗粮功能
//①分享
function doubleRandomFood(friendPin) {
  return new Promise(resolve => {
    $.get(taskUrl('doubleRandomFood', friendPin), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          console.log('分享', JSON.parse(data))
          // $.appGetPetTaskConfigRes = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
//②领取双倍狗粮
function getRandomFood(friendPin) {
  return new Promise(resolve => {
    $.get(taskUrl('getRandomFood', friendPin), (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          console.log('领取双倍狗粮', JSON.parse(data))
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function getCoinChanges() {
  return new Promise(resolve => {
    const options = {
      url: `${weAppUrl}/getCoinChanges?changeDate=${Date.now()}`,
      headers: {
        'Cookie': cookie,
        'reqSource': 'weapp',
        'Host': 'draw.jdfcloud.com',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Referer': 'https://jdjoy.jd.com/pet/index',
        'User-Agent': 'jdapp;iPhone;8.5.8;13.4.1;9b812b59e055cd226fd60ebb5fd0981c4d0d235d;network/wifi;supportApplePay/3;hasUPPay/0;pushNoticeIsOpen/0;model/iPhone9,2;addressid/138109592;hasOCPay/0;appBuild/167169;supportBestPay/0;jdSupportDarkMode/0;pv/200.75;apprpd/MyJD_Main;ref/MyJdMTAManager;psq/29;ads/;psn/9b812b59e055cd226fd60ebb5fd0981c4d0d235d|608;jdv/0|direct|-|none|-|1587263154256|1587263330;adk/;app_device/IOS;pap/JA2015_311210|8.5.8|IOS 13.4.1;Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
        'Accept-Language': 'zh-cn',
        'Accept-Encoding': 'gzip, deflate, br',
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          console.log('\n京东宠汪汪: API查询请求失败 ‼️‼️')
        } else {
          // console.log('getCoinChanges', JSON.parse(data))
          data = JSON.parse(data);
          if (data.datas && data.datas.length > 0) {
            $.help_feed = 0;
            $.visit_friend = 0;
            for (let item of data.datas) {
              if ($.time('yyyy-MM-dd') === timeFormat(item.createdDate) && item.changeEvent === 'help_feed'){
                $.help_feed = item.changeCoin;
              }
              if ($.time('yyyy-MM-dd') === timeFormat(item.createdDate) && item.changeEvent === 'visit_friend') {
                $.visit_friend = item.changeCoin;
              }
            }
            console.log('$.help_feed', $.help_feed);
            console.log('$.visit_friend', $.visit_friend);
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}
function showMsg() {
  if (!jdNotify || jdNotify === 'false') {
    $.stealFood = $.stealFood > 0 ? `【偷好友狗粮】获取${$.stealFood}g狗粮\n` : `【偷好友狗粮】${$.stealFood}\n`;
    $.stealFriendCoin = $.stealFriendCoin > 0 ? `【领取好友积分】获取${$.stealFriendCoin}个\n` : `【领取好友积分】${$.stealFriendCoin}\n`;
    $.helpFood = $.helpFood > 0 ? `【给好友喂食】消耗${$.helpFood}g狗粮,获取积分${$.helpFood}\n` : `【给好友喂食】${$.helpFood}\n`;
    message += $.stealFriendCoin;
    message += $.stealFood;
    message += $.helpFood;
    $.msg($.name, '', message);
  }
}

function taskUrl(functionId, friendPin) {
  return {
    url: `${weAppUrl}/${functionId}?friendPin=${encodeURI(friendPin)}`,
    headers: {
      'Cookie': cookie,
      'reqSource': 'weapp',
      'Host': 'draw.jdfcloud.com',
      'Connection': 'keep-alive',
      'Content-Type': 'application/json',
      'Referer': 'https://jdjoy.jd.com/pet/index',
      'User-Agent': 'jdapp;iPhone;8.5.8;13.4.1;9b812b59e055cd226fd60ebb5fd0981c4d0d235d;network/wifi;supportApplePay/3;hasUPPay/0;pushNoticeIsOpen/0;model/iPhone9,2;addressid/138109592;hasOCPay/0;appBuild/167169;supportBestPay/0;jdSupportDarkMode/0;pv/200.75;apprpd/MyJD_Main;ref/MyJdMTAManager;psq/29;ads/;psn/9b812b59e055cd226fd60ebb5fd0981c4d0d235d|608;jdv/0|direct|-|none|-|1587263154256|1587263330;adk/;app_device/IOS;pap/JA2015_311210|8.5.8|IOS 13.4.1;Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
      'Accept-Language': 'zh-cn',
      'Accept-Encoding': 'gzip, deflate, br',
    }
  }
}
function timeFormat(time) {
  let date;
  if (time) {
    date = new Date(time)
  } else {
    date = new Date();
  }
  return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}
// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{$.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};$.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;$.isMute||(this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o))),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}