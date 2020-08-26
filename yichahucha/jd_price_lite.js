/*
README：https://github.com/yichahucha/surge/tree/master
 */

const path1 = "serverConfig";
const path2 = "wareBusiness";
const path3 = "basicConfig";
const consolelog = false;
const url = $request.url;
const body = $response.body;
const $tool = tool();

if (url.indexOf(path1) != -1) {
    let obj = JSON.parse(body);
    delete obj.serverConfig.httpdns;
    delete obj.serverConfig.dnsvip;
    delete obj.serverConfig.dnsvip_v6;
    $done({ body: JSON.stringify(obj) });
}

if (url.indexOf(path3) != -1) {
    let obj = JSON.parse(body);
    delete obj.data.JDHttpToolKit.httpdns;
    delete obj.data.JDHttpToolKit.dnsvipV6;
    $done({ body: JSON.stringify(obj) });
}

if (url.indexOf(path2) != -1) {
    $done({ body });
    let obj = JSON.parse(body);
    const floors = obj.floors;
    const commodity_info = floors[floors.length - 1];
    const shareUrl = commodity_info.data.property.shareUrl;
    request_history_price(shareUrl, function (data) {
        if (data) {
            if (data.ok == 1 && data.single) {
                const lower = lowerMsgs(data.single)
                const detail = priceSummary(data)
                const tip = data.PriceRemark.Tip + "（仅供参考）"
                $tool.notify("", "", `${lower} ${tip}\n${detail}\n\n👉查看详情：http://tool.manmanbuy.com/historyLowest.aspx?url=${encodeURI(shareUrl)}`)
            }
            if (data.ok == 0 && data.msg.length > 0) {
                $tool.notify("", "", `⚠️ ${data.msg}`)
            }
        }
    })
}

function lowerMsgs(data) {
    const lower = data.lowerPriceyh
    const lowerDate = dateFormat(data.lowerDateyh)
    const lowerMsg = "〽️历史最低到手价：¥" + String(lower) + ` (${lowerDate}) `
    return lowerMsg
}

function priceSummary(data) {
    let summary = ""
    let listPriceDetail = data.PriceRemark.ListPriceDetail
    listPriceDetail.pop()
    let list = listPriceDetail.concat(historySummary(data.single))
    list.forEach((item, index) => {
        if (item.Name == "双11价格") {
            item.Name = "双十一价格"
        } else if (item.Name == "618价格") {
            item.Name = "六一八价格"
        } else if (item.Name == "30天最低价") {
            item.Name = "三十天最低"
        }
        summary += `\n${item.Name}   ${item.Price}   ${item.Date}   ${item.Difference}`
    })
    return summary
}

function historySummary(single) {
    const rexMatch = /\[.*?\]/g;
    const rexExec = /\[(.*),(.*),"(.*)"\]/;
    let currentPrice, lowest60, lowest180, lowest360
    let list = single.jiagequshiyh.match(rexMatch);
    list = list.reverse().slice(0, 360);
    list.forEach((item, index) => {
        if (item.length > 0) {
            const result = rexExec.exec(item);
            const dateUTC = new Date(eval(result[1]));
            const date = dateUTC.format("yyyy-MM-dd");
            let price = parseFloat(result[2]);
            if (index == 0) {
                currentPrice = price
                lowest60 = { Name: "六十天最低", Price: `¥${String(price)}`, Date: date, Difference: difference(currentPrice, price), price }
                lowest180 = { Name: "一百八最低", Price: `¥${String(price)}`, Date: date, Difference: difference(currentPrice, price), price }
                lowest360 = { Name: "三百六最低", Price: `¥${String(price)}`, Date: date, Difference: difference(currentPrice, price), price }
            }
            if (index < 60 && price <= lowest60.price) {
                lowest60.price = price
                lowest60.Price = `¥${String(price)}`
                lowest60.Date = date
                lowest60.Difference = difference(currentPrice, price)
            }
            if (index < 180 && price <= lowest180.price) {
                lowest180.price = price
                lowest180.Price = `¥${String(price)}`
                lowest180.Date = date
                lowest180.Difference = difference(currentPrice, price)
            }
            if (index < 360 && price <= lowest360.price) {
                lowest360.price = price
                lowest360.Price = `¥${String(price)}`
                lowest360.Date = date
                lowest360.Difference = difference(currentPrice, price)
            }
        }
    });
    return [lowest60, lowest180, lowest360];
}

