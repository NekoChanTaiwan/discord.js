'use strict'

const { prefix, nHentai, text } = require('../config.json')
const { nHentaiEmbed } = require('../functions/nHentai')
const { getTime } = require('../functions/mix')

// nHentai API
const NanaAPI = require('nana-api')
const nanaAPI = new NanaAPI

// 初始化變量
let saveMsg = null,
    blacklistEnable = '',
    artistName = '',
    artistUrl = '',
    tagsName = '',
    language = ''

module.exports = {
	name: nHentai.find.command,
	cooldown: 10,
    args: true,
	callback(message, args) {
        let id = ''
        for (let i = 0; i < args[0].length; i++) {
            id += args[0][i]
        }


        // 發送通知
        message.channel.send(`\u0060\u0060\u0060[${getTime()}] 已偵測到指令：${nHentai.find.name}\u0060\u0060\u0060`)
        .then(msg => {
            console.log(`[${getTime()}]${text.event}已偵測到指令：${nHentai.find.name}`)
            msg.edit(`\u0060\u0060\u0060[${getTime()}] [${nHentai.find.name}] 正在努力尋找本本...\u0060\u0060\u0060`)
            saveMsg = msg
        })
        nanaAPI.g(id)
        .then(book => {
            // 重置標籤
            tagsName = ''

            // 類型處理
            for (let value of book.tags) {
                if (value.type === 'tag') {
                    tagsName += `${value.name}, `
                } else {
                    switch (value.type) {
                            case 'artist':
                                artistName = value.name
                                artistUrl = `https://nhentai.net${value.url}`
                                break
                            case 'language':
                                if (value.name === 'english' ||
                                    value.name === 'japanese' ||
                                    value.name === 'chinese') {
                                        language = value.name
                                    }
                                break
                    }
                }
            }

            // 空值檢查
            artistName = artistName === '' ? '無' : artistName
            artistUrl = artistUrl === '' ? 'https://nhentai.net/' : artistUrl
            tagsName = tagsName === '' ? '無' : tagsName

            saveMsg.delete() // 刪除通知訊息
                .then(() => {
                    nHentaiEmbed(book.title.pretty, book.id, artistName, artistUrl, blacklistEnable, language, tagsName, book.num_pages, nHentai.find.name, prefix, `${nHentai.find.command} ${book.id}`, book.media_id, message)
                })


        })
        .catch(error => {
            saveMsg.edit(`\u0060\u0060\u0060[${getTime()}] [${nHentai.find.name}] 請輸入有效的ＩＤ\u0060\u0060\u0060`)
            saveMsg.delete({ timeout: 5000 }) // 移除通知
            console.log(`[${getTime()}]${text.error}無效的ＩＤ：${id}`)
            console.log(error)
        })
	}
}