// 引入 fs 和 path 模块
const fs = require('fs')
const path = require('path')
const { ipcRenderer, shell } = require('electron')
const openBtn = require('../../../main/modules/ipcEvent')

// 读取config.json
const configPath = path.resolve(__dirname, '../../../../config/config.json')
const jsonContent = fs.readFileSync(configPath, 'utf-8')

// 解析JSON
const _config = JSON.parse(jsonContent)


const width = 300           // 单个元素宽度
const height = 240          // 单个元素高度
const gap = 20              // 间隔

let column = 3              // 单行显示个数
let clientWidth = 0         // 虚拟列表容器可视区宽度   
let clientHeight = 0        // 虚拟列表容器可视区高度
let isAnimate = false       // 动画标识，仅在 column 发生变化时执行
let visibleList = []        // 可见列表，初始为空
let catchList = []          // 缓存列表
let catchKeys = {}          // 缓存key
let placeholderHeight = 0   // 占位高度
let scrollTop = 0           // 滚动条高度
let catchIndex = 0          // 缓存下标
let catchScrollTop = 0      // 缓存滚动高度

let selectedImgFile = null  // 用于存储选中的图片文件

let clientWidthView = 0
let clientHeightView = 0

let naturalWidth = 0        // 图片实际宽度
let naturalHeight = 0       // 图片实际高度
let ratio = 0               // 图片比例

let updateScrollTop = debounce((top) => {
    isAnimate = false
    scrollTop = top
    updateVisibleList()
}, 50)


const targetElement = document.documentElement
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
            updateVisibleList()
        }
    })
})

// 配置观察选项
const config = { attributes: true, subtree: true }

// 开始观察目标元素
observer.observe(targetElement, config)

// 更新虚拟列表
function updateVisibleList() {
    let startIndex = catchIndex
    let startItem = catchList[startIndex]
    if (!startItem) return

    let top = scrollTop - clientHeight * 1.5
    let bottom = scrollTop + clientHeight * 2.5
    let len = catchList.length

    const find = (index, catchList, comparefun) => {
        let startIndex = index
        let endIndex = index + 1
        let startState = true
        let endState = true
        let len = catchList.length
        let list = []

        while (startState || endState) {
            if (startState) {
                if (startIndex >= 0) {
                    let item = catchList[startIndex]
                    if (item && comparefun(item)) {
                        list.push(item)
                        startIndex--
                    } else {
                        startState = false
                    }
                } else {
                    startState = false
                }
            }

            if (endState) {
                if (endIndex < len) {
                    let item = catchList[endIndex]
                    if (item && comparefun(item)) {
                        list.push(item)
                        endIndex++
                    } else {
                        endState = false
                    }
                } else {
                    endState = false
                }
            }
        }
        return list
    }

    // 当前缓存下标不在范围内
    if (!(startItem._top > top && startItem._top < bottom)) {
        let scrollSize = catchScrollTop - scrollTop
        let func = scrollSize < 0 ? (i, z = 1) => i + z : (i, z = 1) => i - z

        if (Math.abs(scrollSize) > 3000) {
            startIndex = func(startIndex, (parseInt(Math.abs(scrollSize) / 350)) * column)
            startIndex = scrollSize < 0 ? Math.min(len - 1, startIndex) : Math.max(0, startIndex)
        }

        let flag = true
        let endIndex = startIndex

        while (flag) {
            --startIndex
            ++endIndex

            let img = catchList[startIndex]
            let img2 = catchList[endIndex]

            if (img && img._top > top && img._top < bottom) {
                flag = false
            }

            if (img2 && img2._top > top && img2._top < bottom) {
                flag = false
                startIndex = endIndex
            }

            if (startIndex <= 0 && endIndex >= len) {
                flag = false
            }
        }

        // 更新下标
        catchIndex = startIndex
    }

    visibleList = Object.freeze(find(startIndex, catchList, (img) => img._top > top && img._top < bottom))
    catchScrollTop = scrollTop

    renderImages(visibleList)

}

// 下载图片
async function downloadImage(url, picPath) {

    // 获取文件名
    const fileName = url.split('/').pop()

    // 创建目录
    const createDirectory = (dirPath) => {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    // 指定工作目录
    const dir = path.join(process.cwd(), `/cache/wallpaper-gallery/`, picPath)
    createDirectory(dir)

    const filePath = path.join(dir, fileName)

    // 判断文件是否存在
    if (!fs.existsSync(filePath)) {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 60 * 1000)
            const response = await fetch(url, { signal: controller.signal })
            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error(`下载图片失败：${response.status} ${response.statusText}`)
            }

            const buffer = await response.arrayBuffer()
            fs.writeFileSync(filePath, Buffer.from(buffer))
        } catch (error) {
            showMessage(error, 'error')
        }
    }

    return filePath
}

// 获取图片数据
async function getList(reset = false) {
    try {

        const response = await fetch(`${_config.wallpaper.bzlist}`, { method: 'GET' })
        if (response.ok) {
            const data = await response.json()

            document.querySelector('.visible-result span').innerHTML = `共 ${data.length} 张壁纸`

            // 下载所有图片或使用已下载的本地图片
            const downloadTasks = data.map(async (imageData) => {
                const filePath = await downloadImage(imageData.poster, 'blurryPic')
                // 使用本地图片路径替换远程路径
                imageData.poster = filePath.replaceAll('\\', '/')
            })

            // 等待所有下载任务完成
            await Promise.all(downloadTasks)

            // 添加处理器
            addHandler(data, reset)

            // 渲染标签
            renderTags(data)

            // 渲染图片
            renderImages(data)

            // 添加点击事件处理器
            addClickHandler()

        } else {
            throw new Error('网络响应不正常')
        }

    } catch (error) {
        console.log(error)
        skeleton = false
        showMessage(error, 'error')
    } finally {
        skeleton = false
    }

    const tabItem = Array.from(document.querySelectorAll('.checkbox-item'))

    let currentTagName = '' // 当前选中的标签名

    function tabItemClickHandler(event) {
        const tagName = event.target.textContent

        if (currentTagName !== tagName) {
            currentTagName = tagName

            tabItem.forEach(element => element.classList.remove('active'))
            event.target.classList.add('active')

            if (tagName === '全部') {
                fetchData() // 更新请求数据时清空 visibleList 元素和更新图片列表
            } else {
                fetchData(tagName)
            }
        }
    }

    tabItem.forEach((item) => {
        item.addEventListener('click', tabItemClickHandler)     // 绑定新的事件处理器
    })
}

async function fetchData(tagName = '') {

    const visibleList = document.querySelector('.visible-list')
    // 开启loading加载动画
    loading = true

    setTimeout(async () => {
        try {
            const response = await fetch(`${_config.wallpaper.bzlist}${tagName ? `?tagName=${tagName}` : ''}`, { method: 'GET' })
            if (response.ok) {
                visibleList.innerHTML = '' // 清空 visible-list 元素
                const data = await response.json()
                document.querySelector('.visible-result span').innerHTML = `共 ${data.length} 张壁纸`
                // 下载所有图片或使用已下载的本地图片
                const downloadTasks = data.map(async (imageData) => {
                    const filePath = await downloadImage(imageData.poster, 'blurryPic')
                    // 使用本地图片路径替换远程路径
                    imageData.poster = filePath.replaceAll('\\', '/')
                })

                // 等待所有下载任务完成
                await Promise.all(downloadTasks)

                addHandler(data, true)
                renderImages(data)
                addClickHandler()
            } else {
                throw new Error('网络响应不正常')
            }
            skeleton = false
        } catch (error) {
            skeleton = false
            showMessage(error, 'error')
        } finally {
            loading = false
        }
    }, 1000)

}

// 获取分类标签数据
async function getTagList(element) {
    try {
        const categorySelect = element

        const response = await fetch(`${_config.wallpaper.tagList}`)
        const data = await response.json()
        data.forEach(item => {
            const option = document.createElement('option')
            option.value = item.tag
            option.text = item.tag
            categorySelect.appendChild(option)
        })
    } catch (error) {
        showMessage(error, 'error')
    }
}

let setDesktopHandlerBound = false  // 是否已经绑定了设为桌面事件

function addClickHandler() {
    addPosterClickHandler()

    const setDesktop = document.getElementById('setDesktop')
    const viewInfo = document.getElementById('viewInfo')
    const viewInfoDialog = document.getElementById('viewInfoDialog')
    const viewInfoClose = document.getElementById('viewInfoClose')

    if (!setDesktopHandlerBound) {
        // 设为桌面监听
        setDesktop.addEventListener('click', async (event) => {
            var storedUrl = localStorage.getItem('storedUrl')
            setWallpaperDeskTop(event, storedUrl, 'highResPic')
        })
        setDesktopHandlerBound = true
    }

    // 监听查看信息事件
    viewInfo.addEventListener('click', () => {
        viewInfoDialog.classList.add('active')
    })

    // 监听查看信息关闭事件
    viewInfoClose.addEventListener('click', () => {
        viewInfoDialog.classList.remove('active')
    })

}

