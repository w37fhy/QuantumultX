"""
@author: GideonSenku, modified by pysta
@file: SurgeToJs.py
@createTime: 2020-05-01

本脚本用作曲线双阅读,结合APP:py3使用
1、登陆要阅读的账号一、二、三.....,理论无限
2、Surge抓包记录找到https://apiwz.midukanshu.com/wz/dice/index,选择该记录导出,使用pythonista3运行miduSign.py
3、在Surge->脚本->新增, 脚本名:自定义不要重复就好, 脚本类型选择Cron, cron表达式: */1 * * * *  脚本位置->本地
54、编辑脚本:贴贴py3的结果
"""

import zipfile
import json
import appex
import clipboard
import console


def get_request_data(path):

    with zipfile.ZipFile(path, 'r') as z:
        with z.open('model.json') as f:
            data = json.load(f)
        if 'request.dump' in z.namelist():
            with z.open('request.dump') as f:
                body = str(f.read(), encoding='utf-8')
                data['requestBody'] = body
    return data


path = appex.get_file_path()
data = get_request_data(path)

body = data.get('requestBody', '')
url = data['URL']
method = data['method'].lower()
headers = {k: v for k, v in [
    i.split(': ', 1) for i in data['requestHeader'].split('\r\n')[1:] if i]}

