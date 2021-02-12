'use strict'

const { text } = require('../config.json')
const Discord = require('discord.js')
const isImageURL = require('valid-image-url')
const { getTime } = require('./mix')

// 黑名單類型過濾
function nHentaiBlacklistFilter(array, name) {
    if (array.length > 0) {
        for (let i = 0; i < array.length; i++) {
            if (name === array[i]) {
                console.log(`[${getTime()}]${text.event}發現黑名單類型：${name}`)
                return true
            }
        }
    } else {
        return false
    }
}

// DiscordEmbed + 發送訊息 + 切換指令狀態
function nHentaiEmbed(title, bookId, artistName, artistUrl, blacklistEnable = '', language, tagsName, pages, commandName, prefix, command, mediaId, message) {
    let embed = new Discord.MessageEmbed()
        .setColor('#ed2553')
        .setTitle(title)
        .setURL(`https://nhentai.net/g/${bookId}/`)
        .setAuthor(`作者：${artistName}`, '', artistUrl)
        .setThumbnail('https://i.imgur.com/r36VxQt.png')
        .setDescription(blacklistEnable)
        .addFields(
            { name: 'ＩＤ：', value: bookId, inline: true},
            { name: '語言：', value: language, inline: true },
            { name: '標籤：', value: tagsName },
        )
        .setFooter(`頁數：${pages}\n${commandName}　指令：${prefix}${command}`)

    // 圖片檢查
    isImageURL(`https://t.nhentai.net/galleries/${mediaId}/cover.jpg`)
        .then(is_image => {
            if (is_image) {
                embed.setImage(`https://t.nhentai.net/galleries/${mediaId}/cover.jpg`)
                messageSend()
            } else {
                embed.setImage(`https://t.nhentai.net/galleries/${mediaId}/cover.png`)
                messageSend()
            }
        })

    // 發送訊息
    const messageSend = () => {
        message.channel.send(embed)
            .then(msg => {
                // 新增表情反應
                msg.react(message.guild.emojis.cache.get('801670133537964032')) // <:matsuri_1:801670133537964032>
                    .then(() => msg.react(message.guild.emojis.cache.get('809421688336023594'))) // <:tanjiro:809421688336023594>cls
                console.log(`[${getTime()}]${text.event}已發送本子：${bookId}`)
            })
            .catch(error => {
                console.log(error)
            })
    }
}

module.exports = {
    nHentaiBlacklistFilter,
    nHentaiEmbed,
}