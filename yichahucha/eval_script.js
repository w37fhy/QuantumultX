const __conf = String.raw`

[Remote]
// custom remote...
# https://raw.githubusercontent.com/yichahucha/surge/master/qx_sub.txt


[Local]
// custom local...
# jd
# ^https?://api\.m\.jd\.com/client\.action\?functionId=(wareBusiness|serverConfig) url script-response-body https://raw.githubusercontent.com/yichahucha/surge/master/jd_price.js


[Hostname]
// custom hostname...
# api.m.jd.com


`

const __isUpdateGithub = true
// GitHub Token（如果使用账号密码 token 请设置为空 ""）
const __token = ""
// GitHub 账号
const __username = "xxx"
// GitHub 密码
const __password = "xxx"
// GitHub 用户名
const __owner = "xxx"
// GitHub 仓库名
const __repo = "xxx"
// GitHub 分支（不指定就使用默认分支）
const __branch = "master"
// 指定 eval_script.js 文件路径（路径为空 "" 使用脚本原始路径）
const __evalPath = "eval_script.js"
// GitHub 文件路径（没有文件新创建，已有文件覆盖更新，路径为空 "" 不更新）
const __quanxPath = "eval_script/qx_script.txt"
const __surgePath = "eval_script/sg_script.sgmodule"
// GitHub 更新日志
const __quanxCommit = "update"
const __surgeCommit = "update"

const __emojiDone = ""
const __emojiFail = "🙃"
const __emojiSuccess = "😀"
const __emojiTasks = "🕐"
const __emojiUpdateSuccess = "🟢"
const __emojiUpdateFail = "🟠 "
const __emojiGitHub = "🔵"
const __showLine = 15

const __log = false
const __debug = false
const __developmentMode = false
const __concurrencyLimit = 15
const __cacheKey = "ScriptCacheKey"

const __tool = new ____Tool()
const __base64 = new ____Base64()

