const socket = io('http://192.168.1.174:3001')

socket.on('connect', () => {
  addMouseTouchPadListener(socket)
})

/** 监听鼠标遥控点击按钮事件 */
const addMouseClickButtonsListener = onEmit => {
  document.getElementById('中').addEventListener('click', () => onEmit('mouse-left-click'))
}
/** 监听鼠标遥控移动按钮事件 */
const addMouseMoveButtonsListener = onEmit => {
  /** 增量/毫秒 */
  const speed = 1
  const delta = { dx: 0, dy: 0 }
  setInterval(() => {
    if (delta.dx === 0 && delta.dy === 0) return

    onEmit({ ...delta })

    delta.dx = 0
    delta.dy = 0
  }, 1000 / 60)

  const list = [
    { id: '上', timer: null, delta: { dx: 0, dy: -speed } },
    { id: '下', timer: null, delta: { dx: 0, dy: +speed } },
    { id: '左', timer: null, delta: { dx: -speed, dy: 0 } },
    { id: '右', timer: null, delta: { dx: +speed, dy: 0 } }
  ]

  list.forEach(item => {
    document.getElementById(item.id).addEventListener('touchstart', () => {
      item.timer = setInterval(() => {
        delta.dx += item.delta.dx * 10
        delta.dy += item.delta.dy * 10
      }, 10)
    })
    document.getElementById(item.id).addEventListener('touchend', () => {
      clearInterval(item.timer)
    })
  })
}

/** 触控板监听 */
const addMouseTouchPadListener = socket => {
  const stopEvent = event => {
    event.stopImmediatePropagation()
    event.stopPropagation()
    event.preventDefault()
  }

  const touchPad = document.getElementById('touch-pad')

  const start = { x: 0, y: 0 }
  const current = { x: 0, y: 0 }
  const count = { left: 0, right: 0, timer: null }

  touchPad.addEventListener('touchstart', event => {
    const touch = event.touches[0]
    start.x = current.x = touch.clientX
    start.y = current.y = touch.clientY

    const isLeft = touch.clientX < window.innerWidth / 2
    if (isLeft) count.left++
    else count.right++

    clearTimeout(count.timer)
    count.timer = setTimeout(() => {
      if (count.left >= 3 || count.right >= 3) socket.emit('mouse-toggle-down')
      if (count.left === 2) socket.emit('mouse-left-click')
      if (count.right === 2) socket.emit('mouse-right-click')
      count.left = 0
      count.right = 0
    }, 200)

    stopEvent(event)
  })

  touchPad.addEventListener('touchmove', event => {
    const touch = event.touches[0]
    current.x = touch.clientX
    current.y = touch.clientY

    stopEvent(event)
  })

  touchPad.addEventListener('touchend', event => {
    socket.emit('mouse-toggle-up')
    start.x = current.x = 0
    start.y = current.y = 0
    stopEvent(event)
  })

  setInterval(() => {
    const delta = { dx: 0, dy: 0 }
    delta.dx = Math.floor((current.x - start.x) * 3)
    delta.dy = Math.floor((current.y - start.y) * 3)
    start.x = current.x
    start.y = current.y

    if (delta.dx !== 0 || delta.dy !== 0) socket.emit('mouse-move', delta)
  }, 10)
}