function addPosterClickHandler() {
    const poster = document.querySelectorAll('#poster')
    const viewDetails = document.querySelectorAll('#viewDetails')

    // 点击图片区域监听
    poster.forEach((item, index) => {
        item.addEventListener('click', (event) => clickHandler(event, index))
        viewDetails[index].addEventListener('click', (event) => clickHandler(event, index))
    })
}

// 渲染图片
function renderImages(visibleList) {
    for (const item of visibleList) {
        updateImageCard(item)
    }
}

function clickHandler(event, index) {
    const listItem = document.querySelectorAll('.visible-list-item')
    let id = listItem[index].id
    imageView(event, id)
}

// 壁纸应用桌面
async function setWallpaperDeskTop(event, src, picPath) {

    loading = true
    showMessage('正在设置壁纸，请稍等...', 'warning')

    // 创建目录
    const createDirectory = (dirPath) => {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    try {
        // 获取文件名
        const fileName = src.split('/').pop()
        // 获取文件后缀名
        const fileExtension = fileName.split('.').pop()
        const dir = path.join(process.cwd(), '/cache/wallpaper-gallery/', picPath)

        createDirectory(dir)

        const filePath = path.join(dir, fileName)

        // 判断文件是否存在
        if (!fs.existsSync(filePath)) {
            await downloadFile(src, filePath)
        }

        switch (fileExtension) {
            case 'png':
                setTimeout(() => {
                    ipcRenderer.send('set-wallpaper', filePath)
                    ipcRenderer.invoke('ask-close-wallpaper')
                    showMessage('静态壁纸设置成功', 'success')
                    loading = false
                }, 1500);
                break
            case 'mp4':
                setTimeout(() => {
                    openBtn.openChildWind(event, 'mp4', filePath)
                    showMessage('动态壁纸设置成功', 'success')
                    loading = false
                }, 1500)
                break
            default:
                break
        }

    } catch (error) {
        loading = false
        showMessage(error, 'error')
    }
}

// 文件下载函数
async function downloadFile(src, filePath) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60 * 1000)
    const response = await fetch(src, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
        throw new Error(`下载图片失败：${response.status} ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(buffer))
}

async function imageView(event, id) {

    const animationContent = document.querySelector('.animation-content')
    const closeButton = document.querySelector('.icon-guanbi')

    closeButton.removeEventListener('click', closeImageView)

    // 为关闭按钮添加新的点击事件监听器
    closeButton.addEventListener('click', closeImageView)

    const { userId, token } = getCurrentUser()

    const jsonData = {
        "uId": userId,
        "token": token,
        "bzId": parseInt(id)
    }

    const img = document.querySelector('.img-view img')
    const video = document.querySelector('.img-view video')

    try {
        const response = await fetch(`${_config.wallpaper.getUrlByImgId}`, {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'content-type': 'application/json'
            }
        })

        const result = await response.json()

        if (result.code === '10400') {
            showMessage('会员壁纸无权限查看', 'error')
            return
        }

        const filePath = await new Promise((resolve) => {
            downloadImage(result.data.url, 'highResPic')
                .then((filePath) => resolve(filePath))
                .catch(() => {
                    showMessage('下载图片出错', 'error')
                    resolve(null)
                })
        })

        if (filePath) {
            // 使用本地图片路径替换远程路径
            result.data.url = filePath.replaceAll('\\', '/')

            if (result.data.source === 'png') {
                const isLocalFileExists = fs.existsSync(filePath)
                video.style.display = 'none'
                img.style.display = 'block'
                img.src = isLocalFileExists ? filePath : result.data.url

                animationContent.classList.add('active')

                if (isLocalFileExists) {
                    initImage(event)
                }
            } else if (result.data.source === 'mp4') {
                const isLocalFileExists = fs.existsSync(filePath)
                img.style.display = 'none'
                video.style.display = 'block'
                video.src = isLocalFileExists ? filePath : result.data.url

                animationContent.classList.add('active')

            }

            updateWallpaperInfo(result.data)
            localStorage.setItem('storedUrl', result.data.url)
        }

    } catch (error) {
        console.log(error)
        loading = false
        showMessage('请求出错', 'error')
    }
}

function closeImageView() {
    const animationContent = document.querySelector('.animation-content')
    animationContent.classList.remove('active')

    const viewInfoDialog = document.getElementById('viewInfoDialog')
    viewInfoDialog.classList.remove('active')

    const img = document.querySelector('.img-view img')
    const video = document.querySelector('.img-view video')

    img.src = ''
    video.src = ''
}

// 更新壁纸详情信息
function updateWallpaperInfo(data) {
    const wallpaperId = document.querySelector('.wallpaper-id')
    const label = document.querySelector('.label')
    const rarityData = document.querySelector('.rarity-detail')
    const author = document.querySelector('.author')
    const authorAvatar = document.querySelector('.author-avatar img')
    const uploadDate = document.querySelector('.upload-date')
    const imgSource = document.querySelector('.img-source')

    wallpaperId.innerHTML = `壁纸ID：${data.id}`
    label.innerHTML = `标签分类：${data.tagName}`

    if (data.rarityData !== '官方限定') {
        rarityData.innerHTML = `壁纸稀有度：${data.rarityData}`
        rarityData.style.color = `${setRarityColor(data.rarityData)}`
    } else {
        rarityData.innerHTML = ''
        rarityData.style.color = ''
    }

    authorAvatar.src = `${data.createUser === 'system' ? '../../image/qiudi.jpg' : `http://q1.qlogo.cn/g?b=qq&nk=${data.createUser}&s=100`}`
    author.innerHTML = `作者：${data.createUser === 'system' ? '官方壁纸' : (data.createUser)}`
    var dateArray = data.dateStr.split('-')
    var formattedDate = dateArray[0] + '年' + dateArray[1] + '月' + dateArray[2] + '日'
    uploadDate.innerHTML = `上传日期：${formattedDate}`
    if (data.fromPic) {
        imgSource.innerHTML = `作品出处：${data.fromPic}`
    } else {
        imgSource.innerHTML = ''
    }
}

// 获取用户信息
function getCurrentUser() {
    const users = localStorage.getItem('users')
    if (!users) return {}

    const userList = JSON.parse(users)
    const currentUserId = localStorage.getItem('userId')

    const currentUser = userList.find((user) => user.userId == currentUserId)
    if (!currentUser) return {}

    const { userId, token } = currentUser
    return { userId, token }
}

// 设置稀有度颜色
function setRarityColor(rarityData) {
    let color = ''
    switch (rarityData) {
        case 'F':
        case 'E':
        case 'D':
        case 'C':
        case 'B':
        case 'A':
            color = '#66ccff' // 蓝色
            break
        case 'S':
        case 'SS':
        case 'SSS':
            color = '#FFDF00' // 金色
            break
        default:
            break
    }
    return color
}

// 详情页图片初始化
function initImage(event) {
    let { x, y } = event.target.getClientRects()[0]

    const resize = () => {
        let { width, height } = document.documentElement.getBoundingClientRect()
        clientWidthView = width
        clientHeightView = height
    }

    resize()

    window.addEventListener('resize', resize)
    window.addEventListener("beforeunload", function () {
        window.removeEventListener("resize", resize)
    })
    let imgStyle = {
        width: '300px',
        height: '200px',
        transform: `translate(${(clientWidthView - 300) / 2}px, ${(clientHeightView - 200) / 2}px)`
    }

    const imgView = document.querySelector('.imgView')
    imgView.onload = function () {
        naturalWidth = this.naturalWidth
        naturalHeight = this.naturalHeight
        ratio = naturalWidth / naturalHeight
    }
    imgView.style.width = imgStyle.width
    imgView.style.height = imgStyle.height
    imgView.style.transform = imgStyle.transform

    nextTick(() => {
        const keyframes = [
            { transform: `translate(${x}px, ${y}px)` },
            { transform: imgStyle.transform }
        ]

        const options = {
            duration: 500,
            easing: "cubic-bezier(0, 0, 0.32, 1)"
        }

        const animate = imgView.animate(keyframes, options)

        animate.onfinish = () => {
            const { width, height } = aspectRatioToWH(clientWidthView - 200, clientHeightView - 200, ratio, naturalWidth, naturalHeight)
            imgStyle = {
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate(${(clientWidthView - width) / 2}px, ${(clientHeightView - height) / 2}px)`
            }
            imgView.style.width = imgStyle.width
            imgView.style.height = imgStyle.height
            imgView.style.transform = imgStyle.transform
        }
    })
}