function difference(currentPrice, price) {
    let difference = sub(currentPrice, price)
    if (difference == 0) {
        return "-"
    } else {
        return `${difference > 0 ? "↑" : "↓"}${String(difference)}`
    }
}

function sub(arg1, arg2) {
    return add(arg1, -Number(arg2), arguments[2]);
}

function add(arg1, arg2) {
    arg1 = arg1.toString(), arg2 = arg2.toString();
    var arg1Arr = arg1.split("."), arg2Arr = arg2.split("."), d1 = arg1Arr.length == 2 ? arg1Arr[1] : "", d2 = arg2Arr.length == 2 ? arg2Arr[1] : "";
    var maxLen = Math.max(d1.length, d2.length);
    var m = Math.pow(10, maxLen);
    var result = Number(((arg1 * m + arg2 * m) / m).toFixed(maxLen));
    var d = arguments[2];
    return typeof d === "number" ? Number((result).toFixed(d)) : result;
}

function request_history_price(share_url, callback) {
    const options = {
        url: "https://apapia-history.manmanbuy.com/ChromeWidgetServices/WidgetServices.ashx",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 - mmbWebBrowse - ios"
        },
        body: "methodName=getHistoryTrend&p_url=" + encodeURIComponent(share_url)
    }
    $tool.post(options, function (error, response, data) {
        if (!error) {
            callback(JSON.parse(data));
            if (consolelog) console.log("Data:\n" + data);
        } else {
            callback(null, null);
            if (consolelog) console.log("Error:\n" + error);
        }
    })
}

function dateFormat(cellval) {
    const date = new Date(parseInt(cellval.replace("/Date(", "").replace(")/", ""), 10));
    const month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    const currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return date.getFullYear() + "-" + month + "-" + currentDate;
}

function tool() {
    const isSurge = typeof $httpClient != "undefined"
    const isQuanX = typeof $task != "undefined"
    const node = (() => {
        if (typeof require == "function") {
            const request = require('request')
            return ({ request })
        } else {
            return (null)
        }
    })()
    const notify = (title, subtitle, message) => {
        if (isQuanX) $notify(title, subtitle, message)
        if (isSurge) $notification.post(title, subtitle, message)
        if (node) console.log(JSON.stringify({ title, subtitle, message }));
    }
    const setCache = (value, key) => {
        if (isQuanX) return $prefs.setValueForKey(value, key)
        if (isSurge) return $persistentStore.write(value, key)
    }
    const getCache = (key) => {
        if (isQuanX) return $prefs.valueForKey(key)
        if (isSurge) return $persistentStore.read(key)
    }
    const adapterStatus = (response) => {
        if (response.status) {
            response["statusCode"] = response.status
        } else if (response.statusCode) {
            response["status"] = response.statusCode
        }
        return response
    }
    const get = (options, callback) => {
        if (isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "GET"
            $task.fetch(options).then(response => {
                callback(null, adapterStatus(response), response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) $httpClient.get(options, (error, response, body) => {
            callback(error, adapterStatus(response), body)
        })
        if (node) {
            node.request(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
    }
    const post = (options, callback) => {
        if (isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => {
                callback(null, adapterStatus(response), response.body)
            }, reason => callback(reason.error, null, null))
        }
        if (isSurge) {
            $httpClient.post(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
        if (node) {
            node.request.post(options, (error, response, body) => {
                callback(error, adapterStatus(response), body)
            })
        }
    }
    return { isQuanX, isSurge, notify, setCache, getCache, get, post }
}

Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

Date.prototype.format = function (fmt) {
    var o = {
        "y+": this.getFullYear(),
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            if (k == "y+") {
                fmt = fmt.replace(RegExp.$1, ("" + o[k]).substr(4 - RegExp.$1.length));
            }
            else if (k == "S+") {
                var lens = RegExp.$1.length;
                lens = lens == 1 ? 3 : lens;
                fmt = fmt.replace(RegExp.$1, ("00" + o[k]).substr(("" + o[k]).length - 1, lens));
            }
            else {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
    }
    return fmt;
}
