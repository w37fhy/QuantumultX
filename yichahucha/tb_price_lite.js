/*
README：https://github.com/yichahucha/surge/tree/master
 */

const $tool = new Tool()
const consoleLog = false
const url = $request.url
const path1 = "/amdc/mobileDispatch"
const path2 = "/gw/mtop.taobao.detail.getdetail"

if (url.indexOf(path1) != -1) {
    if ($tool.isResponse) {
        const $base64 = new Base64()
        let body = $response.body
        let obj = JSON.parse($base64.decode(body))
        let dns = obj.dns
        if (dns && dns.length > 0) {
            let i = dns.length;
            while (i--) {
                const element = dns[i];
                let host = "trade-acs.m.taobao.com"
                if (element.host == host) {
                    element.ips = []
                    if (consoleLog) console.log(JSON.stringify(element))
                }
            }
        }
        body = $base64.encode(JSON.stringify(obj))
        $done({ body })
    } else {
        let headers = $request.headers
        let body = $request.body
        if (headers["User-Agent"].indexOf("%E6%89%8B%E6%9C%BA%E6%B7%98%E5%AE%9D") != -1) {
            let json = Qs2Json(body)
            let domain = json.domain.split(" ")
            let i = domain.length;
            while (i--) {
                const block = "trade-acs.m.taobao.com"
                const element = domain[i];
                if (element == block) {
                    domain.splice(i, 1);
                }
            }
            json.domain = domain.join(" ")
            body = Json2Qs(json)
        }
        $done({ body })
    }
}

if (url.indexOf(path2) != -1) {
    const body = $response.body
    $done({ body })
    const obj = JSON.parse(body)
    let item = obj.data.item
    let shareUrl = `https://item.taobao.com/item.htm?id=${item.itemId}`
    requestPrice(shareUrl, function (data) {
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
    const lowerMsg = "〽️历史最低到手价：¥" + String(lower) + `（${lowerDate}）`
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

function requestPrice(share_url, callback) {
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
            if (consoleLog) console.log("Data:\n" + data);
        } else {
            callback(null, null);
            if (consoleLog) console.log("Error:\n" + error);
        }
    })
}

function dateFormat(cellval) {
    const date = new Date(parseInt(cellval.replace("/Date(", "").replace(")/", ""), 10));
    const month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    const currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return date.getFullYear() + "-" + month + "-" + currentDate;
}

function Qs2Json(url) {
    var search = url.substring(url.lastIndexOf("?") + 1);
    var obj = {};
    var reg = /([^?&=]+)=([^?&=]*)/g;
    search.replace(reg, function (rs, $1, $2) {
        var name = decodeURIComponent($1);
        var val = decodeURIComponent($2);
        val = String(val);
        obj[name] = val;
        return rs;
    });
    return obj;
}

function Json2Qs(json) {
    var temp = [];
    for (var k in json) {
        temp.push(k + "=" + json[k]);
    }
    return temp.join("&");
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

function Tool() {
    _node = (() => {
        if (typeof require == "function") {
            const request = require('request')
            return ({ request })
        } else {
            return (null)
        }
    })()
    _isSurge = typeof $httpClient != "undefined"
    _isQuanX = typeof $task != "undefined"
    this.isSurge = _isSurge
    this.isQuanX = _isQuanX
    this.isResponse = typeof $response != "undefined"
    this.notify = (title, subtitle, message) => {
        if (_isQuanX) $notify(title, subtitle, message)
        if (_isSurge) $notification.post(title, subtitle, message)
        if (_node) console.log(JSON.stringify({ title, subtitle, message }));
    }
    this.write = (value, key) => {
        if (_isQuanX) return $prefs.setValueForKey(value, key)
        if (_isSurge) return $persistentStore.write(value, key)
    }
    this.read = (key) => {
        if (_isQuanX) return $prefs.valueForKey(key)
        if (_isSurge) return $persistentStore.read(key)
    }
    this.get = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "GET"
            $task.fetch(options).then(response => { callback(null, _status(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.get(options, (error, response, body) => { callback(error, _status(response), body) })
        if (_node) _node.request(options, (error, response, body) => { callback(error, _status(response), body) })
    }
    this.post = (options, callback) => {
        if (_isQuanX) {
            if (typeof options == "string") options = { url: options }
            options["method"] = "POST"
            $task.fetch(options).then(response => { callback(null, _status(response), response.body) }, reason => callback(reason.error, null, null))
        }
        if (_isSurge) $httpClient.post(options, (error, response, body) => { callback(error, _status(response), body) })
        if (_node) _node.request.post(options, (error, response, body) => { callback(error, _status(response), body) })
    }
    _status = (response) => {
        if (response) {
            if (response.status) {
                response["statusCode"] = response.status
            } else if (response.statusCode) {
                response["status"] = response.statusCode
            }
        }
        return response
    }
}

function Base64() {
    // private property
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    // public method for encoding
    this.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    }
    // public method for decoding
    this.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = _utf8_decode(output);
        return output;
    }
    // private method for UTF-8 encoding
    _utf8_encode = function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }
        return utftext;
    }
    // private method for UTF-8 decoding
    _utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}
