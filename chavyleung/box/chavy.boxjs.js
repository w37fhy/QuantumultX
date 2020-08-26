const $ = new Env('BoxJs')

// 为 eval 准备的上下文环境
const $eval_env = {}

$.version = '0.7.56'
$.versionType = 'beta'

/**
 * ===================================
 * 持久化属性: BoxJs 自有的数据结构
 * ===================================
 */

// 存储`用户偏好`
$.KEY_usercfgs = 'chavy_boxjs_userCfgs'
// 存储`应用会话`
$.KEY_sessions = 'chavy_boxjs_sessions'
// 存储`页面缓存`
$.KEY_web_cache = 'chavy_boxjs_web_cache'
// 存储`应用订阅缓存`
$.KEY_app_subCaches = 'chavy_boxjs_app_subCaches'
// 存储`全局备份`
$.KEY_globalBaks = 'chavy_boxjs_globalBaks'
// 存储`当前会话` (配合切换会话, 记录当前切换到哪个会话)
$.KEY_cursessions = 'chavy_boxjs_cur_sessions'

/**
 * ===================================
 * 持久化属性: BoxJs 公开的数据结构
 * ===================================
 */

// 存储用户访问`BoxJs`时使用的域名
$.KEY_boxjs_host = 'boxjs_host'

// 请求响应体 (返回至页面的结果)
$.json = $.name // `接口`类请求的响应体
$.html = $.name // `页面`类请求的响应体

// 页面源码地址
$.web = `https://cdn.jsdelivr.net/gh/chavyleung/scripts@${$.version}/box/chavy.boxjs.html?_=${new Date().getTime()}`
// 版本说明地址 (Release Note)
$.ver = 'https://gitee.com/chavyleung/scripts/raw/master/box/release/box.release.tf.json'

!(async () => {
  // 勿扰模式
  $.isMute = [true, 'true'].includes($.getdata('@chavy_boxjs_userCfgs.isMute'))

  // 请求路径
  $.path = getPath($request.url)

  // 请求类型: GET
  $.isGet = $request.method === 'GET'
  // 请求类型: POST
  $.isPost = $request.method === 'POST'
  // 请求类型: OPTIONS
  $.isOptions = $request.method === 'OPTIONS'

  // 请求类型: page、api、query
  $.type = 'page'
  // 查询请求: /query/xxx
  $.isQuery = $.isGet && /^\/query\/.*?/.test($.path)
  // 接口请求: /api/xxx
  $.isApi = $.isPost && /^\/api\/.*?/.test($.path)
  // 页面请求: /xxx
  $.isPage = $.isGet && !$.isQuery && !$.isApi

  // 升级用户数据
  upgradeUserData()

  // 处理预检请求
  if ($.isOptions) {
    $.type = 'options'
    await handleOptions()
  }
  // 处理`页面`请求
  else if ($.isPage) {
    $.type = 'page'
    await handlePage()
  }
  // 处理`查询`请求
  else if ($.isQuery) {
    $.type = 'query'
    await handleQuery()
  }
  // 处理`接口`请求
  else if ($.isApi) {
    $.type = 'api'
    await handleApi()
  }
})()
  .catch((e) => $.logErr(e))
  .finally(() => doneBox())

/**
 * http://boxjs.com/ => `http://boxjs.com`
 * http://boxjs.com/app/jd => `http://boxjs.com`
 */
function getHost(url) {
  return url.slice(0, url.indexOf('/', 8))
}

/**
 * http://boxjs.com/ => ``
 * http://boxjs.com/api/getdata => `/api/getdata`
 */
function getPath(url) {
  // 如果以`/`结尾, 去掉最后一个`/`
  const end = url.lastIndexOf('/') === url.length - 1 ? -1 : undefined
  // slice第二个参数传 undefined 会直接截到最后
  // indexOf第二个参数用来跳过前面的 "https://"
  return url.slice(url.indexOf('/', 8), end)
}

