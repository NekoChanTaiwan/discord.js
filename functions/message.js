'use strict'

const { text, images } = require('../config.json')
const { getRandomInt, getTime } = require('./mix')

// 回復圖片訊息
const imageMessage = message => {
    switch(message.content) {
        case '不知道':
        case '我不知道':
        case '窩不知道':
        case 'idk':
            message.channel.send(images.idk[getRandomInt(images.idk.length)])
                .then(() => console.log(`[${getTime()}]${text.event}發送圖片訊息`))
            break
        case 'ㄏ一魯':
        case 'HEAL':
        case 'heal':
            message.channel.send(images.heal[getRandomInt(images.heal.length)])
                .then(() => console.log(`[${getTime()}]${text.event}發送圖片訊息`))
            break
        case '騙人的吧':
            message.channel.send(images.lie[getRandomInt(images.lie.length)])
                .then(() => console.log(`[${getTime()}]${text.event}發送圖片訊息`))
            break
    }
}

module.exports = {
    imageMessage,
}