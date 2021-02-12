'use strict'

// NekoChanTaiwan Discord.js
// Discord.js       npm install discord.js        https://discord.js.org/#/docs/main/stable/general/welcome
// nHentai API      npm install nana-api          https://www.npmjs.com/package/nana-api
// valid-image-url  npm install valid-image-url   https://www.npmjs.com/package/valid-image-url

const { token, prefix, text } = require('./config.json')
const fs = require('fs')
const Discord = require('discord.js')
const { setRandomActivity } = require('./functions/ready')
const { getTime } = require('./functions/mix')

const client = new Discord.Client()
const cooldowns = new Discord.Collection()
client.commands = new Discord.Collection()

// 動態載入指令
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

// 就緒事件
client.on('ready', () => {
    console.log(`[${getTime()}]${text.event}已登入 ${client.user.tag}`)
    // 設定隨機狀態
    setRandomActivity(client)
})

// 訊息事件
client.on('message', message => {
    // 指令
	if (!message.content.startsWith(prefix) || message.author.bot) return

	const args = message.content.slice(prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()

    if (!client.commands.has(commandName)) return

    const command = client.commands.get(commandName)

    if (command.args && !args.length) {
		let reply = `請傳入需要的參數`
            .then(msg => msg.delete({ setTimeout: 5000}))

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``
		}

		return message.channel.send(reply)
	}

    // 冷卻
    if (!cooldowns.has(command.name)) {
	    cooldowns.set(command.name, new Discord.Collection())
    }
    const now = Date.now()
    const timestamps = cooldowns.get(command.name)
    const cooldownAmount = (command.cooldown || 3) * 1000
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000
            return message.reply(`請在等待 ${timeLeft.toFixed(1)} 秒後，才能繼續使用 \`${command.name}\` 指令`)
                .then(msg => {
                    message.delete({ timeout: 3000})
                    msg.delete({ timeout: 3000 })
                })
        }
    }
    timestamps.set(message.author.id, now)
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

    // 執行指令
	try {
        command.execute(message, args)
        message.delete({ timeout: 5000 })
	} catch (error) {
		console.error(error)
	}
})

client.login(token)