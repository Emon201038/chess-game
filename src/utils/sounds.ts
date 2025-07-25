export class ChessAudio {
  private static instance: ChessAudio
  private soundEnabled = true
  private audioCache: { [key: string]: HTMLAudioElement } = {}

  static getInstance(): ChessAudio {
    if (!ChessAudio.instance) {
      ChessAudio.instance = new ChessAudio()
    }
    return ChessAudio.instance
  }

  private async loadSound(url: string): Promise<HTMLAudioElement> {
    if (this.audioCache[url]) {
      return this.audioCache[url]
    }

    const audio = new Audio(url)
    audio.preload = "auto"
    this.audioCache[url] = audio
    audio.volume = 1
    return audio
  }

  private async playSound(url: string, volume = 0.7) {
    if (!this.soundEnabled) return

    try {
      const audio = await this.loadSound(url)
      audio.volume = volume
      audio.currentTime = 0
      await audio.play()
    } catch (error) {
      console.warn("Could not play sound:", error)
    }
  }

  async playMoveSound() {
    await this.playSound("/audio/move.mp3")
  }

  async playCaptureSound() {
    await this.playSound("/audio/move.mp3")
  }

  async playCastleSound() {
    await this.playSound("/audio/move.mp3")
  }

  async playCheckSound() {
    await this.playMoveSound() // Use move sound for check
  }

  async playGameEndSound() {
    await this.playMoveSound() // Use move sound for game end
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled
    return this.soundEnabled
  }

  isSoundEnabled() {
    return this.soundEnabled
  }
}