// 更新图片
function updateImageCard(item) {
    const imgContainer = document.querySelector('.visible-list')
    const existingImage = document.getElementById(item.id)

    if (existingImage) {
        // 图片元素已存在，更新属性和内容
        existingImage.style.transform = item.style.transform

        // 过渡动画
        const prevImgs = document.querySelectorAll('.visible-list-item')
        if (prevImgs && isAnimate) {
            isAnimate = false
            const prevPositions = getTransforms(prevImgs)
            nextTick(() => {
                const currentPositions = getTransforms(prevImgs)

                prevImgs.forEach((imgRef) => {
                    const id = imgRef.id
                    const currentPosition = currentPositions.get(id)
                    let prevPosition = prevPositions.get(id)

                    if (!prevPosition) {
                        prevPosition = `translate(${getRandom(0, clientWidth)}px, ${getRandom(top, bottom)}px)`
                    }
                    const keyframes = [
                        { transform: prevPosition },
                        { transform: currentPosition },
                    ]

                    const options = {
                        duration: 600,
                        easing: "cubic-bezier(0, 0, 0.32, 1)",
                    }

                    imgRef.animate(keyframes, options)
                })
            })
        }

    } else {
        // 图片元素不存在，创建新元素并添加到 imgContainer
        const newImage = renderImageCard(item)
        imgContainer.appendChild(newImage)
    }
}

// 渲染标签
async function renderTags(visibleList) {
    const tagSet = new Set()
    const checkboxValue = document.querySelector('.checkbox-value')
    const more = document.querySelector('.more')
    const tagValue = document.querySelector('.more .checkbox-value')
    const moreIcon = document.querySelector('.more-icon')

    more.style.display = 'none'

    visibleList.forEach(item => {
        tagSet.add(item.tag)   // 将每个标签添加到Set集合中
    })

    const uniqueTags = Array.from(tagSet)

    // 如果标签数量超过12个
    if (uniqueTags.length > 12) {
        const slicedTags = uniqueTags.slice(0, 12)
        const moreTags = uniqueTags.slice(12)

        slicedTags.forEach(uniqueTag => {
            const tagElement = document.createElement('div')
            tagElement.classList.add('checkbox-item')
            tagElement.innerHTML = uniqueTag
            tagValue.appendChild(tagElement)
        })

        moreTags.forEach(uniqueTag => {
            const tagElement = document.createElement('div')
            tagElement.classList.add('checkbox-item')
            tagElement.innerHTML = uniqueTag
            checkboxValue.appendChild(tagElement)
        })

        moreIcon.style.display = 'block'

    } else {
        uniqueTags.forEach(uniqueTag => {
            const tagElement = document.createElement('div')
            tagElement.classList.add('checkbox-item')
            tagElement.innerHTML = uniqueTag
            checkboxValue.appendChild(tagElement)
        })
        moreIcon.style.display = 'none'
    }
}

// 渲染图片卡片
function renderImageCard(item) {
    const listItem = document.createElement('li')
    listItem.classList.add('visible-list-item')
    listItem.style.width = item.style.width
    listItem.style.height = item.style.height
    listItem.style.transform = item.style.transform
    listItem.setAttribute('id', item.id)

    // 定义有效的稀有度值数组
    const validRarities = ['SSS', 'SS', 'S']

    const html = `
        <div class="img">
            <img id="poster" draggable="false" src="${item.poster}" style="height: ${item.style.height}"/>
            <div class="img-info">
                <span style="color:${item.free === 0 || item.free === 1 ? '#00FF00' : ''}">
                    ${item.free === 0 ? '会员' : (item.free === 1 ? '免费' : '')}
                </span>
                <span style="color:${item.type === 0 || item.type === 1 ? '#FF69B4' : ''}">
                    ${item.type === 0 ? '静态壁纸' : (item.type === 1 ? '动态壁纸' : '')}
                </span>
            </div>
        </div>
        <div class="desc">
            <span class="rarityData" style="color: ${validRarities.includes(item.rarityData) ? '#FFDF00' : '#66ccff'}">
                稀有度：${item.rarityData}
            </span>
            <span id="viewDetails" class="iconfont icon-view-fill" title="查看" style="cursor: pointer"></span>
        </div>
    `
    listItem.innerHTML = html

    return listItem
}

