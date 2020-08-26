// 赞赏:邀请码`A1040276307`
// 链接`http://html34.qukantoutiao.net/qpr2/bBmQ.html?pid=5eb14518`
// 农妇山泉 -> 有点咸

/********************
 * 1、 为了方便任意脚本可以清除Cookie, 任意一个脚本将DeleteCookie = true且选择要清除的账号都可以生效
 * 2、 debug模式可以在Surge&&Qx中开启,方便你判定多用户及脚本运行情况
 * 3、 Qx==>dubug:miduRede构造请求
 * 4、 Surge==>debug:load脚本->evalaute
 * 5、脚本默认每半小时通知一次,建议自己先debug看看是否成功
 *********************/

// 是否开启清除Cookie
const DeleteCookie = false // 清除所有Cookie,将下方改为true,默认false

// 选取清除操作
const DeleteCookieAll = false // 清除所有
const DeleteCookieOne = false // 清除账户一
const DeleteCookieTwo = false // 清除账户二

const bind = true // 绑定作者邀请码,默认true,可更改为false

const cookieName = '米读'
const senku = init()

if (DeleteCookie) {
    const one = senku.getdata('tokenMidu_read')
    const two = senku.getdata('tokenMidu_sign')
    const three = senku.getdata('tokenMidu_read2')
    const four = senku.getdata('tokenMidu_sign2')
    if (DeleteCookieAll) {
        if (one || two || three || four) {
            senku.setdata("", 'senku_signbody_midu')
            senku.setdata("", 'senku_signbody_midu2')
            senku.setdata("", 'senku_readTimebody_midu')
            senku.setdata("", 'senku_readTimebody_midu2')
            senku.setdata("", 'senku_readTimeheader_midu')
            senku.setdata("", 'senku_readTimeheader_midu2')
            senku.setdata("", "tokenMidu_read")
            senku.setdata("", "tokenMidu_read2")
            senku.setdata("", "tokenMidu_sign")
            senku.setdata("", "tokenMidu_sign2")
            senku.msg("米读 Cookie清除成功 !", "", '请手动关闭脚本内"DeleteCookie"选项')
        } else {
            senku.msg("米读 无可清除的Cookie !", "", '请手动关闭脚本内"DeleteCookie"选项')
        }
    } else if (DeleteCookieOne) {
        if (one || two) {
            senku.setdata("", 'senku_signbody_midu')
            senku.setdata("", 'senku_readTimebody_midu')
            senku.setdata("", 'senku_readTimeheader_midu')
            senku.setdata("", "tokenMidu_read")
            senku.setdata("", "tokenMidu_sign")
            senku.msg("米读 Cookie清除成功 !", "清除账户一选项", '请手动关闭脚本内"DeleteCookie"选项')
        } else {
            senku.msg("米读 无可清除的Cookie !", "清除账户一选项", '请手动关闭脚本内"DeleteCookie"选项')
        }
    } else if (DeleteCookieTwo) {
        if (three || four) {
            senku.setdata("", 'senku_signbody_midu2')
            senku.setdata("", 'senku_readTimebody_midu2')
            senku.setdata("", 'senku_readTimeheader_midu2')
            senku.setdata("", "tokenMidu_read2")
            senku.setdata("", "tokenMidu_sign2")
            senku.msg("米读 Cookie清除成功 !", "清除账户二选项", '请手动关闭脚本内"DeleteCookie"选项')
        } else {
            senku.msg("米读 无可清除的Cookie !", "清除账户二选项", '请手动关闭脚本内"DeleteCookie"选项')
        }
    } else {
        senku.msg("米读 清除Cookie !", "未选取任何选项", '请手动关闭脚本内"DeleteCookie"选项')
    }
}

function initial() {
    signinfo = {
        addnumList: [],
        rollList: [],
        doubleList: []
    }
}

bind ? '' : senku.setdata('', 'bind')