/**
 * ===================================
 * 处理前端请求
 * ===================================
 */

/**
 * 处理`页面`请求
 */
async function handlePage() {
  // 获取 BoxJs 数据
  const boxdata = getBoxData()
  boxdata.syscfgs.isDebugMode = false

  // 调试模式: 是否每次都获取新的页面
  const isDebugWeb = [true, 'true'].includes($.getdata('@chavy_boxjs_userCfgs.isDebugWeb'))
  const debugger_web = $.getdata('@chavy_boxjs_userCfgs.debugger_web')
  const cache = $.getjson($.KEY_web_cache, null)

  // 如果没有开启调试模式，且当前版本与缓存版本一致，且直接取缓存
  if (!isDebugWeb && cache && cache.version === $.version) {
    $.html = cache.cache
  }
  // 如果开启了调试模式，并指定了 `debugger_web` 则从指定的地址获取页面
  else {
    if (isDebugWeb && debugger_web) {
      // 调试地址后面拼时间缀, 避免 GET 缓存
      const isQueryUrl = debugger_web.includes('?')
      $.web = `${debugger_web}${isQueryUrl ? '&' : '?'}_=${new Date().getTime()}`
      boxdata.syscfgs.isDebugMode = true
      console.log(`[WARN] 调试模式: $.web = : ${$.web}`)
    }
    // 如果调用这个方法来获取缓存, 且标记为`非调试模式`
    const getcache = () => {
      console.log(`[ERROR] 调试模式: 正在使用缓存的页面!`)
      boxdata.syscfgs.isDebugMode = false
      return $.getjson($.KEY_web_cache).cache
    }
    await $.http.get($.web).then(
      (resp) => {
        if (/<title>BoxJs<\/title>/.test(resp.body)) {
          // 返回页面源码, 并马上存储到持久化仓库
          $.html = resp.body
          const cache = { version: $.version, cache: $.html }
          $.setjson(cache, $.KEY_web_cache)
        } else {
          // 如果返回的页面源码不是预期的, 则从持久化仓库中获取
          $.html = getcache()
        }
      },
      // 如果获取页面源码失败, 则从持久化仓库中获取
      () => ($.html = getcache())
    )
  }
  // 根据偏好设置, 替换首屏颜色 (如果是`auto`则交由页面自适应)
  const theme = $.getdata('@chavy_boxjs_userCfgs.theme')
  if (theme === 'light') {
    $.html = $.html.replace('#121212', '#fff')
  } else if (theme === 'dark') {
    $.html = $.html.replace('#fff', '#121212')
  }
  /**
   * 后端渲染数据, 感谢 https://t.me/eslint 提供帮助
   *
   * 如果直接渲染到 box: null 会出现双向绑定问题
   * 所以先渲染到 `boxServerData: null` 再由前端 `this.box = this.boxServerData` 实现双向绑定
   */
  $.html = $.html.replace('boxServerData: null', 'boxServerData:' + JSON.stringify(boxdata))

  // 调试模式支持 vue Devtools (只有在同时开启调试模式和指定了调试地址才生效)
  // vue.min.js 生效时, 会导致 @click="window.open()" 报 "window" is not defined 错误
  if (isDebugWeb && debugger_web) {
    $.html = $.html.replace('vue.min.js', 'vue.js')
  }
}

/**
 * 处理`查询`请求
 */
async function handleQuery() {
  const [, query] = $.path.split('/query')
  if (/^\/boxdata/.test(query)) {
    $.json = getBoxData()
  } else if (/^\/baks/.test(query)) {
    const globalbaks = getGlobalBaks(true)
    $.json = { globalbaks }
  } else if (/^\/versions$/.test(query)) {
    await getVersions(true)
  }
}

/**
 * 处理 API 请求
 */