// 添加事件处理器
function addHandler(imgs, reset = false) {
    if (reset) {
        resetHandle(column)
    }
    const newImgs = []
    imgs.forEach(img => {
        if (!catchKeys[img.id]) {
            const minIndex = minValIndex(this.sumHeight)
            img._top = this.sumHeight[minIndex]
            img.style = {
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate(${minIndex * (width + gap)}px, ${this.sumHeight[minIndex]}px)`
            }

            this.sumHeight[minIndex] += height + gap
            newImgs.push(img)
            catchKeys[img.id] = true
        }
    })

    catchList.push(...newImgs)
    placeholderHeight = maxVal(this.sumHeight)

    document.querySelector('.placeholderHeight').style.height = `${placeholderHeight}px`
}

// 重置处理器
function resetHandle(column) {
    catchList = []
    catchKeys = {}
    this.sumHeight = toTwoDimensionalArray(column, 0)
    document.querySelector('.visible-container').scrollTo(0, 0)
    catchIndex = 0
    catchScrollTop = 0
}

/* ----------------------------- 骨架屏列表 ----------------------------- */

const skeletonElement = document.querySelector('.skeleton-wrapper')

// 创建骨架屏模板
const skeletonTemplate = `
    <li class="skeleton">
        <div class="img"></div>
        <div class="desc">
            <span></span>
            <span></span>
            <span></span>
        </div
    </li>
`

// 根据数据生成骨架屏列表
function generateSkeletonList() {

    const skeletonList = document.createElement('ul')

    for (let i = 0; i < 24; i++) {
        skeletonList.innerHTML += skeletonTemplate
    }

    return skeletonList
}

// 切换骨架屏显示状态
function toggleSkeleton(isVisible) {
    skeletonElement.innerHTML = ''

    if (isVisible) {
        const skeletonList = generateSkeletonList()
        skeletonElement.appendChild(skeletonList)
    }
}

// 初始化时隐藏骨架屏
toggleSkeleton(true)

// 根据数据绑定的值切换骨架显示状态
function handleSkeletonDisplay(value) {
    toggleSkeleton(value)
}

// 监听数据绑定的变化
let skeletonValue = false

Object.defineProperty(window, 'skeleton', {
    get() {
        return skeletonValue
    },
    set(value) {
        skeletonValue = value
        handleSkeletonDisplay(value)
    }
})

/* ----------------------------- 骨架屏列表 ----------------------------- */

/* ----------------------------- Loading加载 ----------------------------- */

const wavyElement = document.querySelector('.wavy-wrapper')

// 创建加载模板
const loadingTemplate = `
    <div class="wavy">
        <span style="--i:1">l</span>
        <span style="--i:2">o</span>
        <span style="--i:3">a</span>
        <span style="--i:4">d</span>
        <span style="--i:5">i</span>
        <span style="--i:6">n</span>
        <span style="--i:7">g</span>
        <span style="--i:8">.</span>
        <span style="--i:9">.</span>
        <span style="--i:10">.</span>
    </div>
`

// 切换加载显示状态
function toggleLoading(isVisible) {
    wavyElement.style.display = 'none'
    wavyElement.innerHTML = ''

    if (isVisible) {
        wavyElement.style.display = 'block'
        wavyElement.insertAdjacentHTML('beforeend', loadingTemplate)
    }
}

// 初始化时加载状态
toggleLoading(false)

// 根据数据绑定的值切换加载显示状态
function handleLoadingDisplay(value) {
    toggleLoading(value)
}

// 监听数据绑定的变化
let isLoading = false

Object.defineProperty(window, 'loading', {
    get() {
        return isLoading
    },
    set(value) {
        isLoading = value
        handleLoadingDisplay(value)
    }
})

/* ----------------------------- Loading加载 ----------------------------- */

document.addEventListener('DOMContentLoaded', () => {

    // 头部按钮
    initHeaderIcon()

    // 获取壁纸列表
    getList()

    // 获取分类标签
    getTagList(document.getElementById('category'))

    // 定时清除userData文件夹
    clearUserDataFolder()

    // 检查并删除过期的缓存
    checkExpiredCache()

    const visibleContainer = document.querySelector('.visible-container')
    const observer = debounce(() => {
        const updateColumn = updateVisibleContainerInfo(visibleContainer)
        if (updateColumn !== column) {
            column = updateColumn
            resetLayout()
        }
    }, 300)
    const resizeObserver = new ResizeObserver(e => observer(e))

    resizeObserver.observe(visibleContainer)

    column = updateVisibleContainerInfo(visibleContainer)
    resetHandle(column)

    visibleContainer.addEventListener('scroll', handlerScroll)
    visibleContainer.scrollTop = scrollTop

    const more = document.querySelector('.more-icon')
    const expand = document.querySelector('.more')

    more.addEventListener('click', () => {
        if (expand.style.display === 'none') {
            expand.style.display = 'block'
        } else {
            expand.style.display = 'none'
        }
    })

    const forgot = document.querySelector('.forgot')

    // 点击令牌进入b站专栏
    forgot.addEventListener('click', () => {
        shell.openExternal('https://www.bilibili.com/read/cv24947669')
    })

    const avatarContainer = document.querySelector('.avatar')
    const avatar = document.querySelector('.avatar img')
    const userInfo = document.querySelector('.popper_content')
    const userid = document.querySelector('.user-id')
    const expireTime = document.querySelector('.expire-time')
    const exitAccount = document.getElementById('exitAccount')

    avatarContainer.addEventListener('mouseover', (event) => {
        if (event.target === avatarContainer || event.target === avatar) {
            const users = localStorage.getItem('users')
            const currentUserId = localStorage.getItem('userId')
            if (users && JSON.parse(users).length > 0) {
                userInfo.classList.add('active')
                userid.innerHTML = `会员ID：${localStorage.getItem('userId')}`
                const expirationStatus = getExpirationTime(currentUserId)
                if (expirationStatus) {
                    const { text, color } = expirationStatus
                    expireTime.innerHTML = `${text}`
                    expireTime.style.color = `${color}`
                }

                exitAccount.addEventListener('click', () => {
                    logoutUser(currentUserId)
                })
            }
        }
    })

    avatarContainer.addEventListener('mouseleave', () => {
        userInfo.classList.remove('active')
    })

    avatar.addEventListener('click', handleAvatarClick)

    let userAvatar = ''
    // 从localStorage中获取用户信息数组
    const users = localStorage.getItem('users')
    if (users && JSON.parse(users).length > 0) {
        const userList = JSON.parse(users)
        const currentUserId = localStorage.getItem('userId')

        const currentUser = userList.find((user) => user.userId == currentUserId)
        if (currentUser) {
            userAvatar = currentUser.avatar
        }
    } else {
        userAvatar = '../../image/avatar.png'
    }
    avatar.src = userAvatar

    const loginClose = document.querySelector('.login-close')
    const loginShow = document.querySelector('.login-show')
    loginClose.addEventListener('click', () => {
        loginShow.classList.remove('active')
    })

    const sendBtn = document.getElementById('sendBtn')
    const uIdInput = document.getElementById('uId')
    const tokenInput = document.getElementById('token')

    // 用户登录
    sendBtn.addEventListener('click', async () => {

        if (!uIdInput.value && !tokenInput.value) {
            showMessage('账户和令牌不能为空', 'error')
            uIdInput.focus()
            return
        }

        if (!uIdInput.value) {
            showMessage('账号不能为空', 'error')
            uIdInput.focus()
            return
        }

        if (!tokenInput.value) {
            showMessage('令牌不能为空', 'error')
            tokenInput.focus()
            return
        }

        const jsonData = {
            uId: uIdInput.value,
            token: tokenInput.value
        }
        try {
            const response = await fetch(`${_config.wallpaper.bzlogin}`, {
                method: 'POST',
                body: JSON.stringify(jsonData),
                headers: { 'content-type': 'application/json' }
            })
            const result = await response.json()

            if (result.code === '10400') {
                showMessage('令牌错误', 'error')

            } else if (result.code === '0') {
                showMessage('登录成功', 'success')

                document.querySelector('.login-show').classList.remove('active')

                let userAvatar = `http://q1.qlogo.cn/g?b=qq&nk=${result.data.userId}&s=100`
                document.querySelector('.avatar img').src = userAvatar

                localStorage.setItem('userId', result.data.userId)
                // 获取之前保存的用户信息数组，如果不存在则创建一个空数组
                let users = localStorage.getItem('users')
                if (!users) {
                    users = []
                } else {
                    users = JSON.parse(users)
                }

                // 判断用户信息数组中是否存在相同的userId
                const isDuplicateUser = users.some((user) => {
                    return user.userId === result.data.userId
                })

                if (!isDuplicateUser) {
                    // 创建一个对象来存储当前用户的ID和令牌信息
                    const user = {
                        userId: result.data.userId,
                        token: result.data.qdToken,
                        expireTime: result.data.time,
                        avatar: userAvatar
                    }

                    // 将当前用户对象添加到数组中
                    users.push(user)

                    // 将更新后的用户信息数组保存回localStorage
                    localStorage.setItem('users', JSON.stringify(users))
                }
            }
            uIdInput.value = ''
            tokenInput.value = ''
        } catch (error) {
            console.log(error)
            uIdInput.value = ''
            tokenInput.value = ''
        }
    })

    // 用户投稿
    const uploadDialogWrapper = document.querySelector('.upload-dialog-wrapper')
    const uploadClose = document.getElementById('uploadClose')

    const uploadBtn = document.getElementById('uploadBtn')
    uploadBtn.addEventListener('click', () => {
        const currentUserId = localStorage.getItem('userId')
        if (currentUserId) {
            const expirationStatus = getExpirationTime(currentUserId)
            const { text } = expirationStatus
            if (text === '会员状态：已过期') {
                showMessage('账户已过期', 'warning')
                return
            }
        }

        if (isUserLoggedIn(currentUserId)) {
            uploadDialogWrapper.style = 'block'
        } else {
            showMessage('还没有登录，请先登录', 'warning')
            setTimeout(() => {
                loginShow.classList.add('active')
            }, 1000)
        }
    })

    uploadClose.addEventListener('click', () => {
        uploadDialogWrapper.style.display = 'none'
        document.getElementById('progress').style.width = '0%'
        document.getElementById('progressText').innerText = ''
        document.querySelector('.progress-bar').style.display = 'none'
        document.querySelector('.rarity-rule').style.display = 'none'
        document.querySelector('.release-btn').style.display = 'none'
        document.querySelector('.form-container').style.display = 'none'
        document.getElementById('category').value = ''
        document.getElementById('source').value = ''
        document.querySelector('.compress-image').classList.remove('active')
        var imgSpans = document.querySelectorAll('.img-span')
        imgSpans.forEach((imgSpan) => {
            imgSpan.remove()
        })
    })

    const dropArea = document.getElementById('dropArea')
    const uploadFile = document.getElementById('uploadFile')
    const fileInput = document.getElementById('fileInput')

    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault()
        dropArea.style.backgroundColor = '#f7f7f7'
    })

    dropArea.addEventListener('dragleave', (event) => {
        event.preventDefault()
        dropArea.style.backgroundColor = ''
    })

    dropArea.addEventListener('drop', (event) => {
        event.preventDefault()
        dropArea.style.backgroundColor = ''

        var file = event.dataTransfer.files[0]

        // 判断文件大小是否大于10M
        if (file && file.size <= 10 * 1024 * 1024) {
            resetAndUploadFile(file)
        } else {
            showMessage('文件大小超过限制，请选择10MB以内的文件', 'error')

            const compressImage = document.querySelector('.compress-image')
            compressImage.classList.add('active')

            compressImage.addEventListener('click', () => {
                shell.openExternal('https://yasuo.xunjiepdf.com/img/')
            })
        }

    })

    uploadFile.addEventListener('click', () => {
        fileInput.value = null // 重置fileInput元素的值
        fileInput.click()
    })

    // 添加监听事件
    fileInput.addEventListener('change', (event) => {
        var file = event.target.files[0]

        if (file && file.size <= 10 * 1024 * 1024) {
            resetAndUploadFile(file)
        } else {
            showMessage('文件大小超过限制，请选择10MB以内的文件', 'error')

            const compressImage = document.querySelector('.compress-image')
            compressImage.classList.add('active')

            compressImage.addEventListener('click', () => {
                shell.openExternal('https://yasuo.xunjiepdf.com/img/')
            })
        }
    })

    // 发布按钮
    const releaseBtn = document.querySelector('.release-btn')
    const publishBtn = document.getElementById('publishBtn')
    const categorySelect = document.getElementById('category')
    const source = document.getElementById('source')

    releaseBtn.addEventListener('click', () => {
        handleReleaseBtnClick()
    })

    function handleReleaseBtnClick() {

        if (source.value > 50) {
            showMessage('作品出处限制在50字内', 'error')
            document.querySelector('.release-dialog-wrapper').style.display = 'none'
            return
        }

        if (!selectedImgFile) {
            showMessage('请选择要发布的图片', 'error')
            document.querySelector('.release-dialog-wrapper').style.display = 'none'
            return
        }

        document.querySelector('.release-dialog-wrapper').style.display = 'block'
    }

    publishBtn.addEventListener('click', () => {

        const { userId, token } = getCurrentUser()

        const jsonData = {
            'uId': userId,
            'token': token,
            'imgId': selectedImgFile.id,
            "tagName": categorySelect.value,
            "fromPic": source.value
        }

        fetch(`${_config.wallpaper.upBz}`, {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'content-type': 'application/json'
            }
        }).then(response => {
            return response.json()
        }).then(response => {
            if (response.code === '0') {
                document.querySelector('.release-dialog-wrapper').style.display = 'none'
                showMessage(`${response.msg}，请等待后台审核`, 'success')
                setTimeout(() => {
                    location.reload()
                }, 1500)

            } else if (response.code === '10400') {
                document.querySelector('.release-dialog-wrapper').style.display = 'none'
                showMessage(response.msg, 'error')
            }

        }).catch(error => {
            loading = false
            showMessage(error, 'error')
        }).finally(() => {
            selectedImgFile = null      // 发布完成后将选中的图片设为空值
        })
    })

    // 获取导航条相关元素
    const navTable = Array.from(document.querySelectorAll('.nav-item'))
    const contents = Array.from(document.querySelectorAll('.content'))
    const slider = document.querySelector('.slider')

    // 绑定点击事件到每个导航项
    navTable.forEach((item, index) => {
        item.addEventListener('click', (event) => {
            handleClick(event, index)
        })
    })

    // 点击导航项的事件处理函数
    const handleClick = async (event, index) => {

        if (event.target.textContent === '壁纸') {
            // 移除所有导航项的 active 类
            navTable.forEach(element => element.classList.remove('active'))
            // 给当前点击的导航项添加 active 类
            navTable[0].classList.add('active')

            // 设置滑块的宽度和左偏移量
            slider.style.width = `${event.target.offsetWidth}px`
            slider.style.left = `${event.target.offsetLeft}px`

            // 移除所有内容区域的 active 类
            contents.forEach(element => element.classList.remove('active'))
            // 给当前点击导航项对应的内容区域添加 active 类
            contents[0].classList.add('active')

        } else if (event.target.textContent === '我的') {
            const currentUserId = localStorage.getItem('userId')
            if (currentUserId) {
                const expirationStatus = getExpirationTime(currentUserId)
                const { text } = expirationStatus
                if (text === '会员状态：已过期') {
                    showMessage('账户已过期', 'warning')
                    return
                }
            }

            if (isUserLoggedIn(currentUserId)) {
                // 移除所有导航项的 active 类
                navTable.forEach(element => element.classList.remove('active'))
                // 给当前点击的导航项添加 active 类
                navTable[1].classList.add('active')

                // 设置滑块的宽度和左偏移量
                slider.style.width = `${event.target.offsetWidth}px`
                slider.style.left = `${event.target.offsetLeft}px`

                // 移除所有内容区域的 active 类
                contents.forEach(element => element.classList.remove('active'))
                // 给当前点击导航项对应的内容区域添加 active 类
                contents[1].classList.add('active')

                // 获取用户信息
                await getUserInfo()
                // 获取用户列表
                await getUserList()
            } else {
                showMessage('还没有登录，请先登录', 'warning')
                setTimeout(() => {
                    loginShow.classList.add('active')
                }, 1000)
            }
        }
    }

    // 点击个人中心监听
    const myAccount = document.getElementById('myAccount')
    myAccount.addEventListener('click', async (event) => {
        const currentUserId = localStorage.getItem('userId')
        const expirationStatus = getExpirationTime(currentUserId)
        const { text } = expirationStatus
        if (text === '会员状态：已过期') {
            showMessage('账户已过期', 'warning')
            return
        }

        if (isUserLoggedIn(currentUserId)) {
            // 移除所有导航项的 active 类
            navTable.forEach(element => element.classList.remove('active'))
            // 给当前点击的导航项添加 active 类
            navTable[1].classList.add('active')

            // 设置滑块的宽度和左偏移量
            slider.style.width = '80px'
            slider.style.left = '190px'

            // 移除所有内容区域的 active 类
            contents.forEach(element => element.classList.remove('active'))
            // 给当前点击导航项对应的内容区域添加 active 类
            contents[1].classList.add('active')

            // 获取用户信息
            await getUserInfo()
            // 获取用户列表
            await getUserList()
        } else {
            showMessage('还没有登录，请先登录', 'warning')
            setTimeout(() => {
                loginShow.classList.add('active')
            }, 1000)
        }
    })

    const editBtn = document.getElementById('editBtn')
    const editInfoClose = document.getElementById('editInfoClose')

    editBtn.addEventListener('click', handleEditBtnClick)

    // 处理编辑按钮点击事件
    async function handleEditBtnClick() {
        isHandleEditBtnClickExecuted = true

        const { userId, token } = getCurrentUser()
        const bzId = parseInt(document.querySelector('.edit-wallpaper-id').innerHTML.replace('壁纸ID: ', ''))
        const tagName = document.getElementById('editCategory').value
        const fromPic = document.getElementById('editSource').value

        const jsonData = {
            "uId": userId,
            "token": token,
            "bzId": bzId,
            "tagName": tagName,
            "fromPic": fromPic
        }

        try {
            const response = await fetch(`${_config.wallpaper.updateById}`, {
                method: 'POST',
                body: JSON.stringify(jsonData),
                headers: {
                    'content-type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.code === '0') {
                showMessage('更新成功', 'success')
                setTimeout(async () => {
                    editInfoDialog.classList.remove('active')
                    editCategory.innerHTML = ''
                    // 获取用户列表
                    await getUserList()
                }, 1500);
            } else {
                showMessage('更新失败', 'error')
            }
        } catch (error) {
            showMessage(error, 'error')
        }

    }

    editInfoClose.addEventListener('click', () => {
        editInfoDialog.classList.remove('active')
        // 清空editCategory中的所有option元素
        editCategory.innerHTML = ''
    })
})