if (__tool.isTask) {
    const begin = new Date()
    const storeObj = {}
    //get conf info (local remote)
    ____getConf()
        //check conf
        .then((conf) => {
            return new Promise((resolve, reject) => {
                if (conf.contents.length > 0) {
                    storeObj["confResults"] = conf.results
                    storeObj["confHostnames"] = conf.hostnames
                    if (__log) console.log(conf.contents)
                    resolve(conf.contents)
                } else {
                    let message = ""
                    conf.results.forEach(data => {
                        message += message.length > 0 ? "\n" + data.message : data.message
                    });
                    reject(message.length > 0 ? message : `Unavailable configuration! Please check!`)
                }
            })
        })
        //parse conf
        .then((contents) => {
            return new Promise((resolve, reject) => {
                const parseResult = ____parseConf(contents)
                if (parseResult.confMap) {
                    storeObj["confMap"] = parseResult.confMap
                    storeObj["quanxConfContents"] = parseResult.quanxConfContents
                    storeObj["surgeConfContents"] = parseResult.surgeConfContents
                    if (__log) console.log(parseResult.confMap)
                    if (__log) console.log("quanx\n" + parseResult.quanxConfContents.join("\n"));
                    if (__log) console.log("surge\n" + parseResult.surgeConfContents.join("\n"));
                    resolve(parseResult.confMap)
                } else {
                    reject(`Configuration information error: ${parseResult.error}`)
                }
            })
        })
        //download script
        .then((confMap) => {
            const scriptUrls = Object.keys(confMap)
            __tool.notify("", "", `Start updating ${scriptUrls.length} scripts...`)
            console.log("Start updating script...")
            return ____concurrentQueueLimit(scriptUrls, __concurrencyLimit, (url) => {
                const urlRegex = /^(https?:\/\/(([a-zA-Z0-9]+-?)+[a-zA-Z0-9]+\.)+[a-zA-Z]+)(:\d+)?(\/.*)?(\?.*)?(#.*)?$/
                return new Promise((resolve) => {
                    if (urlRegex.test(url)) {
                        ____downloadFile(url).then((data) => {
                            if (data.code == 200) {
                                __tool.write(data.body, data.url)
                            }
                            resolve(data)
                        })
                    } else {
                        __tool.write(url, url)
                        resolve({ body: url, url, message: `${__emojiUpdateSuccess}${url} function set successfully` })
                    }
                })
            })
        })
        //write cache
        .then((scriptResults) => {
            console.log("Stop updating script.")
            storeObj["scriptResults"] = scriptResults
            return __tool.write(JSON.stringify(storeObj.confMap), __cacheKey)
        })
        //update github
        .then(() => {
            if (__isUpdateGithub) {
                const quanxHostname = `${storeObj.confHostnames.length > 0 ? `hostname = ${Array.from(new Set(storeObj.confHostnames)).join(",")}` : ""}`
                const surgeHostname = `${storeObj.confHostnames.length > 0 ? `hostname = %INSERT% ${Array.from(new Set(storeObj.confHostnames)).join(",")}` : ""}`
                const quanxUpdateContent = `${quanxHostname}\n\n${Array.from(new Set(storeObj.quanxConfContents)).join("\n\n")}`
                const surgeUpdateContent = `#!name=eval_script.js module\n\n[MITM]\n${surgeHostname}\n\n[Script]\n${Array.from(new Set(storeObj.surgeConfContents)).join("\n\n")}`
                const args = [{ path: __quanxPath, content: quanxUpdateContent, commit: __quanxCommit }, { path: __surgePath, content: surgeUpdateContent, commit: __surgeCommit }]
                console.log("Start updating github...")
                const update = async () => {
                    let results = []
                    for (let i = 0, len = args.length; i < len; i++) {
                        const arg = args[i]
                        if (arg.path.length > 0) {
                            const result = await ____updateGitHub(arg.path, arg.content, arg.commit)
                            results.push(result)
                        }
                    }
                    console.log("Stop updating github.")
                    return results
                }
                return update()
            } else {
                return null
            }
        })
        //notify
        .then((githubResults) => {
            const github = (() => {
                let message = ""
                if (githubResults && githubResults.length > 0) {
                    githubResults.forEach((result, index) => {
                        if (index == 0) message = result.message
                        message += message.length > 0 ? "\n" + __emojiGitHub + result.url : __emojiGitHub + result.url
                    });
                }
                return message
            })()
            const confResults = storeObj.confResults
            const scriptResults = storeObj.scriptResults
            const resultInfo = (() => {
                let message = ""
                let success = 0
                let fail = 0
                confResults.concat(scriptResults).forEach(data => {
                    if (data.message.match("success")) success++
                    if (data.message.match("fail")) fail++
                    message += message.length > 0 ? "\n" + data.message : data.message
                });
                return { message, count: { success, fail } }
            })()
            const messages = resultInfo.message.split("\n")
            const detail = `${messages.slice(0, __showLine).join("\n")}${messages.length > 20 ? `\n${__emojiUpdateSuccess}......` : ""}`
            const summary = `${__emojiSuccess}success: ${resultInfo.count.success}  ${__emojiFail}fail: ${resultInfo.count.fail}   ${__emojiTasks}tasks: ${____timeDiff(begin, new Date())}s`
            const nowDate = `${new Date().Format("yyyy-MM-dd HH:mm:ss")} last updated`
            const lastDate = __tool.read("ScriptLastUpdateDateKey")
            const date = `${__emojiTasks}${lastDate ? lastDate : nowDate}`
            console.log(`\n${summary}\n${resultInfo.message}${github.length > 0 ? `\n${github}` : ""}\n${date}`)
            __tool.notify(`${__emojiDone}Update Done`, summary, `${detail}${github.length > 0 ? `\n${github}` : ""}\n${date}`)
            __tool.write(nowDate, "ScriptLastUpdateDateKey")
            __tool.done({})
        })
        .catch((error) => {
            console.log(error)
            __tool.notify("[eval_script.js]", "", error)
            __tool.done({})
        })
}

if (!__tool.isTask) {
    const __url = $request.url
    const __confObj = (() => {
        if (__developmentMode) {
            return ____parseDevelopmentModeConf(__conf)
        } else {
            return JSON.parse(__tool.read(__cacheKey))
        }
    })()
    const __script = (() => {
        let script = null
        const keys = Object.keys(__confObj)
        for (let i = 0, len = keys.length; i < len; i++) {
            if (script) break
            const key = keys[i]
            const value = __confObj[key]
            for (let j = 0, len = value.length; j < len; j++) {
                const match = value[j]
                try {
                    const regular = new RegExp(match.regular)
                    if (regular.test(__url)) {
                        const type = match.type
                        if (type && type.length > 0) {
                            if (__tool.scriptType == type) {
                                script = { url: key, match, content: __developmentMode ? key : __tool.read(key) }
                                break
                            }
                        } else {
                            script = { url: key, match, content: __developmentMode ? key : __tool.read(key) }
                            break
                        }
                    }
                } catch (error) {
                    if (__debug) __tool.notify("[eval_script.js]", "", `Error regular : ${match.regular}\nRequest: ${__url}`)
                    //throw error
                }
            }
        }
        return script
    })()
    if (__script) {
        if (__script.content) {
            const type = __script.match.type
            if (type && type.length > 0) {
                if (__tool.scriptType == type) {
                    if (__debug) {
                        try {
                            eval(__script.content)
                            if (__debug) __tool.notify("[eval_script.js]", `${__tool.method} ${__tool.scriptType}==${type}`, `Execute script: ${__script.url}\nRegular: ${__script.match.regular}\nRequest: ${__url}`)
                        } catch (error) {
                            if (__debug) __tool.notify("[eval_script.js]", `${__tool.method} ${__tool.scriptType}`, `Script execute error: ${error}\nScript: ${__script.url}\nRegular: ${__script.match}\nRequest: ${__url}\nContent: ${__script.content}`)
                            throw error
                        }
                    } else {
                        eval(__script.content)
                    }
                } else {
                    __tool.done({})
                    if (__debug) __tool.notify("[eval_script.js]", `${__tool.method} ${__tool.scriptType}!=${type}`, `Script types do not match! Don't execute script.\nScript: ${__script.url}\nRegular: ${__script.match.regular}\nRequest: ${__url}`)
                }
            } else {
                if (__debug) {
                    try {
                        eval(__script.content)
                        if (__debug) __tool.notify("[eval_script.js]", `${__tool.method} ${__tool.scriptType} ${"request&&response"}`, `Execute script: ${__script.url}\nRegular: ${__script.match.regular}\nRequest: ${__url}`)
                    } catch (error) {
                        if (__debug) __tool.notify("[eval_script.js]", `${__tool.method} ${__tool.scriptType}`, `Script execute error: ${error}\nScript: ${__script.url}\nRegular: ${__script.match.regular}\nRequest: ${__url}\nContent: ${__script.content}`)
                        throw error
                    }
                } else {
                    eval(__script.content)
                }
            }
        } else {
            __tool.done({})
            if (__log) console.log(`script not found: ${__script.url}\nregular: ${__script.match.regular}\nrequest: ${__url}`)
        }
    } else {
        __tool.done({})
        if (__log) console.log(`script not matched: ${__url}`)
    }
}

async function ____updateGitHub(path, content, message) {
    const url = `https://api.github.com/repos/${__owner}/${__repo}/contents/${path}`
    const options = {
        url: url,
        headers: { "Content-Type": "application/json; charset=utf-8", "User-Agent": "eval_script.js" }
    }
    if (__token.length > 0) {
        options.headers["Authorization"] = `Token ${__token}`
    } else {
        options.headers["Authorization"] = `Basic ${__base64.encode(`${__username}:${__password}`)}`
    }
    const getContent = () => {
        return new Promise(function (resolve, reject) {
            if (__branch.length > 0) options.url += `?ref=${__branch}`
            options["method"] = "GET"
            __tool.get(options, (error, response, body) => {
                if (!error) {
                    if (__log) console.log(`getContent: ${response.status}\n${body}`)
                    body = JSON.parse(body)
                    if (response.status == 200) {
                        resolve(body.sha)
                    } else if (response.status == 404) {
                        resolve(null)
                    } else {
                        reject("GitHub update failed: " + body.message)
                    }
                } else {
                    reject("GitHub update failed: " + error)
                }
            })
        })
    }
    const updateContent = (sha) => {
        return new Promise(function (resolve, reject) {
            const body = {
                message: message,
                content: __base64.encode(content)
            }
            if (__branch) body["branch"] = __branch
            if (sha) body["sha"] = sha
            options.url = url
            options["body"] = JSON.stringify(body)
            options["method"] = "PUT"
            __tool.put(options, (error, response, body) => {
                if (!error) {
                    if (__log) console.log(`updateContent: ${response.status}\n${body}`)
                    body = JSON.parse(body)
                    if (response.status == 200) {
                        resolve({ url: body.content.download_url, message: `${__emojiGitHub}GitHub updated successfully${sha != body.content.sha ? " (file changes)" : ""}` })
                    } else if (response.status == 201) {
                        resolve({ url: body.content.download_url, message: `${__emojiGitHub}GitHub file created successfully` })
                    } else {
                        reject("GitHub update failed: " + body.message)
                    }
                } else {
                    reject("GitHub update failed: " + error)
                }
            })
        })
    }
    const sha = await getContent()
    const result = await updateContent(sha)
    return result
}

function ____getConf() {
    return new Promise((resolve) => {
        const remoteConf = ____removeAnnotation(____extractConf(__conf, "Remote"))
        const localConf = ____removeAnnotation(____extractConf(__conf, "Local"))
        const hostnameConf = ____parseHostname(____removeAnnotation(____extractConf(__conf, "Hostname")))
        if (remoteConf.length > 0) {
            console.log("Start updating conf...")
            if (__debug) __tool.notify("", "", `Start updating ${remoteConf.length} confs...`)
            ____concurrentQueueLimit(remoteConf, __concurrencyLimit, (url) => {
                return ____downloadFile(url)
            })
                .then(results => {
                    console.log("Stop updating conf.")
                    let contents = []
                    let hostnames = []
                    results.forEach(data => {
                        const parseRemoteResult = ____parseRemoteConf(data.body)
                        if (data.body) {
                            contents = contents.concat(parseRemoteResult.contents)
                            hostnames = hostnames.concat(parseRemoteResult.hostnames)
                        }
                    });
                    contents = localConf.concat(contents)
                    hostnames = hostnameConf.concat(hostnames)
                    resolve({ contents, hostnames, results })
                })
        } else {
            resolve({ contents: localConf, hostnames: hostnameConf, results: [] })
        }
    })
}

function ____parseDevelopmentModeConf(conf) {
    const localConf = ____removeAnnotation(____extractConf(__conf, "eval_local"))
    const result = ____parseConf(localConf)
    return result.obj
}

function ____timeDiff(begin, end) {
    return Math.ceil((end.getTime() - begin.getTime()) / 1000)
}

function ____concurrentQueueLimit(list, limit, asyncHandle) {
    let results = []
    const recursion = (arr) => {
        return asyncHandle(arr.shift())
            .then((data) => {
                results.push(data)
                if (arr.length !== 0) return recursion(arr)
                else return 'finish'
            })
    };
    const listCopy = [].concat(list)
    let asyncList = []
    if (list.length < limit)
        limit = list.length
    while (limit--) {
        asyncList.push(recursion(listCopy))
    }
    return new Promise((resolve) => {
        Promise.all(asyncList).then(() => resolve(results))
    });
}

function ____downloadFile(url) {
    return new Promise((resolve) => {
        __tool.get(url, (error, response, body) => {
            const filename = url.match(/[^\/]+$/)[0]
            if (!error) {
                const code = response.statusCode
                if (code == 200) {
                    console.log(`updated successfully: ${url}`)
                    resolve({ url, code, body, message: `${__emojiUpdateSuccess}${filename} updated successfully` })
                } else {
                    console.log(`update failed ${response.statusCode}: ${url}`)
                    resolve({ url, code, body, message: `${__emojiUpdateFail}${filename} update failed` })
                }
            } else {
                console.log(`updated faile ${error}`)
                resolve({ url, code: null, body: null, message: `${__emojiUpdateFail}${filename} update failed` })
            }
        })
    })
}

function ____parseHostname(hostnames) {
    if (hostnames.length > 0 && hostnames[0].length > 0) {
        hostnames = hostnames[0].replace(/\s/g, "").split(",")
    }
    return hostnames
}

function ____extractConf(conf, type) {
    const rex = new RegExp("\\[" + type + "\\](.|\\n)*?(?=\\n($|\\[))", "g")
    let result = rex.exec(conf)
    if (result) {
        result = result[0].split("\n")
        result.shift()
    } else {
        result = []
    }
    return result
}

function ____parseRemoteConf(conf) {
    const lines = conf.split("\n")
    let newLines = []
    let hostnames = []
    for (let i = 0, len = lines.length; i < len; i++) {
        const eval = /^(.+)\s+eval\s+(.+)$/
        const surge = /^http\s*-\s*(request|response)\s+(\S+)\s+(.+)$/
        const newSurge = /^\S+.js\s+=\s(.+)$/
        const quanx = /^(\S+)\s+url\s+script\s*-\s*(\S+)\s*-\s*(?:header|body)\s+(\S+)$/
        let line = lines[i].trim()
        if (line.length > 0) {
            if (/^#{4}/.test(line)) {
                line = line.replace(/^#*/, "")
                newLines.push(line)
            } else if (/^(?!;|#|\/\/).*/.test(line)) {
                if (eval.test(line) || surge.test(line) || newSurge.test(line)) {
                    newLines.push(line)
                }
                if (quanx.test(line)) {
                    const path = line.match(quanx)[3].trim()
                    if (/^https?:\/\/.+/.test(path)) {
                        newLines.push(line)
                    }
                }
                if (/^hostname\s*=\s*.+/.test(line)) {
                    hostnames = line.replace(/\s/g, "").replace(/hostname=/, "").split(",")
                }
            }
        }
    }
    return { contents: newLines, hostnames }
}

function ____parseConf(lines) {
    let confMap = {}
    let quanxConfContents = []
    let surgeConfContents = []
    for (let i = 0, len = lines.length; i < len; i++) {
        let line = lines[i].trim()
        if (line.length > 0 && line.substring(0, 2) != "//" && line.substring(0, 1) != "#") {
            const eval = /^(.+)\s+eval\s+(.+)$/
            const surge = /^http\s*-\s*(request|response)\s+(\S+)\s+(.+)$/
            const newSurge = /^\S+.js\s+=\s(.+)$/
            const quanx = /^(\S+)\s+url\s+script\s*-\s*(\S+)\s+(\S+\.js)$/
            if (surge.test(line)) {
                const result = line.match(surge)
                // content
                const requiresBody = ____surgeArg(result[3].trim()).requiresBody
                // surgeConfContents.splice(i, 0, `${line.replace(____surgeArg(result[3].trim()).scriptPath, "eval_script.js")}`);
                if (__evalPath.length > 0) {
                    const path = __evalPath
                    const fileName = path.match(/[^\/]+$/)[0]
                    surgeConfContents.push(`${fileName} = type=http-${result[1].trim()},${requiresBody ? `requires-body=${requiresBody},` : ""}pattern=${result[2].trim()},script-path=${path}`)
                    quanxConfContents.push(`${result[2].trim()} url script-${result[1].trim()}-${requiresBody == "1" ? "body" : "header"} ${path}`)
                } else {
                    const path = ____surgeArg(result[3].trim()).scriptPath
                    const fileName = path.match(/[^\/]+$/)[0]
                    surgeConfContents.push(`${fileName} = type=http-${result[1].trim()},${requiresBody ? `requires-body=${requiresBody},` : ""}pattern=${result[2].trim()},script-path=${path}`)
                    quanxConfContents.push(`${result[2].trim()} url script-${result[1].trim()}-${requiresBody == "1" ? "body" : "header"} ${path}`)
                }
                // eval
                line = `${result[1].trim()} ${result[2].trim()} eval ${____surgeArg(result[3].trim()).scriptPath}`
            }
            else if (quanx.test(line)) {
                const result = line.match(quanx)
                const type = result[2].split("-")
                // content
                let requires = 0
                if (type[0].trim() == "response") {
                    requires = 1
                } else {
                    if (type[1].trim() == "body") {
                        requires = 1
                    }
                }
                // surgeConfContents.splice(i, 0, `http-${type[0].trim()} ${result[1].trim()} ${requires == 0 ? "" : `requires-body=${requires},`}script-path=eval_script.js`)
                if (__evalPath.length > 0) {
                    const path = __evalPath
                    const fileName = path.match(/[^\/]+$/)[0]
                    surgeConfContents.push(`${fileName} = type=http-${type[0].trim()},${requires == 0 ? "" : `requires-body=${requires},`}pattern=${result[1].trim()},script-path=${path}`)
                    quanxConfContents.push(`${line.replace(result[3].trim(), path)}`)
                } else {
                    const path = result[3].trim()
                    const fileName = path.match(/[^\/]+$/)[0]
                    surgeConfContents.push(`${fileName} = type=http-${type[0].trim()},${requires == 0 ? "" : `requires-body=${requires},`}pattern=${result[1].trim()},script-path=${path}`)
                    quanxConfContents.push(line)
                }
                // eval
                line = `${type[0].trim()} ${result[1].trim()} eval ${result[3].trim()}`
            }
            else if (newSurge.test(line)) {
                //content
                const result = line.match(newSurge)
                const surgeArg = ____surgeArg(result[1].trim())
                // surgeConfContents.splice(i, 0, `${surgeArg.type} ${surgeArg.pattern} ${surgeArg.requiresBody ? `requires-body=${surgeArg.requiresBody},` : ""}script-path=eval_script.js`)
                if (__evalPath.length > 0) {
                    const path = __evalPath
                    const fileName = path.match(/[^\/]+$/)[0]
                    surgeConfContents.push(`${fileName} = ${result[1].replace(surgeArg.scriptPath, path)}`)
                    quanxConfContents.push(`${surgeArg.pattern} url script-${surgeArg.type.replace("http-", "")}-${(surgeArg.requiresBody && surgeArg.requiresBody == "1") ? "body" : "header"} ${path}`)
                } else {
                    const path = surgeArg.scriptPath
                    surgeConfContents.push(line)
                    quanxConfContents.push(`${surgeArg.pattern} url script-${surgeArg.type.replace("http-", "")}-${(surgeArg.requiresBody && surgeArg.requiresBody == "1") ? "body" : "header"} ${path}`)
                }
                // eval
                line = `${surgeArg.type.replace("http-", "")} ${surgeArg.pattern} eval ${surgeArg.scriptPath}`
            }
            if (eval.test(line)) {
                const value = line.match(eval)
                const remote = value[2].trim()
                const match = ____parseMatch(value[1].trim())
                if (remote.length > 0 && match.length > 0) {
                    if (confMap.hasOwnProperty(remote)) {
                        confMap[remote] = confMap[remote].concat(match)
                    } else {
                        confMap[remote] = match
                    }
                } else {
                    return { confMap: null, quanxConfContents, surgeConfContents, error: line }
                }
            } else {
                return { confMap: null, quanxConfContents, surgeConfContents, error: line }
            }
        }
    }
    return { confMap, quanxConfContents, surgeConfContents, error: null }
}

function ____parseMatch(match) {
    let matchs = []
    const typeRegex = /(request|response)\s+\S+/g
    const typeItems = match.match(typeRegex)
    if (typeItems && typeItems.length > 0) {
        match = match.replace(typeRegex, "")
    }
    const normalItems = match.match(/\S+/g)
    const items = (typeItems ? typeItems : []).concat(normalItems ? normalItems : [])
    for (let i = 0, len = items.length; i < len; i++) {
        let item = items[i]
        item = item.match(/\S+/g)
        if (item.length > 1) {
            matchs.push({ type: item[0], regular: item[1] })
        } else {
            matchs.push({ type: "", regular: item[0] })
        }
    }
    return matchs
}

function ____surgeArg(arg) {
    let surgeArg = {}
    const args = arg.split(",")
    for (let i = 0, len = args.length; i < len; i++) {
        const item = args[i].trim()
        const path = /^script-path\s*=\s*(\S+)$/
        const requires = /^requires-body\s*=\s*(\S+)$/
        const pattern = /^pattern\s*=\s*(\S+)$/
        const type = /^type\s*=\s*(\S+)$/
        if (path.test(item)) {
            surgeArg["scriptPath"] = item.match(path)[1]
        }
        if (requires.test(item)) {
            surgeArg["requiresBody"] = item.match(requires)[1]
        }
        if (pattern.test(item)) {
            surgeArg["pattern"] = item.match(pattern)[1]
        }
        if (type.test(item)) {
            surgeArg["type"] = item.match(type)[1]
        }
    }
    return surgeArg
}

function ____removeAnnotation(lines) {
    if (lines.length > 0) {
        let i = lines.length;
        while (i--) {
            const line = lines[i].replace(/^\s*/, "")
            if (line.length == 0 || line.substring(0, 2) == "//" || line.substring(0, 1) == "#") {
                lines.splice(i, 1)
            }
        }
    }
    return lines
}

function ____Tool() {
    _node = (() => {
        if (typeof require == "function") {
            const request = require('request')
            return ({ request })
        } else {
            return (null)
        }
    })()
    _isJsBox = typeof $jsbox != "undefined"
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
        if (_isJsBox) {
            const push = require("push");
            push.schedule({ title: title, body: `${subtitle}${subtitle.length > 0 ? "\n" : ""}${message}` });
        }
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

function ____Base64() {
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

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "H+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
