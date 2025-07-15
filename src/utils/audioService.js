class AudioService {
  constructor() {
    if (!AudioService.instance) {
      this.audio = new Audio()
      AudioService.instance = this
    }
    return AudioService.instance
  }

  playSound(url) {
    this.audio.src = url
    this.audio.loop = false
    this.audio.volume = 0.3
    this.audio.play().catch((error) => console.error('Audio playback error:', error))
  }

  stopSound() {
    this.audio.pause()
    this.audio.currentTime = 0
  }
}

const instance = new AudioService()
Object.freeze(instance)

export default instance
