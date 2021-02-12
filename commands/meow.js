'use strict'

const { commands } = require('../config.json')

module.exports = {
	name: commands.meow.command,
	description: commands.meow.description,
	cooldown: 3,
	callback(message) {
		message.channel.send('喵?')
	}
}