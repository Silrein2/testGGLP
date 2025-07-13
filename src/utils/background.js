import { backgroundImage, swirlImage } from '@/assets/GUI/backgroundGui'

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
  backgroundElement.style.backgroundColor = 'white'

  // Set the background image
  backgroundElement.style.backgroundImage = `url(${backgroundImage})`
  backgroundElement.style.backgroundSize = 'cover'
  backgroundElement.style.backgroundPosition = 'center'
  backgroundElement.style.backgroundRepeat = 'no-repeat'

  const swirlElement = document.createElement('img')
  swirlElement.src = swirlImage
  swirlElement.style.position = 'absolute'
  swirlElement.style.top = '50%'
  swirlElement.style.right = '0'
  swirlElement.style.transform = 'translateY(-50%)'
  swirlElement.style.width = '20%'
  swirlElement.style.zIndex = '0'

  swirlElement.style.pointerEvents = 'none'

  backgroundElement.appendChild(swirlElement)
}

export function setBackgroundImageAdmin() {
  const backgroundElement = document.getElementById('background-container')
  backgroundElement.style.position = 'absolute'
  backgroundElement.style.top = '0'
  backgroundElement.style.left = '0'
  backgroundElement.style.width = '100vw'
  backgroundElement.style.display = 'flex'
  backgroundElement.style.transition = 'transform 0.3s'
  backgroundElement.style.overflow = 'hidden'
  backgroundElement.style.cursor = 'pointer'
  backgroundElement.style.backgroundColor = '#4E2E1D'
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

  backgroundContainer.style.width = `100vw`
  backgroundContainer.style.height = `100vh`
  backgroundContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`
}
