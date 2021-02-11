// NekoChanTaiwan Discord.js
// Discord.js       npm install discord.js        https://discord.js.org/#/docs/main/stable/general/welcome
// nHentai API      npm install nana-api          https://www.npmjs.com/package/nana-api
// valid-image-url  npm install valid-image-url   https://www.npmjs.com/package/valid-image-url

'use strict'

const Discord = require('discord.js')
const NanaAPI = require('nana-api')
const isImageURL = require('valid-image-url')
const { token, prefix } = require('./config.json')


// 自定義功能
const custom = {
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
        // 隨機本本
        random: {
            // 指令（字符串）
            command: 'random',
            // 簡寫指令（字符串）
            shortCommand: 'r',
            // 黑名單功能
            Blacklist: {
                // 啟用（布林值）
                enable: true,
                // 分類（陣列：字符串）
                tags: ['futanari', 'scat', 'pig man', 'ryona', 'coprohagia', 'spider girl', 'alien', 'pig girl', 'nipple fuck', 'males only', 'pig', 'yaoi', 'insect', 'guro', 'cannibalism', 'eggs', 'muscle'],
                // 作者（陣列：字符串）
                artists: ['sakamoto kafka'],
                // 語言（陣列：字符串）
                languages: ['english', 'japanese'],
            }
        },
    },
}

const client = new Discord.Client()
const nanaAPI = new NanaAPI
const commandPrefix = new RegExp(prefix)

const S = ' [系統] ', E = ' [事件] '

let commandStarting = false

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
function nHentaiBlacklistFilter(array, name) {
    if (array.length > 0) {
        for (let i = 0; i < array.length; i++) {
            if (name === array[i]) {
                console.log(`[${getTime()}]${E}發現黑名單類型：${name}`)
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
    // 指令前綴偵測 及 指令執行狀態
    if (commandPrefix.test(message.content) && commandStarting === false) {
        // 指令偵測
        switch (message.content) {
            // nHentai 隨機本本
            case `${prefix}${custom.nHentai.random.command}`:
            case `${prefix}${custom.nHentai.random.shortCommand}`:
                // 切換指令執行狀態
                commandStarting = true
                // 初始化變量
                let saveMsg = null
                // 發送通知
                message.channel.send(`\u0060\u0060\u0060[${getTime()}] 正在努力尋找本本...\u0060\u0060\u0060`)
                    .then(msg => saveMsg = msg)

                const nHentaiRandom = () => {
                    // 初始化變量
                    let embed = null,
                        blacklistEnable = '',
                        artistName = '',
                        artistUrl = '',
                        tagsName = '',
                        coverUrl = '',
                        language = ''

                    // nHentai API .random()
                    nanaAPI.random()
                        .then(book => {
                            // 類型處理
                            for (let value of book.tags) {
                                if (value.type === 'tag') {
                                    // 過濾黑名單分類
                                    if (custom.nHentai.random.Blacklist.enable === true &&
                                        nHentaiBlacklistFilter(custom.nHentai.random.Blacklist.tags, value.name) === true) {
                                        saveMsg.edit(`\u0060\u0060\u0060[${getTime()}] 發現黑名單類型：${value.name}，努力尋找其他本本中...\u0060\u0060\u0060`)
                                        return nHentaiRandom()
                                    }
                                    tagsName += `${value.name}, `
                                } else {
                                    switch (value.type) {
                                            case 'artist':
                                                // 過濾黑名單作者
                                                if (custom.nHentai.random.Blacklist.enable === true &&
                                                    nHentaiBlacklistFilter(custom.nHentai.random.Blacklist.artists, value.name) === true) {
                                                    saveMsg.edit(`\u0060\u0060\u0060[${getTime()}] 發現黑名單類型：${value.name}，努力尋找其他本本中...\u0060\u0060\u0060`)
                                                    return nHentaiRandom()
                                                }
                                                artistName = value.name
                                                artistUrl = `https://nhentai.net${value.url}`
                                                break
                                            case 'language':
                                                if (value.name === 'english' ||
                                                    value.name === 'japanese' ||
                                                    value.name === 'chinese') {
                                                         // 過濾黑名單語言
                                                        if (custom.nHentai.random.Blacklist.enable === true &&
                                                            nHentaiBlacklistFilter(custom.nHentai.random.Blacklist.languages, value.name) === true) {
                                                            saveMsg.edit(`\u0060\u0060\u0060[${getTime()}] 發現黑名單類型：${value.name}，努力尋找其他本本中...\u0060\u0060\u0060`)
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

                            // 過濾黑名單檢查
                            blacklistEnable = custom.nHentai.random.Blacklist.enable === true ? '過濾黑名單：已啟用' : '過濾黑名單：已關閉'

                            // Embed
                            embed = new Discord.MessageEmbed()
                                .setColor('#ed2553')
                                .setTitle(book.title.pretty)
                                .setURL(`https://nhentai.net/g/${book.id}/`)
                                .setAuthor(`作者：${artistName}`, '', artistUrl)
                                .setThumbnail('https://i.imgur.com/r36VxQt.png')
                                .setDescription(blacklistEnable)
                                .addFields(
                                    { name: 'ＩＤ：', value: book.id, inline: true},
                                    { name: '語言：', value: language, inline: true },
                                    { name: '分類：', value: tagsName },
                                )
                                .setImage(coverUrl)
                                .setFooter(`頁數：${book.num_pages}`)

                            // 圖片檢查
                            isImageURL(`https://t.nhentai.net/galleries/${book.media_id}/cover.jpg`)
                                .then(is_image => {
                                    if (is_image) {
                                        embed.setImage(`https://t.nhentai.net/galleries/${book.media_id}/cover.jpg`)
                                        messageSend()
                                    } else {
                                        embed.setImage(`https://t.nhentai.net/galleries/${book.media_id}/cover.png`)
                                        messageSend()
                                    }
                                })

                            // 發送訊息
                            const messageSend = () => {
                                message.channel.send(embed)
                                    .then(() => {
                                        message.delete() // 刪除用戶輸入指令
                                        saveMsg.delete() // 刪除通知訊息
                                        console.log(`[${getTime()}]${E}已發送本子：${book.id}`)
                                        commandStarting = false // 切換指令執行狀態
                                    })
                                    .catch(error => {
                                        message.delete() // 刪除用戶輸入指令
                                        saveMsg.delete() // 刪除通知訊息
                                        console.log(error)
                                        commandStarting = false // 切換指令執行狀態
                                    })
                            }
                        })
                }
                nHentaiRandom()
                break
        }
    }
})

console.log(`[${getTime()}]${S}腳本讀取完成`)

// 登入
client.login(token)