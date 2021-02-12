'use strict'

const { text } = require('../config.json')
const { getTime } = require('../functions/mix')

module.exports = {
	name: 'clear',
    description: '刪除文字',
	cooldown: 3,
    args: true,
	async callback(message, args) {
        if(!args[0]) return message.reply('請輸入想要刪除的`數值`')
        if(isNaN(args[0])) return message.reply('請輸入想要刪除的`數值`')
        if(args[0] > 100) return message.reply('請輸入低於`100`的數值')
        if(args[0] < 1) return message.reply('請輸入大於於`0`的數值')

        await message.channel.messages.fetch({limit: args[0]})
            .then(messages => {
                message.channel.bulkDelete(messages)
                    .then(() => {
                        message.channel.send(`\u0060\u0060\u0060[${getTime()}] 已刪除訊息：${args[0]}\u0060\u0060\u0060`)
                            .then(msg => msg.delete({ timeout: 5000 }))
                        console.log(`[${getTime()}]${text.event}已刪除訊息：${args[0]}`)
                    })
                    .catch(error => {
                        message.channel.send(`\u0060\u0060\u0060[${getTime()}] 無法刪除 14 天前的訊息\u0060\u0060\u0060`)
                        console.log(error)
                    })
            })
            .catch(error => console.log(error))
	}
}