'use strict'

const { commands } = require('../config.json')

module.exports = {
	name: commands.reload.command,
	description: commands.reload.description,
	cooldown: 3,
	args: true,
	callback(message, args) {
		const commandName = args[0].toLowerCase()
		const command = message.client.commands.get(commandName)
			|| message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) {
			return message.channel.send(`找不到 \`${commandName}\` 這個指令...`)
		}

		delete require.cache[require.resolve(`./${command.name}.js`)]

		try {
			const newCommand = require(`./${command.name}.js`)
			message.client.commands.set(newCommand.name, newCommand)
			message.channel.send(`指令 \`${command.name}\` 已重新讀取`)
		} catch (error) {
			console.error(error)
			message.channel.send(`重新讀取指令時發現了錯誤 \`${command.name}\`:\n\`${error.message}\``)
		}
	},
}