export function setBackgroundImage() {
  const backgroundElement = document.getElementById('background-container')
  backgroundElement.style.position = 'absolute'
  backgroundElement.style.top = '0'
  backgroundElement.style.left = '0'
  backgroundElement.style.width = '100%'
  backgroundElement.style.display = 'flex'
  backgroundElement.style.transition = 'transform 0.3s'
  backgroundElement.style.overflow = 'hidden'
  backgroundElement.style.cursor = 'pointer'
  backgroundElement.style.backgroundColor = '#4E2E1D'

  const beforeElement = document.createElement('div')
  beforeElement.style.content = ''
  beforeElement.style.position = 'absolute'
  beforeElement.style.top = '0'
  beforeElement.style.left = '0'
  beforeElement.style.width = '100%'
  beforeElement.style.paddingTop = '56.25%'
  beforeElement.style.backgroundSize = 'cover'
  beforeElement.style.backgroundPosition = 'center'
  beforeElement.style.backgroundRepeat = 'no-repeat'
  beforeElement.style.zIndex = '-1'
  beforeElement.style.transition = 'transform 2s ease'
  beforeElement.style.transform = 'scale(1)'
  beforeElement.style.transformOrigin = 'bottom center'

  backgroundElement.appendChild(beforeElement)
}

export function updateBackgroundSize() {
  const backgroundContainer = document.getElementById('background-container')
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  const targetAspectRatio = 16 / 9

  let offsetX = 0
  let offsetY = 0

  this.containerHeight = Math.max(windowHeight, windowWidth / targetAspectRatio)
  this.containerWidth = Math.max(windowWidth, this.containerHeight * targetAspectRatio)

  backgroundContainer.style.width = `${this.containerWidth}px`
  backgroundContainer.style.height = `${this.containerHeight}px`
  backgroundContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`
}
