'use strict'

module.exports = {
	name: 'meow',
	cooldown: 3,
	callback(message) {
		message.channel.send('喵?')
	}
}