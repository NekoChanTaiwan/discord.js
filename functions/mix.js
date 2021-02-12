'use strict'

// 隨機整數
const getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max))
}

// 當前時間
const getTime = () =>  {
    return new Date().toLocaleString()
}

module.exports = {
    getRandomInt,
    getTime,
}