async function handleApi() {
  const [, api] = $.path.split('/api')

  if (api === '/save') {
    await apiSave()
  } else if (api === '/addAppSub') {
    await apiAddAppSub()
  } else if (api === '/reloadAppSub') {
    await apiReloadAppSub()
  } else if (api === '/delGlobalBak') {
    await apiDelGlobalBak()
  } else if (api === '/updateGlobalBak') {
    await apiUpdateGlobalBak()
  } else if (api === '/saveGlobalBak') {
    await apiSaveGlobalBak()
  } else if (api === '/impGlobalBak') {
    await apiImpGlobalBak()
  } else if (api === '/revertGlobalBak') {
    await apiRevertGlobalBak()
  } else if (api === '/runScript') {
    await apiRunScript()
  }
}

async function handleOptions() {}

/**
 * ===================================
 * 获取基础数据
 * ===================================
 */

function getBoxData() {
  const datas = {}
  const usercfgs = getUserCfgs()
  const sessions = getAppSessions()
  const curSessions = getCurSessions()
  const sysapps = getSystemApps()
  const syscfgs = getSystemCfgs()
  const appSubCaches = getAppSubCaches()
  const globalbaks = getGlobalBaks()

  // 把 `内置应用`和`订阅应用` 里需要持久化属性放到`datas`
  sysapps.forEach((app) => Object.assign(datas, getAppDatas(app)))
  usercfgs.appsubs.forEach((sub) => {
    const subcache = appSubCaches[sub.url]
    if (subcache && subcache.apps && Array.isArray(subcache.apps)) {
      subcache.apps.forEach((app) => Object.assign(datas, getAppDatas(app)))
    }
  })

  const box = { datas, usercfgs, sessions, curSessions, sysapps, syscfgs, appSubCaches, globalbaks }
  return box
}

/**
 * 获取系统配置
 */
