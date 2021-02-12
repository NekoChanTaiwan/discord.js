'use strict'

const { prefix, nHentai, text } = require('../config.json')
const { nHentaiBlacklistFilter, nHentaiEmbed } = require('../functions/nHentai')
const { getTime } = require('../functions/mix')

// nHentai API
const NanaAPI = require('nana-api')
const nanaAPI = new NanaAPI

// 初始化變量
let saveMsg = null,
    blacklistEnable = '',
    foundBlacklistText = '',
    artistName = '',
    artistUrl = '',
    tagsName = '',
    language = ''

module.exports = {
	name: nHentai.random.command,
    description: 'nHentai 隨機本本',
	cooldown: 10,
	callback(message) {
		// 發送通知
        message.channel.send(`\u0060\u0060\u0060[${getTime()}] 已偵測到指令：${nHentai.random.name}\u0060\u0060\u0060`)
            .then(msg => {
                console.log(`[${getTime()}]${text.event}已偵測到指令：${nHentai.random.name}`)
                msg.edit(`\u0060\u0060\u0060[${getTime()}] [${nHentai.random.name}] 正在努力尋找本本...\u0060\u0060\u0060`)
                saveMsg = msg
            })

        // 主要函式
        const nHentaiRandom = () => {
            // 重置標籤
            tagsName = '',

            // nHentai API .random()
            nanaAPI.random()
                .then(book => {
                    // 類型處理
                    for (let value of book.tags) {
                        foundBlacklistText = `\u0060\u0060\u0060[${getTime()}] [${nHentai.random.name}] 發現黑名單類型：${value.name}，努力尋找其他本本中...\u0060\u0060\u0060`
                        if (value.type === 'tag') {
                            // 過濾黑名單標籤
                            if (nHentai.random.Blacklist.enable === true &&
                                nHentaiBlacklistFilter(nHentai.random.Blacklist.tags, value.name) === true) {
                                return saveMsg.edit(foundBlacklistText)
                                        .then(() => {
                                            nHentaiRandom()
                                        })
                            }
                            tagsName += `${value.name}, `
                        } else {
                            switch (value.type) {
                                    case 'artist':
                                        // 過濾黑名單作者
                                        if (nHentai.random.Blacklist.enable === true &&
                                            nHentaiBlacklistFilter(nHentai.random.Blacklist.artists, value.name) === true) {
                                            return saveMsg.edit(foundBlacklistText)
                                                    .then(() => {
                                                        nHentaiRandom()
                                                    })
                                        }
                                        artistName = value.name
                                        artistUrl = `https://nhentai.net${value.url}`
                                        break
                                    case 'language':
                                        if (value.name === 'english' ||
                                            value.name === 'japanese' ||
                                            value.name === 'chinese') {
                                                    // 過濾黑名單語言
                                                if (nHentai.random.Blacklist.enable === true &&
                                                    nHentaiBlacklistFilter(nHentai.random.Blacklist.languages, value.name) === true) {
                                                    return saveMsg.edit(foundBlacklistText)
                                                            .then(() => {
                                                                nHentaiRandom()
                                                            })
                                                }
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

                    // 過濾黑名單檢查
                    blacklistEnable = nHentai.random.Blacklist.enable === true ? '過濾黑名單：已啟用' : '過濾黑名單：已關閉'

                    // 刪除通知訊息
                    saveMsg.delete()
                        .then(() => {
                            // DiscordEmbed + 發送訊息 + 切換指令狀態
                            nHentaiEmbed(book.title.pretty, book.id, artistName, artistUrl, blacklistEnable, language, tagsName, book.num_pages, nHentai.random.name, prefix, nHentai.random.command, book.media_id, message)
                        })

                })
        }
        // 開始執行函式
        nHentaiRandom()
	}
}