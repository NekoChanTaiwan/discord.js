'use strict'

module.exports = {
	name: 'meow',
	cooldown: 3,
	execute(message) {
		message.channel.send('喵?')
	}
}