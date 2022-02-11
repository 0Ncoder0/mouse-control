import { Server } from 'socket.io'
import { createServer } from 'http'
import robot from 'robotjs'
import express from 'express'
import os from 'os'

const addSocketListener = () => {
  const port = 3001
  const httpServer = createServer().listen(port)

  console.info(`Socket on ${getIp()}:${port}`)

  const io = new Server(httpServer, { cors: { origin: '*' } })

  io.on('connection', socket => {
    let isToggle = false
    socket.on('mouse-toggle-down', () => {
      isToggle = true
      robot.mouseToggle('down')
      console.info(`mouse toggle down`)
    })

    socket.on('mouse-toggle-up', () => {
      if (isToggle) {
        isToggle = false
        robot.mouseToggle('up')
        console.info(`mouse toggle up`)
      }
    })

    socket.on('mouse-left-click', () => {
      console.info(`mouse left click`)
      robot.mouseClick('left')
    })

    socket.on('mouse-right-click', () => {
      console.info(`mouse right click`)
      robot.mouseClick('right')
    })

    socket.on('mouse-move', data => {
      const pos = robot.getMousePos()
      pos.x += data.dx + 1
      pos.y += data.dy + 1
      console.info(`move mouse to x:${pos.x} y:${pos.y}`)
      isToggle ? robot.dragMouse(pos.x, pos.y) : robot.moveMouse(pos.x, pos.y)
    })
  })
}

const addHttpListener = () => {
  const port = 3000
  const app = express()

  app.use(express.static('public'))

  app.listen(port)
  console.info(`Static File on ${getIp()}:${port}`)
}

const getIp = () => {
  const obj = os.networkInterfaces()
  for (const key of Object.keys(obj)) {
    const list = obj[key] || []
    for (const item of list) {
      if (item.family === 'IPv4' && item.internal === false) {
        return item.address
      }
    }
  }
}

addSocketListener()
addHttpListener()