function getSystemCfgs() {
  // prettier-ignore
  return {
    env: $.isLoon() ? 'Loon' : $.isQuanX() ? 'QuanX' : $.isSurge() ? 'Surge' : 'Node',
    version: $.version,
    versionType: $.versionType,
    envs: [
      { id: 'Surge', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/surge.png', 'https://raw.githubusercontent.com/Orz-3/task/master/surge.png'] },
      { id: 'QuanX', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/quanX.png', 'https://raw.githubusercontent.com/Orz-3/task/master/quantumultx.png'] },
      { id: 'Loon', icons: ['https://raw.githubusercontent.com/Orz-3/mini/none/loon.png', 'https://raw.githubusercontent.com/Orz-3/task/master/loon.png'] }
    ],
    chavy: { id: 'ChavyLeung', icon: 'https://avatars3.githubusercontent.com/u/29748519', repo: 'https://github.com/chavyleung/scripts' },
    senku: { id: 'GideonSenku', icon: 'https://avatars1.githubusercontent.com/u/39037656', repo: 'https://github.com/GideonSenku' },
    id77: { id: 'id77', icon: 'https://avatars0.githubusercontent.com/u/9592236', repo: 'https://github.com/id77' },
    orz3: { id: 'Orz-3', icon: 'https://raw.githubusercontent.com/Orz-3/task/master/Orz-3.png', repo: 'https://github.com/Orz-3/' },
    boxjs: { id: 'BoxJs', show: false, icon: 'https://raw.githubusercontent.com/Orz-3/task/master/box.png', icons: ['https://raw.githubusercontent.com/Orz-3/mini/master/box.png', 'https://raw.githubusercontent.com/Orz-3/task/master/box.png'], repo: 'https://github.com/chavyleung/scripts' },
    defaultIcons: ['https://raw.githubusercontent.com/Orz-3/mini/master/appstore.png', 'https://raw.githubusercontent.com/Orz-3/task/master/appstore.png']
  }
}

/**
 * 获取内置应用
 */
function getSystemApps() {
  // prettier-ignore
  const sysapps = [
    {
      id: 'BoxSetting',
      name: '偏好设置',
      descs: ['可设置 http-api 地址 & 超时时间 (Surge TF)', '可设置明暗两种主题下的主色调'],
      keys: [
        '@chavy_boxjs_userCfgs.httpapi', 
        '@chavy_boxjs_userCfgs.bgimg', 
        '@chavy_boxjs_userCfgs.color_dark_primary', 
        '@chavy_boxjs_userCfgs.color_light_primary'
      ],
      settings: [
        { id: '@chavy_boxjs_userCfgs.httpapis', name: 'HTTP-API (Surge TF)', val: '', type: 'textarea', placeholder: ',examplekey@127.0.0.1:6166', autoGrow: true, rows: 2, persistentHint:true, desc: '示例: ,examplekey@127.0.0.1:6166! 注意: 以逗号开头, 逗号分隔多个地址, 可加回车' },
        { id: '@chavy_boxjs_userCfgs.httpapi_timeout', name: 'HTTP-API Timeout (Surge TF)', val: 20, type: 'number', persistentHint:true, desc: '如果脚本作者指定了超时时间, 会优先使用脚本指定的超时时间.' },
        { id: '@chavy_boxjs_userCfgs.bgimgs', name: '背景图片清单', val: '无,\n跟随系统,跟随系统\nlight,http://api.btstu.cn/sjbz/zsy.php\ndark,https://uploadbeta.com/api/pictures/random\n妹子,http://api.btstu.cn/sjbz/zsy.php', type: 'textarea', placeholder: '无,{回车} 跟随系统,跟随系统{回车} light,图片地址{回车} dark,图片地址{回车} 妹子,图片地址', persistentHint:true, autoGrow: true, rows: 2, desc: '逗号分隔名字和链接, 回车分隔多个地址' },
        { id: '@chavy_boxjs_userCfgs.bgimg', name: '背景图片', val: '', type: 'text', placeholder: 'http://api.btstu.cn/sjbz/zsy.php', persistentHint:true, desc: '输入背景图标的在线链接' },
        { id: '@chavy_boxjs_userCfgs.color_light_primary', name: '明亮色调', canvas: true, val: '#F7BB0E', type: 'colorpicker', desc: '' },
        { id: '@chavy_boxjs_userCfgs.color_dark_primary', name: '暗黑色调', canvas: true, val: '#2196F3', type: 'colorpicker', desc: '' }
      ],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/blob/master/box/switcher/box.switcher.js',
      icons: [
        'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSetting.mini.png', 
        'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSetting.png'
      ]
    },
    {
      id: 'BoxSwitcher',
      name: '会话切换',
      desc: '打开静默运行后, 切换会话将不再发出系统通知 \n注: 不影响日志记录',
      keys: [],
      settings: [{ id: 'CFG_BoxSwitcher_isSilent', name: '静默运行', val: false, type: 'boolean', desc: '切换会话时不发出系统通知!' }],
      author: '@chavyleung',
      repo: 'https://github.com/chavyleung/scripts/blob/master/box/switcher/box.switcher.js',
      icons: [
        'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSwitcher.mini.png', 
        'https://raw.githubusercontent.com/chavyleung/scripts/master/box/icons/BoxSwitcher.png'
      ],
      script: 'https://raw.githubusercontent.com/chavyleung/scripts/master/box/switcher/box.switcher.js'
    }
  ]
  return sysapps
}

/**
 * 获取用户配置
 */
function getUserCfgs() {
  const defcfgs = { favapps: [], appsubs: [], isPinedSearchBar: true, httpapi: 'examplekey@127.0.0.1:6166' }
  const usercfgs = Object.assign(defcfgs, $.getjson($.KEY_usercfgs, {}))
  return usercfgs
}

/**
 * 获取`应用订阅`缓存
 */
function getAppSubCaches() {
  return $.getjson($.KEY_app_subCaches, {})
}

/**
 * 获取全局备份
 * 默认只获取备份的基础信息, 如: id, name……
 *
 * @param {boolean} isComplete 是否获取完整的备份数据
 */
function getGlobalBaks(isComplete = false) {
  const globalbaks = $.getjson($.KEY_globalBaks, [])
  if (isComplete) {
    return globalbaks
  } else {
    // isComplete === false: 不返回备份体
    globalbaks.forEach((bak) => delete bak.bak)
    return globalbaks
  }
}
/**
 * 获取版本清单
 */
function getVersions() {
  return $.http.get($.ver).then(
    (resp) => {
      try {
        $.json = $.toObj(resp.body)
      } catch {
        $.json = {}
      }
    },
    () => ($.json = {})
  )
}

/**
 * 获取用户应用
 */
function getUserApps() {
  // TODO 用户可在 BoxJs 中自定义应用, 格式与应用订阅一致
  return []
}

/**
 * 获取应用会话
 */
function getAppSessions() {
  return $.getjson($.KEY_sessions, [])
}

/**
 * 获取当前切换到哪个会话
 */
function getCurSessions() {
  return $.getjson($.KEY_cursessions, {})
}

/**
 * ===================================
 * 接口类函数
 * ===================================
 */

function getAppDatas(app) {
  const datas = {}
  const nulls = [null, undefined, 'null', 'undefined']
  if (app.keys && Array.isArray(app.keys)) {
    app.keys.forEach((key) => {
      const val = $.getdata(key)
      datas[key] = nulls.includes(val) ? null : val
    })
  }
  if (app.settings && Array.isArray(app.settings)) {
    app.settings.forEach((setting) => {
      const key = setting.id
      const val = $.getdata(key)
      datas[key] = nulls.includes(val) ? null : val
    })
  }
  return datas
}

async function apiSave() {
  const data = $.toObj($request.body)
  if (Array.isArray(data)) {
    data.forEach((dat) => $.setdata(dat.val, dat.key))
  } else {
    $.setdata(data.val, data.key)
  }
  $.json = getBoxData()
}

async function apiAddAppSub() {
  const sub = $.toObj($request.body)
  // 添加订阅
  const usercfgs = getUserCfgs()
  usercfgs.appsubs.push(sub)
  $.setjson(usercfgs, $.KEY_usercfgs)
  // 加载订阅缓存
  await reloadAppSubCache(sub.url)
  $.json = getBoxData()
}

async function apiReloadAppSub() {
  const sub = $.toObj($request.body)
  if (sub) {
    await reloadAppSubCache(sub.url)
  } else {
    await reloadAppSubCaches()
  }
  $.json = getBoxData()
}

async function apiDelGlobalBak() {
  const bak = $.toObj($request.body)
  const globalbaks = $.getjson($.KEY_globalBaks, [])
  const bakIdx = globalbaks.findIndex((b) => b.id === bak.id)
  if (bakIdx > -1) {
    globalbaks.splice(bakIdx, 1)
    $.setjson(globalbaks, $.KEY_globalBaks)
  }
  $.json = getBoxData()
}

async function apiUpdateGlobalBak() {
  const { id: bakId, name: bakName } = $.toObj($request.body)
  const globalbaks = $.getjson($.KEY_globalBaks, [])
  const bak = globalbaks.find((b) => b.id === bakId)
  if (bak) {
    bak.name = bakName
    $.setjson(globalbaks, $.KEY_globalBaks)
  }
  $.json = { globalbaks }
}

async function apiRevertGlobalBak() {
  const { id: bakId } = $.toObj($request.body)
  const globalbaks = $.getjson($.KEY_globalBaks, [])
  const bak = globalbaks.find((b) => b.id === bakId)
  if (bak && bak.bak) {
    const {
      chavy_boxjs_sysCfgs,
      chavy_boxjs_sysApps,
      chavy_boxjs_sessions,
      chavy_boxjs_userCfgs,
      chavy_boxjs_cur_sessions,
      chavy_boxjs_app_subCaches,
      ...datas
    } = bak.bak
    $.setdata(JSON.stringify(chavy_boxjs_sessions), $.KEY_sessions)
    $.setdata(JSON.stringify(chavy_boxjs_userCfgs), $.KEY_usercfgs)
    $.setdata(JSON.stringify(chavy_boxjs_cur_sessions), $.KEY_cursessions)
    $.setdata(JSON.stringify(chavy_boxjs_app_subCaches), $.KEY_app_subCaches)
    const isNull = (val) => [undefined, null, 'null', 'undefined', ''].includes(val)
    Object.keys(datas).forEach((datkey) => $.setdata(isNull(datas[datkey]) ? '' : `${datas[datkey]}`, datkey))
  }
  const boxdata = getBoxData()
  boxdata.globalbaks = globalbaks
  $.json = boxdata
}

async function apiSaveGlobalBak() {
  let globalbaks = $.getjson($.KEY_globalBaks, [])
  const bak = $.toObj($request.body)
  const box = getBoxData()
  const bakdata = {}
  bakdata['chavy_boxjs_userCfgs'] = box.usercfgs
  bakdata['chavy_boxjs_sessions'] = box.sessions
  bakdata['chavy_boxjs_cur_sessions'] = box.curSessions
  bakdata['chavy_boxjs_app_subCaches'] = box.appSubCaches
  Object.assign(bakdata, box.datas)
  bak.bak = bakdata
  globalbaks.push(bak)
  if (!$.setjson(globalbaks, $.KEY_globalBaks)) {
    globalbaks = $.getjson($.KEY_globalBaks, [])
  }
  $.json = { globalbaks }
}

async function apiImpGlobalBak() {
  let globalbaks = $.getjson($.KEY_globalBaks, [])
  const bak = $.toObj($request.body)
  globalbaks.push(bak)
  $.setjson(globalbaks, $.KEY_globalBaks)
  $.json = { globalbaks }
}

async function apiRunScript() {
  // 取消勿扰模式
  $.isMute = false
  const opts = $.toObj($request.body)
  const httpapi = $.getdata('@chavy_boxjs_userCfgs.httpapi')
  const ishttpapi = /.*?@.*?:[0-9]+/.test(httpapi)
  let script_text = null
  if (opts.isRemote) {
    await $.getScript(opts.url).then((script) => (script_text = script))
  } else {
    script_text = opts.script
  }
  if ($.isSurge() && ishttpapi) {
    const runOpts = { timeout: opts.timeout }
    await $.runScript(script_text, runOpts).then((resp) => ($.json = JSON.parse(resp)))
  } else {
    await new Promise((resolve) => {
      $eval_env.resolve = resolve
      // 避免被执行脚本误认为是 rewrite 环境
      // 所以需要 `$request = undefined`
      $eval_env.request = $request
      $request = undefined
      // 重写 console.log, 把日志记录到 $.cached_logs
      $.cached_logs = []
      console.cloned_log = console.log
      console.log = (l) => {
        console.cloned_log(l)
        $.cached_logs.push(l)
      }
      // 重写脚本内的 $done, 调用 $done() 即是调用 $eval_env.resolve()
      script_text = script_text.replace(/\$done/g, '$eval_env.resolve')
      script_text = script_text.replace(/\$\.done/g, '$eval_env.resolve')
      try {
        eval(script_text)
      } catch (e) {
        $.cached_logs.push(e)
        resolve()
      }
    })
    // 还原 console.log
    console.log = console.cloned_log
    // 还原 $request
    $request = $eval_env.request
    // 返回数据
    $.json = {
      result: '',
      output: $.cached_logs.join('\n')
    }
  }
}

/**
 * ===================================
 * 工具类函数
 * ===================================
 */

function reloadAppSubCache(url) {
  return $.http.get(url).then((resp) => {
    try {
      const subcaches = getAppSubCaches()
      subcaches[url] = $.toObj(resp.body)
      subcaches[url].updateTime = new Date()
      $.setjson(subcaches, $.KEY_app_subCaches)
      $.log(`更新订阅, 成功! ${url}`)
    } catch (e) {
      $.logErr(e)
      $.log(`更新订阅, 失败! ${url}`)
    }
  })
}

async function reloadAppSubCaches() {
  $.msg($.name, '更新订阅: 开始!')
  const reloadActs = []
  const usercfgs = getUserCfgs()
  usercfgs.appsubs.forEach((sub) => {
    reloadActs.push(reloadAppSubCache(sub.url))
  })
  await Promise.all(reloadActs)
  $.log(`全部订阅, 完成!`)
  const endTime = new Date().getTime()
  const costTime = (endTime - $.startTime) / 1000
  $.msg($.name, `更新订阅: 完成! 🕛 ${costTime} 秒`)
}

function upgradeUserData() {
  const usercfgs = getUserCfgs()
  // 如果存在`usercfgs.appsubCaches`则需要升级数据
  const isNeedUpgrade = !!usercfgs.appsubCaches
  if (isNeedUpgrade) {
    // 迁移订阅缓存至独立的持久化空间
    $.setjson(usercfgs.appsubCaches, $.KEY_app_subCaches)
    // 移除用户偏好中的订阅缓存
    delete usercfgs.appsubCaches
    usercfgs.appsubs.forEach((sub) => {
      delete sub._raw
      delete sub.apps
      delete sub.isErr
      delete sub.updateTime
    })
  }
  if (isNeedUpgrade) {
    $.setjson(usercfgs, $.KEY_usercfgs)
  }
}

/**
 * ===================================
 * 结束类函数
 * ===================================
 */
function doneBox() {
  // 记录当前使用哪个域名访问
  $.setdata(getHost($request.url), $.KEY_boxjs_host)
  if ($.isOptions) doneOptions()
  else if ($.isPage) donePage()
  else if ($.isQuery) doneQuery()
  else if ($.isApi) doneApi()
  else $.done()
}

function getBaseDoneHeaders(mixHeaders = {}) {
  return Object.assign(
    {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,GET,OPTIONS,PUT,DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    mixHeaders
  )
}

function getHtmlDoneHeaders() {
  return getBaseDoneHeaders({
    'Content-Type': 'text/html;charset=UTF-8'
  })
}
function getJsonDoneHeaders() {
  return getBaseDoneHeaders({
    'Content-Type': 'text/json; charset=utf-8'
  })
}

function doneOptions() {
  const headers = getBaseDoneHeaders()
  if ($.isSurge() || $.isLoon()) {
    $.done({ response: { headers } })
  } else if ($.isQuanX()) {
    $.done({ headers })
  }
}

function donePage() {
  const headers = getHtmlDoneHeaders()
  if ($.isSurge() || $.isLoon()) {
    $.done({ response: { status: 200, headers, body: $.html } })
  } else if ($.isQuanX()) {
    $.done({ status: 'HTTP/1.1 200', headers, body: $.html })
  }
}

function doneQuery() {
  $.json = $.toStr($.json)
  const headers = getJsonDoneHeaders()
  if ($.isSurge() || $.isLoon()) {
    $.done({ response: { status: 200, headers, body: $.json } })
  } else if ($.isQuanX()) {
    $.done({ status: 'HTTP/1.1 200', headers, body: $.json })
  }
}

function doneApi() {
  $.json = $.toStr($.json)
  const headers = getJsonDoneHeaders()
  if ($.isSurge() || $.isLoon()) {
    $.done({ response: { status: 200, headers, body: $.json } })
  } else if ($.isQuanX()) {
    $.done({ status: 'HTTP/1.1 200', headers, body: $.json })
  }
}

/**
 * GistBox by https://github.com/Peng-YM
 */
// prettier-ignore
function GistBox(e){const t=function(e,t={}){const{isQX:s,isLoon:n,isSurge:o}=function(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!this.isLoon,n="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!n,isJSBox:n}}(),r={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(i=>r[i.toLowerCase()]=(r=>(function(r,i){(i="string"==typeof i?{url:i}:i).url=e?e+i.url:i.url;const a=(i={...t,...i}).timeout,u={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...i.events};let c,d;u.onRequest(r,i),c=s?$task.fetch({method:r,...i}):new Promise((e,t)=>{(o||n?$httpClient:require("request"))[r.toLowerCase()](i,(s,n,o)=>{s?t(s):e({statusCode:n.status||n.statusCode,headers:n.headers,body:o})})});const f=a?new Promise((e,t)=>{d=setTimeout(()=>(u.onTimeout(),t(`${r} URL: ${i.url} exceeds the timeout ${a} ms`)),a)}):null;return(f?Promise.race([f,c]).then(e=>(clearTimeout(d),e)):c).then(e=>u.onResponse(e))})(i,r))),r}("https://api.github.com",{headers:{Authorization:`token ${e}`,"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.141 Safari/537.36"},events:{onResponse:e=>String(e.statusCode).startsWith("4")?Promise.reject(`ERROR: ${JSON.parse(e.body).message}`):e}}),s=e=>`boxjs.bak.${e}.json`,n=e=>e.match(/boxjs\.bak\.(\d+)\.json/)[1];return new class{async findDatabase(){return t.get("/gists").then(e=>{const t=JSON.parse(e.body);for(let e of t)if("BoxJs Gist"===e.description)return e.id;return-1})}async createDatabase(e){e instanceof Array||(e=[e]);const n={};return e.forEach(e=>{n[s(e.time)]={content:e.content}}),t.post({url:"/gists",body:JSON.stringify({description:"BoxJs Gist",public:!1,files:n})}).then(e=>JSON.parse(e.body).id)}async deleteDatabase(e){return t.delete(`/gists/${e}`)}async getBackups(e){const s=await t.get(`/gists/${e}`).then(e=>JSON.parse(e.body)),{files:o}=s,r=[];for(let e of Object.keys(o))r.push({time:n(e),url:o[e].raw_url});return r}async addBackups(e,t){t instanceof Array||(t=[t]);const n={};return t.forEach(e=>n[s(e.time)]={content:e.content}),this.updateBackups(e,n)}async deleteBackups(e,t){t instanceof Array||(t=[t]);const n={};return t.forEach(e=>n[s(e)]={}),this.updateBackups(e,n)}async updateBackups(e,s){return t.patch({url:`/gists/${e}`,body:JSON.stringify({files:s})})}}}

/**
 * EnvJs
 */
// prettier-ignore
function Env(t,s){class e{constructor(t){this.env=t}send(t,s="GET"){t="string"==typeof t?{url:t}:t;let e=this.get;return"POST"===s&&(e=this.post),new Promise((s,i)=>{e.call(this,t,(t,e,o)=>{t?i(t):s(e)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,s){this.name=t,this.http=new e(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,s=null){try{return JSON.parse(t)}catch{return s}}toStr(t,s=null){try{return JSON.stringify(t)}catch{return s}}getjson(t,s){let e=s;const i=this.getdata(t);if(i)try{e=JSON.parse(this.getdata(t))}catch{}return e}setjson(t,s){try{return this.setdata(JSON.stringify(t),s)}catch{return!1}}getScript(t){return new Promise(s=>{this.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};this.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=this.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;this.isMute||(this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o)));let a=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];a.push(s),e&&a.push(e),i&&a.push(i),console.log(a.join("\n")),this.logs=this.logs.concat(a)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
