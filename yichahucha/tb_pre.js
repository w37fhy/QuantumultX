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
$done({
  body
})

function Qs2Json(url) {
  var search = url.substring(url.lastIndexOf("?") + 1);
  var obj = {};
  var reg = /([^?&=]+)=([^?&=]*)/g;
  search.replace(reg, function(rs, $1, $2) {
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