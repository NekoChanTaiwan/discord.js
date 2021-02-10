'use strict'

// 隨機整數
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// 導入 discord.js module
const Discord = require('discord.js')
const client = new Discord.Client()

const custom = {
    // 固定自定狀態 字符串
    // Activity: '露出中',

    // 隨機自定狀態（不重複）
    randomActivity: {
        // 啟用（布林值）
        Enable: true,
        // 類型（字符串）
        Type: 'COMPETING',
        // 內容（陣列：字符串）
        Array: ['NekoChan 的肉便器', 'NekoChan 的性奴隸', 'NekoChan 的小母狗', 'NekoChan 的飛機杯'],
        // 切換時間（單位：秒）
        SwitchTime: 5,
    },
}


// 事件綁定
client.on('ready', () => {
    // 初始化變量
    const E = '[事件] '
    let randomNum = null, currentNum = null
    // https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-ready
    console.log(`${E}${client.user.tag} 已登入 關閉請按 "Ctrl + C"`)

    // 狀態
    // https://discord.js.org/#/docs/main/stable/class/ClientUser?scrollTo=setActivity

    // 隨機自定狀態
    const SetRandomActivity = () => {
        randomNum = getRandomInt(custom.randomActivity.Array.length)
        currentNum = randomNum != currentNum ? randomNum : false
        if (currentNum === false) {
            return SetRandomActivity()
        }
        client.user.setActivity(custom.randomActivity.Array[currentNum], {type: custom.randomActivity.Type})
            .then(presence => {
                console.log(`${E}已設置狀態：${presence.activities[0].name}[${currentNum}]`)
                currentNum = randomNum
            })
            .catch(error => console.log(error))
        setTimeout(() => {
            SetRandomActivity()
        }, custom.randomActivity.SwitchTime * 1000)
    }
    custom.randomActivity.Enable ? SetRandomActivity() : null
})

// 登入
// https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=login
client.login('')