js = """
// 赞赏:邀请码`A1040276307`
// 链接`http://html34.qukantoutiao.net/qpr2/bBmQ.html?pid=5eb14518`
// 农妇山泉 -> 有点咸

const cookieName = '米读'

const senku = init()


const signinfo = {
    addnumList: [],
    rollList: [],
    doubleList: []
}
"""
js = js + f'''
const urlVal = {json.dumps(url)}
const bodyVal = {json.dumps(body)}
const headerVal = {json.dumps(headers, indent=4)}
const request = {{
    url: urlVal,
    headers: headerVal,
    body: bodyVal
}}

'''
js = js + """

;
(sign = async () => {
    senku.log(`🔔 ${cookieName}`)
    await userInfo()
    await signDay()
    await signVideo()
    await dice_index()
    if (signinfo.dice_index && signinfo.dice_index.code == 0) {
        const remain_add_num = signinfo.dice_index.data.remain_add_chance_num

        for (let index = 0; index < remain_add_num; index++) {
            await dice_addnum()
        }
        await dice_index()
        const chance_num = signinfo.dice_index.data.chance_num
        for (let index = 0; index < chance_num; index++) {
            await dice_roll()
            await dice_double()
        }
    }
    await userInfo()
    await prizeInfo()
    if (signinfo.prizeInfo.data.total_num) {
        await prizeTask()
        await drawPrize()
    }
    await Bind()
    showmsg()
    senku.done()
})().catch((e) => senku.log(`❌ ${cookieName} 签到失败: ${e}`), senku.done())


// 用户信息
function userInfo() {
    return new Promise((resolve, reject) => {
        const userInfourlVal = 'https://apiwz.midukanshu.com/wz/user/getInfo?' + bodyVal
        const url = {
            url: userInfourlVal,
            headers: headerVal
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`🐍🐢 ${cookieName} userInfo - response: ${JSON.stringify(response)}`)
                signinfo.userInfo = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `获取用户信息: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} userInfo - 获取用户信息失败: ${e}`)
                senku.log(`❌ ${cookieName} userInfo - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}
// 绑定
function Bind() {
    return new Promise((resolve, reject) => {
        const BindurlVal = 'http://fisson.1sapp.com/nlx/shareLink/tmpBind'
        const url = {
            url: BindurlVal,
            headers: {},
            body: 'app_id=7&act_type=1&act_name=grad_pupil&invite_code=A1040276307&telephone=' + signinfo.userInfo.data.mobile
        }
        url.headers['Host'] = 'fisson.1sapp.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            senku.setdata('', 'bind')
            resolve()
        })
    })
}
// 抽奖
function drawPrize() {
    return new Promise((resolve, reject) => {
        const drawPrizeurlVal = 'https://apiwz.midukanshu.com/wz/task/drawPrize?' + bodyVal
        const url = {
            url: drawPrizeurlVal,
            headers: {}
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`🐍🐢 ${cookieName} drawPrize - response: ${JSON.stringify(response)}`)
                signinfo.drawPrize = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `抽奖: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} drawPrize - 抽奖失败: ${e}`)
                senku.log(`❌ ${cookieName} drawPrize - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 观看视频获取抽奖机会
function prizeTask() {
    return new Promise((resolve, reject) => {
        const prizeTaskurlVal = 'https://apiwz.midukanshu.com/wz/task/prizeTask?' + bodyVal
        const url = {
            url: prizeTaskurlVal,
            headers: {}
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`🐍🐢 ${cookieName} prizeTask - response: ${JSON.stringify(response)}`)
                signinfo.prizeTask = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `观看视频抽奖: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} prizeTask - 观看视频抽奖失败: ${e}`)
                senku.log(`❌ ${cookieName} prizeTask - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 抽奖信息
function prizeInfo() {
    return new Promise((resolve, reject) => {
        const prizeInfourlVal = 'https://apiwz.midukanshu.com/wz/task/prizeList?' + bodyVal
        const url = {
            url: prizeInfourlVal,
            headers: {}
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`🐍🐢 ${cookieName} prizeInfo - response: ${JSON.stringify(response)}`)
                signinfo.prizeInfo = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `抽奖信息: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} prizeInfo - 抽奖信息失败: ${e}`)
                senku.log(`❌ ${cookieName} prizeInfo - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 骰子信息
function dice_index() {
    return new Promise((resolve, reject) => {
        const dice_index_urlVal = 'https://apiwz.midukanshu.com/wz/dice/index?' + bodyVal
        const url = {
            url: dice_index_urlVal,
            headers: headerVal
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`🐍🐢 ${cookieName} dice_index - response: ${JSON.stringify(response)}`)
                signinfo.dice_index = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `骰子信息: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} dice_index - 骰子信息失败: ${e}`)
                senku.log(`❌ ${cookieName} dice_index - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 掷骰子
function dice_roll() {
    return new Promise((resolve, reject) => {
        const dice_roll_urlVal = 'https://apiwz.midukanshu.com/wz/dice/roll?' + bodyVal
        const url = {
            url: dice_roll_urlVal,
            headers: headerVal
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`🐍🐢 ${cookieName} dice_roll - response: ${JSON.stringify(response)}`)
                if (JSON.parse(data).code == 0) {
                    signinfo.rollList.push(JSON.parse(data))
                }
                resolve()
            } catch (e) {
                senku.msg(cookieName, `掷骰子: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} dice_roll - 掷骰子失败: ${e}`)
                senku.log(`❌ ${cookieName} dice_roll - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 骰子双倍奖励
function dice_double() {
    return new Promise((resolve, reject) => {
        const dice_double_urlVal = 'https://apiwz.midukanshu.com/wz/dice/doubleReward?' + bodyVal
        const url = {
            url: dice_double_urlVal,
            headers: headerVal
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`🐍🐢 ${cookieName} dice_double - response: ${JSON.stringify(response)}`)
                if (JSON.parse(data).code == 0) {
                    signinfo.doubleList.push(JSON.parse(data))
                }
                resolve()
            } catch (e) {
                senku.msg(cookieName, `骰子双倍奖励: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} dice_double - 骰子双倍奖励失败: ${e}`)
                senku.log(`❌ ${cookieName} dice_double - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 获取骰子次数
function dice_addnum() {
    return new Promise((resolve, reject) => {
        const dice_addnum_urlVal = 'https://apiwz.midukanshu.com/wz/dice/addChangeNumByRewardVideo?' + bodyVal
        const url = {
            url: dice_addnum_urlVal,
            headers: headerVal
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 miduapp qapp'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`🐍🐢 ${cookieName} dice_addnum - response: ${JSON.stringify(response)}`)
                if (JSON.parse(data).code == 0) {
                    signinfo.addnumList.push(JSON.parse(data))
                }
                resolve()
            } catch (e) {
                senku.msg(cookieName, `获取骰子次数: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} dice_addnum - 获取骰子次数失败: ${e}`)
                senku.log(`❌ ${cookieName} dice_addnum - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 每日签到
function signDay() {
    return new Promise((resolve, reject) => {
        const signurlVal = 'https://apiwz.midukanshu.com/wz/task/signInV2?' + bodyVal
        const url = {
            url: signurlVal,
            headers: headerVal
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`🐍🐢 ${cookieName} signDay - response: ${JSON.stringify(response)}`)
                signinfo.signDay = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `签到结果: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} signDay - 签到失败: ${e}`)
                senku.log(`❌ ${cookieName} signDay - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

// 签到视频奖励
function signVideo() {
    return new Promise((resolve, reject) => {
        const signVideourlVal = 'https://apiwz.midukanshu.com/wz/task/signVideoReward?' + bodyVal
        const url = {
            url: signVideourlVal,
            headers: headerVal
        }
        url.headers['Host'] = 'apiwz.midukanshu.com'
        url.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        url.headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        senku.post(url, (error, response, data) => {
            try {
                senku.log(`🐍🐢 ${cookieName} signVideo - response: ${JSON.stringify(response)}`)
                signinfo.signVideo = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `签到视频: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} signVideo - 签到视频失败: ${e}`)
                senku.log(`❌ ${cookieName} signVideo - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}


function showmsg() {
    let subTitle = ''
    let detail = ''
    const name = signinfo.userInfo.data.nickname ? signinfo.userInfo.data.nickname : `未设置昵称`
    // 签到信息
    if (signinfo.signDay && signinfo.signDay.code == 0) {
        if (signinfo.signDay.data) {
            const amount = signinfo.signDay.data.amount
            amount ? detail += `【签到奖励】获得${amount}💰\n` : detail += `【签到奖励】已获取过奖励\n`
        }
    } else subTitle += '签到:失败'

    if (signinfo.signVideo && signinfo.signVideo.code == 0) {
        const amount = signinfo.signVideo.data.amount
        amount ? detail += `【签到视频】获得${amount}💰\n` : detail += `【签到视频】已获取过奖励\n`
    } else subTitle += '签到视频:失败'

    // 骰子信息
    // 次数
    if (signinfo.addnumList.length > 0) {
        detail += `【骰子次数】增加${signinfo.addnumList.length}次\n`
    } else {
        detail += `【骰子次数】无次数增加\n`
    }
    // 掷骰子
    if (signinfo.rollList.length > 0) {
        let i = 0
        for (const roll of signinfo.rollList) {
            i += 1
            roll.code == 0 ? detail += `【骰子奖励】第${i}次${roll.data.roll_coin}💰\n` : detail += `【骰子奖励】已获取过奖励\n`
        }
    } else {
        detail += `【骰子奖励】无次数掷骰子\n`
    }
    senku.msg(cookieName + ` 用户:${name}`, subTitle, detail)
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
            $task.fetch(url).then((resp) => cb(null, resp, resp.body))
        }
    }
    post = (url, cb) => {
        if (isSurge()) {
            $httpClient.post(url, cb)
        }
        if (isQuanX()) {
            url.method = 'POST'
            $task.fetch(url).then((resp) => cb(null, resp, resp.body))
        }
    }
    done = (value = {}) => {
        $done(value)
    }
    return {
        isSurge,
        isQuanX,
        msg,
        log,
        getdata,
        setdata,
        get,
        post,
        done
    }
}
"""
print(js)
clipboard.set(js)
console.hud_alert('Copyed!')