let isUserInfoRequest = false // 判断是否正在请求用户信息数据
let isUserListRequest = false // 判断是否正在请求用户列表数据

// 获取用户信息
async function getUserInfo() {

    loading = true

    if (isUserInfoRequest) {
        loading = false
        return
    }

    const userAvatar = document.querySelector('.user-avatar')
    const userName = document.querySelector('.username')
    const userPoint = document.querySelector('.points')
    const expiration = document.querySelector('.expiration')

    const currentUserId = localStorage.getItem('userId')

    if (!currentUserId) {
        return
    }

    try {
        isUserInfoRequest = true

        const response = await fetch(`${_config.wallpaper.myInfo}${currentUserId}`)
        const data = await response.json()

        const { userId, point, time } = data

        if (data) {
            userName.innerHTML = `用户ID：${userId}`
            userPoint.innerHTML = `积分：${point}`
            expiration.innerHTML = `过期时间：${formatTimestamp(time)}`
            updateRemainingTime(time)
        }

    } catch (error) {
        showMessage(error, 'error')
        loading = false
    } finally {
        isUserInfoRequest = false
    }

    // 清空userAvatar容器中的内容
    userAvatar.innerHTML = ''

    // 从localStorage中获取用户信息数组
    const users = localStorage.getItem('users')
    if (users && JSON.parse(users).length > 0) {
        const userList = JSON.parse(users)
        const currentUserId = localStorage.getItem('userId')

        const currentUser = userList.find((user) => user.userId == currentUserId)
        if (currentUser && currentUser.avatar) {
            const img = document.createElement('img')
            img.src = currentUser.avatar
            userAvatar.appendChild(img)
        }
    }
}

