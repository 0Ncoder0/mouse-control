const socket = io('http://192.168.1.174:3001')

socket.on('connect', () => {
  addMouseTouchPadListener(socket)
  addKeyboardListener(socket)
  addSwitchListener()
})

const stopEvent = event => {
  event.stopImmediatePropagation()
  event.stopPropagation()
  event.preventDefault()
}

/** 触控板监听 */
const addMouseTouchPadListener = socket => {
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

/** 键盘监听 */
const addKeyboardListener = socket => {
  const keyboard = document.getElementById('keyboard')

  const keys = ['123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map(ele => ele.split(''))
  const specialKeys = [
    { key: 'shift', value: 'shift' },
    { key: 'space', value: 'space' },
    { key: 'backspace', value: 'backspace' },
    { key: 'enter', value: 'enter' }
  ]

  const createRowDiv = () => {
    const div = document.createElement('div')
    div.style.display = 'flex'
    div.style.alignItems = 'center'
    div.style.justifyContent = 'center'
    return div
  }
  const createKeyDiv = key => {
    const div = document.createElement('div')
    div.style.display = 'flex'
    div.style.alignItems = 'center'
    div.style.justifyContent = 'center'
    div.style.fontSize = '6vw'
    div.style.padding = '1vw 2vw'
    div.style.margin = '0.5vw'
    div.style.minWidth = '8vw'
    div.style.border = '1px solid #DCDFE6'
    div.style.borderRadius = '5px'
    div.style.boxSizing = 'border-box'
    div.innerText = key
    div.addEventListener('click', () => socket.emit('key-tap', key))
    return div
  }
  {
    keys.forEach(row => {
      const rowDiv = createRowDiv()
      keyboard.appendChild(rowDiv)
      row.forEach(key => rowDiv.appendChild(createKeyDiv(key)))
    })
  }

  {
    const rowDiv = createRowDiv()
    specialKeys.forEach(item => rowDiv.appendChild(createKeyDiv(item.key)))
    keyboard.appendChild(rowDiv)
  }
}

/** 监听切换 */
const addSwitchListener = () => {
  const switchKeyboard = document.getElementById('switch-keyboard')
  const switchTouchPad = document.getElementById('switch-touch-pad')

  const touchPad = document.getElementById('touch-pad')
  const keyboard = document.getElementById('keyboard')

  switchKeyboard.addEventListener('click', () => {
    switchKeyboard.style.color = '#409EFF'
    switchTouchPad.style.color = '#909399'

    keyboard.style.display = 'block'
    touchPad.style.display = 'none'
  })

  switchTouchPad.addEventListener('click', () => {
    switchTouchPad.style.color = '#409EFF'
    switchKeyboard.style.color = '#909399'

    touchPad.style.display = 'block'
    keyboard.style.display = 'none'
  })

  switchTouchPad.click()
}
