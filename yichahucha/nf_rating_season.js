/**
 * nf_rating_season.js = type=http-response,pattern=^https?://ios\.prod\.ftl\.netflix\.com/iosui/warmer/.+type=show-ath,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/yichahucha/surge/master/nf_rating_season.js
 */

const $tool = new Tool()
const url = $request.url
const body = $response.body
const imdbApikeyCacheKey = "ImdbApikeyCacheKey"
const netflixTitleCacheKey = "NetflixTitleCacheKey"
const map = $tool.read(netflixTitleCacheKey)
const id = url.match(/id=(\d+)/)[1]
const title = map ? JSON.parse(map)[id] : null
const obj = JSON.parse(body)

if (title && obj.shows[id].seasons) {
    const key = $tool.read(imdbApikeyCacheKey)
    const seasons = obj.shows[id].seasons.map(item => item.season)
    const promises = []
    for (let index = 0; index < seasons.length; index++) {
        const url = `https://www.omdbapi.com/?t=${title}&apikey=${key}&type=series&Season=${seasons[index]}`
        promises.push(requestSeasonRating(encodeURI(url)))
    }
    Promise.all(promises).then((values) => {
        // console.log(values)
        for (let index = 0; index < values.length; index++) {
            const imdb = values[index]
            if (imdb) {
                const imdbSeasonNumber = imdb.Season
                const imdbEpisodes = imdb.Episodes
                const entities = obj.entities
                for (let [key, value] of Object.entries(entities)) {
                    // console.log(`${key}: ${value}`);
                    const seasonNumber = value.summary.seasonNumber
                    const episodeNumber = value.summary.episodeNumber
                    let title = value.summary.title
                    if (parseInt(imdbSeasonNumber) == seasonNumber) {
                        const imdbEpisode = imdbEpisodes.find(element => parseInt(element.Episode) == episodeNumber)
                        title = `${title}${imdbEpisode && imdbEpisode.imdbRating ? `  ⭐️ ${imdbEpisode.imdbRating}` : "  ⭐️ N/A"}`
                        value.summary.title = title
                        //console.log(title);
                    }
                }
            }
        }
        // console.log(JSON.stringify(obj))
        $tool.done({ body: JSON.stringify(obj) })
    })
} else {
    $tool.done({})
}

function requestSeasonRating(url) {
    return new Promise((resolve) => {
        $tool.get(url, (error, response, body) => {
            if (!error) {
                const code = response.statusCode
                if (code == 200) {
                    const obj = JSON.parse(body)
                    if (obj.Response != "False") {
                        //console.log(`successfully: ${url}`)
                        resolve(obj)
                    } else {
                        //console.log(`failed: ${obj.Error} -> ${url}`)
                        resolve(null)
                    }
                } else {
                    //console.log(`failed: ${response.statusCode} -> ${url}`)
                    resolve(null)
                }
            } else {
                //console.log(`faile: ${error}`)
                resolve(null)
            }
        })
    })
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
    _isTask = typeof $request == "undefined"
    _isResponse = typeof $response != "undefined"
    _isRequestBody = typeof $request != "undefined" && typeof $request.body != "undefined"
    this.isSurge = _isSurge
    this.isQuanX = _isQuanX
    this.isTask = _isTask
    this.isResponse = _isResponse
    this.isRequestBody = _isRequestBody
    this.method = (() => {
        if (!_isTask && (_isSurge || _isQuanX)) {
            return $request.method
        }
    })()
    this.scriptType = (() => {
        if (_isResponse) {
            return "response"
        } else {
            return "request"
        }
    })()
    this.done = (obj) => {
        if (_isQuanX) $done(obj)
        if (_isSurge) $done(obj)
        if (_node) console.log("script done.");
    }
    this.notify = (title, subtitle, message) => {
        if (_isQuanX) $notify(title, subtitle, message)
        if (_isSurge) $notification.post(title, subtitle, message)
        if (_node) console.log(JSON.stringify({ title, subtitle, message }));
    }
    this.write = (value, key) => {
        if (_isQuanX) return $prefs.setValueForKey(value, key)
        if (_isSurge) return $persistentStore.write(value, key)
        if (_node) console.log(`write success: ${key}`);
    }
    this.read = (key) => {
        if (_isQuanX) return $prefs.valueForKey(key)
        if (_isSurge) return $persistentStore.read(key)
        if (_node) console.log(`read success: ${key}`);
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
    this.put = (options, callback) => {
        if (_isQuanX) $task.fetch(options).then(response => { callback(null, _status(response), response.body) }, reason => callback(reason.error, null, null))
        if (_isSurge) $httpClient.put(options, (error, response, body) => { callback(error, _status(response), body) })
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