// 获取用户列表数据
async function getUserList() {
    if (isUserListRequest) {
        loading = false
        return
    }

    const userId = localStorage.getItem('userId')
    if (!userId) {
        return
    }

    // 将壁纸元素添加到元素中
    const wallpaperContainer = document.querySelector('.wallpaper-container')

    setTimeout(async () => {
        try {
            isUserListRequest = true
            wallpaperContainer.innerHTML = ''
            const response = await fetch(`${_config.wallpaper.myList}${userId}`)
            const data = await response.json()

            // 下载所有图片或使用已下载的本地图片
            const downloadTasks = data.map(async (imageData) => {
                const filePath = await downloadImage(imageData.url, 'userData')
                // 使用本地图片路径替换远程路径
                imageData.url = filePath.replaceAll('\\', '/')
            })

            // 等待所有下载任务完成
            await Promise.all(downloadTasks)

            data.forEach(userList => {
                // 解构用户列表信息
                const { url, id, dateStr, isUp, remark, rarityData } = userList
                const wallpaperElement = createWallpaperElement(url, id, dateStr, isUp, remark, rarityData)

                wallpaperContainer.appendChild(wallpaperElement)
            })

            const editInfoDialog = document.getElementById('editInfoDialog')
            const editFormContainer = document.querySelector('.edit-form-container')
            const editCategory = document.getElementById('editCategory')
            const editSource = document.getElementById('editSource')
            const editInfo = document.querySelectorAll('#editInfo')

            // 缓存数据
            let dataCache = {}

            editInfo.forEach(edit => {
                edit.addEventListener('click', async (event) => {
                    const target = event.target

                    if (target.classList.contains('edit-info')) {
                        editInfoDialog.classList.add('active')
                        editFormContainer.style.display = 'block'
                        const id = target.parentNode.children[0].getAttribute('data-id')
                        await handleEditInfoClick(id)
                    }
                })
            })

            // 处理编辑信息点击事件
            async function handleEditInfoClick(bzId) {
                const { userId, token } = getCurrentUser()

                if (!dataCache[bzId]) {
                    const jsonData = {
                        "uId": userId,
                        "token": token,
                        "bzId": parseInt(bzId)
                    }
                    try {
                        const response = await fetch(`${_config.wallpaper.getUrlByImgId}`, {
                            method: 'POST',
                            body: JSON.stringify(jsonData),
                            headers: {
                                'content-type': 'application/json'
                            }
                        })

                        const { data } = await response.json()
                        dataCache[bzId] = data
                    } catch (error) {
                        showMessage(error, 'error')
                        return
                    }
                }

                document.querySelector('.edit-wallpaper-id').innerHTML = `壁纸ID: ${bzId}`
                const option = document.createElement('option')
                editCategory.appendChild(option)
                editCategory.options[0].text = dataCache[bzId].tagName
                editCategory.options[0].value = dataCache[bzId].tagName
                editCategory.options[0].disabled = true

                const option1 = document.createElement('option')
                option1.text = '用户上传'
                option1.value = '用户上传'
                editCategory.appendChild(option1)

                try {
                    const response = await fetch(`${_config.wallpaper.tagList}`)
                    const data = await response.json()
                    data.forEach(item => {
                        const option = document.createElement('option')
                        option.value = item.tag
                        option.text = item.tag
                        editCategory.appendChild(option)
                    })
                } catch (error) {
                    showMessage(error, 'error')
                }

                if (dataCache[bzId].fromPic) {
                    editSource.value = dataCache[bzId].fromPic
                } else {
                    editSource.value = ''
                }
            }
        } catch (error) {
            showMessage(error, 'error')
            loading = false
        } finally {
            isUserListRequest = false
        }
    }, 1000)
}


// 创建壁纸元素
function createWallpaperElement(url, id, dateStr, isUp, remark, rarityData) {
    // 创建壁纸元素
    const wallpaperElement = document.createElement('li')
    wallpaperElement.classList.add('wallpaper')

    // 创建图片容器
    const imageContainer = document.createElement('div')
    imageContainer.classList.add('image')

    // 创建图片描述容器
    const imageDesc = document.createElement('div')
    imageDesc.classList.add('image-desc')

    // 创建并设置图片
    const imageElement = document.createElement('img')

    imageElement.draggable = false
    imageElement.src = url
    imageElement.setAttribute('id', 'userWallpaper')
    imageElement.setAttribute('data-id', id)

    imageElement.addEventListener('load', loadWallpaperInfo)

    imageContainer.appendChild(imageElement)

    // 创建并设置稀有度
    const imageInfo = document.createElement('div')
    imageInfo.classList.add('rarity-list')
    imageInfo.style.color = setRarityColor(rarityData)
    imageInfo.innerHTML = `稀有度：${rarityData}`

    const editInfo = document.createElement('div')

    // 已上架状态显示编辑图标
    if (isUp === 1) {
        editInfo.setAttribute('class', 'iconfont icon-edit edit-info')
        editInfo.setAttribute('id', 'editInfo')
        editInfo.title = '编辑'
    }

    imageContainer.appendChild(imageInfo)
    imageContainer.appendChild(editInfo)

    // 辅助函数，创建信息元素并添加到 wallpaperElement 中
    function appendInfo(label, value, tag = 'div') {
        const infoElement = document.createElement(tag)
        infoElement.textContent = `${label}：${value}`
        imageDesc.appendChild(infoElement)
    }

    function loadWallpaperInfo() {
        // 创建并设置壁纸编号
        appendInfo('编号', id)

        // 创建并设置投稿日期
        appendInfo('投稿日期', dateStr)

        // 创建并设置投稿状态
        let statusStr = ''
        if (isUp === 0) {
            statusStr = '待审核'
        } else if (isUp === 1) {
            statusStr = '已上架'
        } else {
            statusStr = '未知状态'
        }
        appendInfo('投稿状态', statusStr)

        // 创建并设置备注
        if (remark) {
            appendInfo('备注', remark)
        }
    }

    loading = false

    wallpaperElement.appendChild(imageContainer)
    wallpaperElement.appendChild(imageDesc)

    return wallpaperElement

}

// 获取用户过期时间
function getExpirationTime(currentUserId) {
    const users = localStorage.getItem('users')
    if (users) {
        const userList = JSON.parse(users)

        // 查找当前用户的信息
        const currentUser = userList.find((user) => user.userId == currentUserId)
        if (currentUser) {
            const expirationTime = currentUser.expireTime
            const expirationStatus = determineExpirationStatus(expirationTime)
            return expirationStatus
        }
    }

    return null // 如果未找到当前用户或者没有过期时间，则返回 null
}

// 过期状态
function determineExpirationStatus(expirationTime) {
    const currentDate = new Date()
    const expireDate = new Date(expirationTime)

    if (expireDate.getTime() < currentDate.getTime()) {
        // 返回过期状态，包含过期文本和字体颜色
        return { text: '会员状态：已过期', color: '#808080' }
    } else {
        const { text, color } = convertTimestampToExpireTime(expirationTime)
        // 返回未过期状态
        return { text: text, color: color }
    }
}

// 将时间戳转换为剩余时间
function convertTimestampToExpireTime(timestamp) {
    // 创建一个Date对象，传入时间戳作为参数
    var expirationDate = new Date(timestamp)

    // 获取当前时间
    var currentDate = new Date()

    // 计算剩余时间的毫秒数
    var remainingTime = expirationDate.getTime() - currentDate.getTime()

    // 计算月、天数
    var months = Math.floor(remainingTime / (30 * 24 * 60 * 60 * 1000))
    var days = Math.floor((remainingTime % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000))

    const month = months > 0 ? `${months}个月` : ''
    const day = days > 0 ? `${days}天` : ''

    // 判断过期时间是否不到1天
    if (remainingTime < 24 * 60 * 60 * 1000) {
        return { text: '会员剩余时间：不足1天啦！', color: '#DC143C' }
    } else {
        const text = `会员剩余时间：${month}${day}`
        return { text: text, color: '#FF69B4' }
    }
}

// 将时间戳转换为过期时间 (精确到秒)
function formatTimestamp(timestamp) {
    const dateObj = new Date(timestamp)

    const year = dateObj.getFullYear() > 0 ? `${dateObj.getFullYear()}年` : ''
    const month = dateObj.getMonth() + 1 > 0 ? `${dateObj.getMonth() + 1}月` : '' // 月份从 0 开始，所以要加上 1
    const day = dateObj.getDate() > 0 ? `${dateObj.getDate()}日` : ''
    const hours = dateObj.getHours() > 0 ? `${dateObj.getHours()}点` : ''
    const minutes = dateObj.getMinutes() > 0 ? `${dateObj.getMinutes()}分` : `${dateObj.getMinutes()}分`
    const seconds = dateObj.getSeconds() > 0 ? `${dateObj.getSeconds()}秒` : ''

    const formattedDate = `${year}${month}${day} ${hours}${minutes}`
    return formattedDate
}

// 计算剩余时间并将其转换为月、天、小时、分钟和秒的格式
function convertToMonthsDaysHoursMinutesSeconds(remainingTime) {
    // 创建一个Date对象，传入时间戳作为参数
    var expirationDate = new Date(remainingTime)

    // 获取当前时间
    var currentDate = new Date()

    // 计算剩余时间的毫秒数
    var remainingTime = expirationDate.getTime() - currentDate.getTime()

    // 计算剩余的月、天、小时、分钟和秒数
    var months = Math.floor(remainingTime / (30 * 24 * 60 * 60 * 1000))
    var days = Math.floor((remainingTime % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000))
    var hours = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    var minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000))
    var seconds = Math.floor((remainingTime % (60 * 1000)) / 1000)

    const month = months > 0 ? `${months}个月` : ''
    const day = days > 0 ? `${days}天` : ''
    const hour = hours > 0 ? `${hours}小时` : ''
    const minute = minutes > 0 ? `${minutes}分` : ''
    const second = seconds > 0 ? `${seconds}秒` : ''

    const formattedDate = `剩余时间：${month}${day}${hour}${minute}${second}`
    return formattedDate
}

