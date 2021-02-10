// NekoChanTaiwan Discord.js
// Discord.js     npm install discord.js        https://discord.js.org/#/docs/main/stable/general/welcome
// nHentai API    npm install nana-api          https://www.npmjs.com/package/nana-api
// is-image-url   npm install is-image-url      https://www.npmjs.com/package/is-image-url

'use strict'

// 初始化變量

const Discord = require('discord.js')
const client = new Discord.Client()

const NanaAPI = require('nana-api')
const nanaAPI = new NanaAPI

const isImageUrl = require('is-image-url')

// 自定義功能
const custom = {
    // Token（字符串）
    token: '',

    // 指令前綴（字符串）
    commandPrefix: '!',

    // 隨機自定狀態
    randomActivity: {
        // 啟用（布林值）
        enable: true,
        // 類型（字符串）
        type: 'COMPETING',
        // 內容（陣列：字符串）
        array: ['NekoChan 的 肉便器', 'NekoChan 的 性奴隸', 'NekoChan 的 小母狗', 'NekoChan 的 飛機杯'],
        // 切換時間（數字：單位-秒）
        switchTime: 60,
    },

    // nHentai功能
    nHentai: {
        // 隨機本本指令（字符串）
        randomCommand: 'n',
        // 隨機本本分類過濾（陣列：字符串）
        randomTagsFilter: ['futanari', 'scat', 'pig man', 'ryona', 'coprohagia', 'spider girl', 'alien', 'pig girl', 'nipple fuck', 'males only', 'pig', 'yaoi', 'insect', 'guro', 'cannibalism', 'eggs'],
        // 隨機本本作者過濾（陣列：字符串）
        randomArtistFilter: ['sakamoto kafka'],
        // 隨機本本語言過濾（陣列：字符串）
        randomLanguageFilter: ['english', 'japanese'],
    },
}

const commandPrefix = new RegExp(custom.commandPrefix)

const S = ' [系統] ', E = ' [事件] '

let embed = null, artistName = '', artistUrl = '', tagsName = '', coverUrl = '', language = ''

console.log(`[${getTime()}]${S}腳本讀取中`)

// 隨機整數
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
// 當前時間
function getTime() {
    return new Date().toLocaleString()
}
// nHentai 過濾
function nHentaiFilter(array, name) {
    if (array.length > 0) {
        for (let i = 0; i < array.length; i++) {
            if (name === array[i]) {
                console.log(`[${getTime()}]${E}發現過濾類型：${name}`)
                return true
            }
        }
    } else {
        return false
    }
}


// 事件綁定
client.on('ready', () => {
    console.log(`[${getTime()}]${E}已登入 ${client.user.tag}`)

    // 隨機自定狀態
    const SetRandomActivity = () => {
        client.user.setActivity(custom.randomActivity.array[getRandomInt(custom.randomActivity.array.length)], {type: custom.randomActivity.type})
            .then(presence => console.log(`[${getTime()}]${E}已設置狀態：${presence.activities[0].name}`))
            .catch(error => console.log(error))
        setTimeout(() => {
            SetRandomActivity()
        }, custom.randomActivity.switchTime * 1000)
    }
    custom.randomActivity.enable ? SetRandomActivity() : null
})

client.on('message', message => {
    // 指令前綴偵測
    if (commandPrefix.test(message.content)) {
        // 指令偵測
        switch (message.content) {
            // nHentai 隨機本本
            case `${custom.commandPrefix}${custom.nHentai.randomCommand}`:
                const nHentaiRandom = () => {
                    // nHentai API .random()
                    nanaAPI.random()
                        .then(book => {
                            message.channel.send('正在隨機尋找本本...') // TODO: 提示文字
                            // 類型處理
                            for (let value of book.tags) {
                                if (value.type === 'tag') {
                                    // 過濾分類
                                    if (nHentaiFilter(custom.nHentai.randomTagsFilter, value.name) === true) {
                                        return nHentaiRandom()
                                    }
                                    tagsName += `${value.name}, `
                                } else {
                                    switch (value.type) {
                                            case 'artist':
                                                // 過濾作者
                                                if (nHentaiFilter(custom.nHentai.randomArtistFilter, value.name) === true) {
                                                    return nHentaiRandom()
                                                }
                                                artistName = value.name
                                                artistUrl = `https://nhentai.net${value.url}`
                                                break
                                            case 'language':
                                                if (value.name === 'english' ||
                                                    value.name === 'japanese' ||
                                                    value.name === 'chinese') {
                                                         // 過濾語言
                                                        if (nHentaiFilter(custom.nHentai.randomLanguageFilter, value.name) === true) {
                                                            return nHentaiRandom()
                                                        }
                                                        language = value.name
                                                    }
                                                break
                                    }
                                }
                            }

                            // 空值檢查
                            artistName = artistName === '' ? '未分類' : artistName
                            artistUrl = artistUrl === '' ? 'https://nhentai.net/' : artistUrl
                            tagsName = tagsName === '' ? '未分類' : tagsName

                            // 圖片檢查
                            if (isImageUrl(`https://t.nhentai.net/galleries/${book.media_id}/cover.jpg`)) {
                                coverUrl = `https://t.nhentai.net/galleries/${book.media_id}/cover.jpg`
                            } else if (isImageUrl(`https://t.nhentai.net/galleries/${book.media_id}/cover.png`)) {
                                coverUrl = `https://t.nhentai.net/galleries/${book.media_id}/cover.png`
                            }

                            // Embed
                            embed = new Discord.MessageEmbed()
                                .setColor('#ed2553')
                                .setTitle(book.title.pretty)
                                .setURL(`https://nhentai.net/g/${book.id}/`)
                                .setAuthor(`作者：${artistName}`, '', artistUrl)
                                .setThumbnail('https://i.imgur.com/r36VxQt.png')
                                // .setDescription('隨機本子')
                                .addFields(
                                    { name: 'ＩＤ：', value: book.id, inline: true},
                                    { name: '語言：', value: language, inline: true },
                                    { name: '分類：', value: tagsName },
                                )
                                .setImage(coverUrl)
                                .setFooter(`頁數：${book.num_pages}`)

                            // 發送訊息
                            message.channel.send(embed)
                                .then(() => console.log(`[${getTime()}]${E}已發送本子：${book.id}`))
                                .catch(error => console.log(error))

                            // 重置變量
                            artistName = ''
                            artistUrl = ''
                            tagsName = ''
                        })
                }
                nHentaiRandom()
                break
        }
    }
})

console.log(`[${getTime()}]${S}腳本讀取完成`)

// 登入
client.login(custom.token)