;
(sign = () => {
    senku.log(`🔔 ${cookieName}`)
    senku.getdata('tokenMidu_sign') ? '' : senku.msg('米读签到', '', '不存在Cookie')
    DualAccount = true
    if (senku.getdata('tokenMidu_sign')) {
        tokenVal = senku.getdata('tokenMidu_read')
        readTimeheaderVal = senku.getdata('senku_readTimeheader_midu')
        readTimebodyVal = senku.getdata('senku_readTimebody_midu')
        signbodyVal = senku.getdata('senku_signbody_midu')
        all()
    }
})()

async function all() {
    try {
        senku.log(`🍎${signbodyVal}`)
        const headerVal = readTimeheaderVal
        const urlVal = readTimebodyVal
        const key = signbodyVal
        const token = tokenVal
        initial()
        await userInfo(key)
        await signDay(key)
        await signVideo(key)
        await dice_index(key)
        if (signinfo.dice_index && signinfo.dice_index.code == 0) {
            const remain_add_num = signinfo.dice_index.data.remain_add_chance_num

            for (let index = 0; index < remain_add_num; index++) {
                await dice_addnum(key)
            }
            await dice_index(key)
            const chance_num = signinfo.dice_index.data.chance_num
            for (let index = 0; index < chance_num; index++) {
                await dice_roll(key)
                await dice_double(key)
            }
        }

        if (senku.getdata('bind')) {
            await Bind()
        }
        await showmsg()
        senku.done()
    } catch (e) {
        senku.msg(cookieName, `失败`, `说明: ${e}`)
        senku.log(`❌ ${cookieName}  - 失败: ${e}`)
        senku.done()
    }
}

function double() {
    initial()
    DualAccount = false
    if (senku.getdata('tokenMidu_sign2')) {
        tokenVal = senku.getdata('tokenMidu_read2')
        readTimeheaderVal = senku.getdata('senku_readTimeheader_midu2')
        readTimebodyVal = senku.getdata('senku_readTimebody_midu2')
        signbodyVal = senku.getdata('senku_signbody_midu2')
        all()
    }
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

// 用户信息
function userInfo(bodyVal) {
    return new Promise((resolve, reject) => {
        const userInfourlVal = 'https://apiwz.midukanshu.com/wz/user/getInfo?' + bodyVal
        const url = {
            url: userInfourlVal,
            headers: {}
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


// 骰子信息
function dice_index(bodyVal) {
    return new Promise((resolve, reject) => {
        const dice_index_urlVal = 'https://apiwz.midukanshu.com/wz/dice/index?' + bodyVal
        const url = {
            url: dice_index_urlVal,
            headers: {}
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
function dice_roll(bodyVal) {
    return new Promise((resolve, reject) => {
        const dice_roll_urlVal = 'https://apiwz.midukanshu.com/wz/dice/roll?' + bodyVal
        const url = {
            url: dice_roll_urlVal,
            headers: {}
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
function dice_double(bodyVal) {
    return new Promise((resolve, reject) => {
        const dice_double_urlVal = 'https://apiwz.midukanshu.com/wz/dice/doubleReward?' + bodyVal
        const url = {
            url: dice_double_urlVal,
            headers: {}
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
function dice_addnum(bodyVal) {
    return new Promise((resolve, reject) => {
        const dice_addnum_urlVal = 'https://apiwz.midukanshu.com/wz/dice/addChangeNumByRewardVideo?' + bodyVal
        const url = {
            url: dice_addnum_urlVal,
            headers: {}
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
function signDay(bodyVal) {
    return new Promise((resolve, reject) => {
        const signurlVal = 'https://apiwz.midukanshu.com/wz/task/signInV2?' + bodyVal
        const url = {
            url: signurlVal,
            headers: {}
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
function signVideo(bodyVal) {
    return new Promise((resolve, reject) => {
        const signVideourlVal = 'https://apiwz.midukanshu.com/wz/task/signVideoReward?' + bodyVal
        const url = {
            url: signVideourlVal,
            headers: {}
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
    return new Promise((resolve, reject) => {
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
        if (DualAccount) double()
        resolve()
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