// 每秒更新剩余时间
function updateRemainingTime(expireTime) {
    setInterval(() => {
        const remainderText = convertToMonthsDaysHoursMinutesSeconds(expireTime)
        document.querySelector('.remaining-time').innerHTML = remainderText
    }, 1000)
}

async function handleAvatarClick() {
    const loginShow = document.querySelector('.login-show')

    const currentUserId = localStorage.getItem('userId')
    if (!isUserLoggedIn(currentUserId)) {
        // 打开登录页面
        loginShow.classList.add('active')
    }

    if (currentUserId) {
        const response = await fetch(`${_config.wallpaper.myInfo}${currentUserId}`)
        const data = await response.json()

        const { time } = data

        const users = localStorage.getItem('users')
        if (!users) return {}

        const userList = JSON.parse(users)

        const currentUserIndex = userList.findIndex((user) => user.userId == currentUserId)
        if (currentUserIndex !== -1) {
            userList[currentUserIndex].expireTime = time
            localStorage.setItem('users', JSON.stringify(userList))
        }
    }

}

// 用户是否已经登录
function isUserLoggedIn(currentUserId) {
    const users = localStorage.getItem('users')
    if (users) {
        const userList = JSON.parse(users)
        return userList.some((user) => user.userId == currentUserId)
    }
    return false
}

// 退出登录
function logoutUser(currentUserId) {
    const users = localStorage.getItem('users')
    if (users) {
        let userList = JSON.parse(users)

        // 查找当前用户的索引
        const currentUserIndex = userList.findIndex((user) => user.userId == currentUserId)

        if (currentUserIndex !== -1) {
            // 从用户信息数组中删除当前用户信息
            userList.splice(currentUserIndex, 1)

            // 更新缓存中的用户信息
            localStorage.setItem('users', JSON.stringify(userList))

            // 刷新页面
            location.reload()
        }

        // 删除当前用户ID
        localStorage.removeItem('userId')

        // 更新缓存中的用户信息
        localStorage.setItem('users', JSON.stringify(userList))

        // 刷新页面
        location.reload()

    }
}

function resetAndUploadFile(file) {

    // 重置进度条为0
    resetProgress()

    const progressBar = document.querySelector('.progress-bar')
    progressBar.style.display = 'block'

    uploadFile(file)

}

// 将对象添加到上传文件缓存中
function addToUploadFileCache(data) {
    var uploadFileCache = localStorage.getItem('uploadFileCache')
    if (!uploadFileCache) {
        // 如果本地存储中没有缓存数组，则创建一个空数组
        uploadFileCache = []
    } else {
        // 如果有缓存的数组，则解析为json数组
        uploadFileCache = JSON.parse(uploadFileCache)
    }

    // 将对象添加到缓存数组中
    uploadFileCache.push(data)

    // 将缓存数组保存到本地存储中
    localStorage.setItem('uploadFileCache', JSON.stringify(uploadFileCache))
}

// 上传文件
async function uploadFile(file) {
    loading = true
    showMessage('正在上传文件，请稍等...', 'success')

    const currentUserId = localStorage.getItem('userId')
    const users = JSON.parse(localStorage.getItem('users'))

    // 查找当前用户的信息
    const currentUser = users.find((user) => user.userId == currentUserId)
    if (!currentUser) {
        showMessage('无效的用户ID', 'error')
        return
    }

    const { userId, token } = currentUser
    try {
        const url = `${_config.wallpaper.upFile}`
        var xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', function (event) {
            if (event.lengthComputable) {
                var progressPercentage = Math.round((event.loaded / event.total) * 100)
                updateProgress(progressPercentage)
            }
        })

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.response)
                        // 创建一个对象来存储id和url
                        var data = {
                            id: response.id,
                            url: response.url
                        }

                        addToUploadFileCache(data)

                        // 分析稀有度
                        showMessage('上传成功，正在分析壁纸稀有度...', 'success')
                        setTimeout(() => {
                            analyzeRarity(userId, token, response.id)
                        }, 2000);

                    } catch (error) {
                        showMessage(xhr.responseText, 'error')
                        updateProgress(0)
                        document.querySelector('.progress-bar').style.display = 'none'
                        new Promise(() => setTimeout(() => { loading = false }, 1000))
                    }

                } else {
                    showMessage('网络异常，请稍后再试', 'error')
                    updateProgress(0)
                    document.querySelector('.progress-bar').style.display = 'none'
                    new Promise(() => setTimeout(() => { loading = false }, 1000))
                }
            }
        }

        xhr.open('POST', url, true)
        xhr.setRequestHeader('uId', userId)
        xhr.setRequestHeader('token', token)

        var formData = new FormData()
        formData.append('file', file)

        xhr.send(formData)
    } catch (error) {
        showMessage(error, 'error')
        updateProgress(0)
        document.querySelector('.progress-bar').style.display = 'none'
        new Promise(() => setTimeout(() => { loading = false }, 1000))
    }

}


// 分析稀有度接口
function analyzeRarity(userId, token, fileId) {

    fetch(`${_config.wallpaper.judgeFile}${fileId}`, {
        method: 'GET',
        headers: {
            'uId': userId,
            'token': token
        }
    }).then(response => {
        if (response.ok) {
            return response.json()
        } else {
            throw new Error('请求失败')
        }
    }).then(response => {
        if (response === '') {
            throw new Error('分析稀有度失败')
        } else {

            var data = {
                rarityData: response.rarityData,
                expireTime: Date.now() + 60 * 60 * 1000 // 60分钟 * 60秒 * 1000毫秒
            }
            const uploadFileCache = localStorage.getItem('uploadFileCache')
            if (uploadFileCache) {
                try {
                    const uploadFileList = JSON.parse(uploadFileCache)

                    if (uploadFileList && Array.isArray(uploadFileList)) {
                        var foundFile = uploadFileList.find(item => item.id === fileId)

                        if (foundFile) {
                            // 合并新的数据到现有对象中进行更新
                            Object.assign(foundFile, data)

                            // 将更新后的缓存数组保存到本地存储中
                            localStorage.setItem('uploadFileCache', JSON.stringify(uploadFileList))
                        }
                    }

                    // 获取upload-imgs节点
                    const uploadImgs = document.querySelector('.upload-imgs')
                    uploadImgs.innerHTML = ''
                    loading = false

                    uploadFileList.forEach(item => {
                        let html = `
                            <span class="iconfont icon-close delete-img" value="${item.id}"></span>
                            <img class="uploading-img" src="${item.url}" value=${item.id}>
                            <span class="rarity-data">稀有度：${item.rarityData}</span>                         
                        `

                        // 创建节点
                        let imgSpan = document.createElement('span')
                        // 设置属性
                        imgSpan.setAttribute('class', 'img-span')
                        // 将子节点放入父节点
                        imgSpan.innerHTML = html
                        // 向uploadImgs节点添加新节点
                        uploadImgs.appendChild(imgSpan)

                    })

                    // 选中图片事件处理函数
                    function selectImage(event) {
                        event.stopPropagation()

                        // 判断当前点击的图片是否已经被选中
                        if (event.target.classList.contains('selected')) {
                            event.target.classList.remove('selected')   // 取消选中状态
                            selectedImgFile = null  // 清空选中的图片文件
                        } else {
                            var imgElements = document.getElementsByClassName('uploading-img')
                            for (var i = 0; i < imgElements.length; i++) {
                                imgElements[i].classList.remove('selected')
                            }

                            var selectedImgElement = event.target
                            selectedImgElement.classList.add('selected')

                            var imgValue = selectedImgElement.getAttribute('value')

                            // 获取选中的图片文件
                            selectedImgFile = getSelectedImageFile(imgValue)
                        }
                    }

                    // 选择分类标签和作者出处
                    const formContainer = document.querySelector('.form-container')

                    formContainer.style.display = 'block'

                    const releaseBtn = document.querySelector('.release-btn')
                    const releaseClose = document.getElementById('releaseClose')
                    const releaseCancel = document.getElementById('releaseCancel')
                    const releaseDialogWrapper = document.querySelector('.release-dialog-wrapper')
                    releaseBtn.style.display = 'block'

                    releaseClose.addEventListener('click', () => {
                        releaseDialogWrapper.style.display = 'none'
                    })

                    releaseCancel.addEventListener('click', () => {
                        releaseDialogWrapper.style.display = 'none'
                    })

                    // 查看稀有度规则
                    const uploadDialogHeader = document.querySelector('.upload-dialog-header')
                    const rarityRule = document.querySelector('.rarity-rule')
                    const scoreContainer = document.querySelector('.score-container')
                    const returnUpper = document.getElementById('returnUpper')
                    const progressBar = document.querySelector('.progress-bar')

                    rarityRule.style.display = 'block'

                    rarityRule.addEventListener('click', () => {
                        uploadDialogHeader.style.display = 'none'
                        dropArea.style.display = 'none'
                        rarityRule.style.display = 'none'
                        progressBar.style.display = 'none'
                        uploadImgs.style.display = 'none'
                        releaseBtn.style.display = 'none'
                        formContainer.style.display = 'none'
                        scoreContainer.style.display = 'block'
                    })

                    returnUpper.addEventListener('click', () => {
                        scoreContainer.style.display = 'none'
                        uploadDialogHeader.style.display = 'block'
                        dropArea.style.display = 'block'
                        progressBar.style.display = 'block'
                        uploadImgs.style.display = 'block'
                        releaseBtn.style.display = 'block'
                        rarityRule.style.display = 'block'
                        formContainer.style.display = 'block'
                    })


                    // 初始化添加事件监听器
                    addClickEventListeners()

                    // 添加选中图片监听
                    function addClickEventListeners() {
                        var imgElements = document.querySelectorAll('.uploading-img')
                        imgElements.forEach(item => {
                            item.addEventListener('click', selectImage)
                        })
                    }

                    // 获取选中图片的对象
                    function getSelectedImageFile(imgValue) {
                        return uploadFileList.find(file => file.id === imgValue) || null
                    }

                    // 添加删除图片监听
                    var deleteButtons = document.getElementsByClassName('delete-img')
                    for (var i = 0; i < deleteButtons.length; i++) {
                        deleteButtons[i].addEventListener('click', deleteImage)
                    }

                    // 删除图片事件处理函数
                    function deleteImage(event) {
                        event.stopPropagation()

                        // 将选中的图片设为空值
                        selectedImgFile = null

                        // 获取当前点击的删除按钮所在的父级元素
                        var parentElement = this.parentNode

                        // 获取该图片元素的值
                        var imgValue = this.nextElementSibling.getAttribute('value')

                        // 从DOM中移除图片和删除按钮
                        parentElement.remove()

                        // 在uploadFileList中查找并删除对应的对象
                        var index = uploadFileList.findIndex(file => file.id === imgValue)

                        if (index !== -1) {
                            uploadFileList.splice(index, 1)

                            localStorage.setItem('uploadFileCache', JSON.stringify(uploadFileList))
                        }

                        // 判断uploadFileCache缓存是否有数据，并获取其长度
                        var uploadFileCache = JSON.parse(localStorage.getItem('uploadFileCache'))
                        var cacheLength = uploadFileCache ? uploadFileCache.length : 0

                        // 如果没有缓存数据，隐藏rarity-rule和release-btn
                        if (cacheLength === 0) {
                            document.querySelector('.rarity-rule').style.display = 'none'
                            document.querySelector('.release-btn').style.display = 'none'
                            document.querySelector('.progress-bar').style.display = 'none'
                            document.querySelector('.form-container').style.display = 'none'
                        }
                    }

                } catch (error) {
                    console.log(error)
                    loading = false
                    showMessage('分析uploadFileCache时出错', 'error')
                }
            }
        }
    }).catch(error => {
        loading = false
        showMessage(error, 'error')
    })
}

