"""
@author: GideonSenku, modified by pysta
@file: SurgeToJs.py
@createTime: 2020-05-01

本脚本用作曲线双阅读,结合APP:py3使用
1、登陆要阅读的账号一、二、三.....,理论无限
2、Surge抓包记录找到https://apiwz.midukanshu.com/user/readTimeBase/readTime选择该记录导出,使用pythonista3运行miduRead.py
3、在Surge->脚本->新增, 脚本名:自定义不要重复就好, 脚本类型选择Cron, cron表达式: */1 * * * *  脚本位置->本地
4、编辑脚本:贴贴py3的结果
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

const cookieName = '米读阅读时长'
const signinfo = {}
const senku = init()
// 开启debug模式,每次脚本执行会显示通知,默认false
const debug = false


debug ? senku.setdata('true', 'debug') : senku.setdata('false', 'debug')
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
    await readTime()
    showmsg()
    senku.done()
})().catch((e) => senku.log(`❌ ${cookieName} 签到失败: ${e}`), senku.done())


// 阅读时长
function readTime() {
    return new Promise((resolve, reject) => {
        senku.post(request, (error, response, data) => {
            try {
                senku.log(`❕ ${cookieName} readTime - response: ${JSON.stringify(response)}`)
                signinfo.readTime = JSON.parse(data)
                resolve()
            } catch (e) {
                senku.msg(cookieName, `阅读时长: 失败`, `说明: ${e}`)
                senku.log(`❌ ${cookieName} readTime - 签到失败: ${e}`)
                senku.log(`❌ ${cookieName} readTime - response: ${JSON.stringify(response)}`)
                resolve()
            }
        })
    })
}

function showmsg() {
    let subTitle = ''
    let detail = ''
    if (signinfo.readTime && signinfo.readTime.code == 0) {
        const coin = signinfo.readTime.data.coin
        const readTotalMinute = signinfo.readTime.data.readTotalMinute
        const total_coin = signinfo.readTime.data.total_coin
        coin == 0 ? detail += `` : detail += `【阅读时长】获得${coin}💰`
        readTotalMinute ? detail += ` 阅读时长${readTotalMinute / 2}分钟,该账户:${total_coin}💰` : detail += `该账户:${total_coin}💰`
    } else if (signinfo.readTime.code != 0) {
        detail += `【阅读时长】错误代码${signinfo.readTime.code},错误信息${signinfo.readTime.message}`
        senku.msg(cookieName, subTitle, detail)
    } else {
        detail += '【阅读时长】失败'
        senku.msg(cookieName, subTitle, detail)
    }

    if (senku.getdata('debug') == 'true' || detail && signinfo.readTime.data.readTotalMinute % 60 == 0) {
        senku.msg(cookieName, subTitle, detail)
    } else if (senku.getdata('debug') == 'true' || signinfo.readTime.data.readTotalMinute % 60 == 0) {
        senku.msg(cookieName, '阅读结果', '时间未到')
    }
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
