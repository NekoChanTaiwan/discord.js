// NekoChanTaiwan Discord.js
// Discord.js       npm install discord.js        https://discord.js.org/#/docs/main/stable/general/welcome
// nHentai API      npm install nana-api          https://www.npmjs.com/package/nana-api
// valid-image-url  npm install valid-image-url   https://www.npmjs.com/package/valid-image-url

'use strict'

const Discord = require('discord.js')
const NanaAPI = require('nana-api')
const isImageURL = require('valid-image-url')


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
        randomTagsFilter: ['futanari', 'scat', 'pig man', 'ryona', 'coprohagia', 'spider girl', 'alien', 'pig girl', 'nipple fuck', 'males only', 'pig', 'yaoi', 'insect', 'guro', 'cannibalism', 'eggs', 'muscle'],
        // 隨機本本作者過濾（陣列：字符串）
        randomArtistFilter: ['sakamoto kafka'],
        // 隨機本本語言過濾（陣列：字符串）
        randomLanguageFilter: ['english', 'japanese'],
    },
}

const client = new Discord.Client()
const nanaAPI = new NanaAPI
const commandPrefix = new RegExp(custom.commandPrefix)

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
    // 指令前綴偵測 及 指令執行狀態
    if (commandPrefix.test(message.content) && commandStarting === false) {
        // 指令偵測
        switch (message.content) {
            // nHentai 隨機本本
            case `${custom.commandPrefix}${custom.nHentai.randomCommand}`:
                // 切換指令執行狀態
                commandStarting = true
                // 初始化變量
                let saveMsg = null
                // 發送通知
                message.channel.send('正在努力尋找本本...')
                    .then(msg => saveMsg = msg)

                const nHentaiRandom = () => {
                    let embed = null, artistName = '', artistUrl = '', tagsName = '', coverUrl = '', language = ''
                    // nHentai API .random()
                    nanaAPI.random()
                        .then(book => {

                            // 類型處理
                            for (let value of book.tags) {
                                if (value.type === 'tag') {
                                    // 過濾分類
                                    if (nHentaiFilter(custom.nHentai.randomTagsFilter, value.name) === true) {
                                        message.channel.send(`發現過濾類型：${value.name}，努力尋找其他本本中...`)
                                            .then(msg => msg.delete({ timeout: 1000 }))
                                        return nHentaiRandom()
                                    }
                                    tagsName += `${value.name}, `
                                } else {
                                    switch (value.type) {
                                            case 'artist':
                                                // 過濾作者
                                                if (nHentaiFilter(custom.nHentai.randomArtistFilter, value.name) === true) {
                                                    message.channel.send(`發現過濾類型：${value.name}，努力尋找其他本本中...`)
                                                        .then(msg => msg.delete({ timeout: 1000 }))
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
                                                            message.channel.send(`發現過濾類型：${value.name}，努力尋找其他本本中...`)
                                                                .then(msg => msg.delete({ timeout: 1000 }))
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
client.login(custom.token)