// 更新进度条
function updateProgress(percentage) {
    var progress = document.getElementById('progress')
    var progressText = document.getElementById('progressText')
    progress.style.width = `${percentage}%`
    progressText.innerText = `${percentage.toFixed(1)}%`
}

// 将进度条重置为0
function resetProgress() {
    var progress = document.getElementById('progress')
    var progressText = document.getElementById('progressText')
    progress.style.width = '0%'
    progressText.innerText = '0%'
}

// 检查并删除过期的缓存
function checkExpiredCache() {
    const uploadFileCache = localStorage.getItem('uploadFileCache')

    if (uploadFileCache) {
        try {
            // 将缓存字符串解析为数组
            const uploadFileList = JSON.parse(uploadFileCache)
            // 获取当前时间戳
            const currentDate = Date.now()

            // 使用filter方法筛选未过期的文件对象
            const updatedFileList = uploadFileList.filter(item => currentDate <= item.expireTime)

            // 更新缓存数组到本地存储中
            localStorage.setItem('uploadFileCache', JSON.stringify(updatedFileList))

        } catch (error) {
            console.log('检查uploadFileCache过期时出错：', error)
        }
    }

    // 设置下一次的定时器，每隔5分钟调用一次 checkExpiredCache 方法
    setTimeout(checkExpiredCache, 5 * 60 * 1000)

}

function updateVisibleContainerInfo(dom) {

    const visibleList = document.querySelector('.visible-list')

    clientWidth = dom.clientWidth
    clientHeight = dom.clientHeight
    visibleList.style.transform = `translateX(${(dom.clientWidth + gap) % (width + gap) / 2}px)`

    return Math.max(parseInt((dom.clientWidth + gap) / (width + gap)), 1)
}


// 重置布局
function resetLayout() {
    this.sumHeight = toTwoDimensionalArray(column, 0)

    catchList.forEach(img => {
        const minIndex = minValIndex(this.sumHeight)
        const top = this.sumHeight[minIndex]
        const left = minIndex * (width + gap)
        img._top = top
        img.style = {
            width: `${width}px`,
            height: `${height}px`,
            transform: `translate(${left}px, ${top}px)`
        }
        this.sumHeight[minIndex] += height + gap
    })

    isAnimate = true
    placeholderHeight = maxVal(this.sumHeight)

    document.querySelector('.placeholderHeight').style.height = `${placeholderHeight}px`

}

// 列表滚动
function handlerScroll(e) {
    let scrollTop = e.target.scrollTop
    updateScrollTop(scrollTop)
}

/**
 * 实现一个函数，用于在下一帧渲染之前执行回调函数。
 * @param {*} callback - 回调函数，将在下一帧渲染之前执行。
 */
function nextTick(callback) {
    requestAnimationFrame(callback)
}

// 防抖函数
function debounce(fn, wait = 1000) {
    let timeout = null
    return function (...args) {
        if (timeout !== null) clearTimeout(timeout)
        timeout = setTimeout(() => {
            fn.apply(this, args)
        }, wait)
    }
}

// 生成二维数组
function toTwoDimensionalArray(count, defval) {
    const list = []
    for (let index = 0; index < count; index++) {
        if (defval === undefined) {
            list.push([])
        } else {
            list.push(defval)
        }
    }
    return list
}

// 查找最小值的索引
function minValIndex(arr = []) {
    const val = Math.min(...arr)
    return arr.findIndex(i => i === val)
}

// 查找最大值
function maxVal(arr = []) {
    return Math.max(...arr)
}

// 获取元素 Transform
function getTransforms(doms) {
    let map = new Map()
    doms.forEach((dom) => {
        map.set(dom.id, dom.style.transform)
    })
    return map
}

// 生成指定范围随机数
function getRandom(n, m) {
    Math.floor(Math.random() * (m - n + 1) + n)
}

/**
 * 图片宽高比适应
 * @param {*} width 容器宽
 * @param {*} height 容器高
 * @param {*} r 图片宽高比
 */
function aspectRatioToWH(width, height, r, iw, ih) {
    let _r = width / height
    if (iw < width && ih < height) {
        return { width: iw, height: ih }
    }
    //容器宽度比 大=于 内容 宽高比  以高度为基准
    if (_r > r) {
        return {
            width: height * r, height
        }
    } else if (_r < r) {
        return {
            width, height: width / r
        }
    } else {
        return {
            width, height
        }
    }
}

// 定时清除userData文件夹
function clearUserDataFolder() {
    const currentDate = new Date()

    // 检查是否每个月的1号
    if (currentDate.getDate() === 1) {
        const userDataPath = path.join(process.cwd(), '/cache/wallpaper-gallery/userData')
        // 调用删除文件夹的递归函数
        deleteFolderRecursive(userDataPath)
    }
}

// 删除文件夹的递归函数
function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach((file, index) => {
            const curPath = path + '/' + file
            // 判断是否是文件夹
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath)
            } else {
                // 删除文件
                fs.unlinkSync(curPath)
            }
        })
        // 删除空文件夹
        fs.rmdirSync(path)
    }
}

function initHeaderIcon() {
    document.querySelector('.icon-minimize').addEventListener('click', () => {
        ipcRenderer.send('Wallpaper', 'minimize-window')
    })

    document.querySelector('.icon-maximize').addEventListener('click', () => {
        ipcRenderer.send('Wallpaper', 'maximize-window')
    })

    document.querySelector('.icon-close').addEventListener('click', () => {
        ipcRenderer.send('Wallpaper', 'close-window')
    })
}