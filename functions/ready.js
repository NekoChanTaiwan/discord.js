'use strict'

const { randomActivity, text } = require('../config.json')
const { getRandomInt, getTime } = require('./mix')

// 隨機自定狀態
const setRandomActivity = client => {
    client.user.setActivity(randomActivity.status[getRandomInt(randomActivity.status.length)], {type: randomActivity.type})
        .then(presence => console.log(`[${getTime()}]${text.event}已設置狀態：${presence.activities[0].name}`))
        .catch(error => console.log(error))
    setTimeout(() => {
        setRandomActivity(client)
    }, randomActivity.switchTime * 1000)
}

module.exports = {
    setRandomActivity
}