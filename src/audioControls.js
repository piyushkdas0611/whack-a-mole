// src/audioControls.js
// Audio management system with toggle and volume control

export class AudioManager {
  constructor() {
    this.sounds = {};
    this.isMuted = this.loadMutedState();
    this.volume = this.loadVolume();
  }

  // Load audio file
  loadSound(name, path) {
    const audio = new Audio(path);
    audio.volume = this.volume;
    this.sounds[name] = audio;
    return audio;
  }

  // Play sound with current settings
  playSound(name) {
    if (this.isMuted || !this.sounds[name]) return;
    
    const sound = this.sounds[name];
    sound.currentTime = 0;
    sound.volume = this.volume;
    sound.play().catch(err => {
      console.log('Audio play prevented:', err);
    });
  }

  // Toggle mute state
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveMutedState();
    return this.isMuted;
  }

  // Set volume (0.0 to 1.0)
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
    this.saveVolume();
    return this.volume;
  }

  // Get current volume
  getVolume() {
    return this.volume;
  }

  // Check if muted
  getMuted() {
    return this.isMuted;
  }

  // Save muted state to localStorage
  saveMutedState() {
    localStorage.setItem('whackAMole_audioMuted', JSON.stringify(this.isMuted));
  }

  // Load muted state from localStorage
  loadMutedState() {
    const saved = localStorage.getItem('whackAMole_audioMuted');
    return saved ? JSON.parse(saved) : false;
  }

  // Save volume to localStorage
  saveVolume() {
    localStorage.setItem('whackAMole_volume', this.volume.toString());
  }

  // Load volume from localStorage
  loadVolume() {
    const saved = localStorage.getItem('whackAMole_volume');
    return saved ? parseFloat(saved) : 0.5; // Default 50%
  }
}

// Singleton instance
let audioManagerInstance = null;

export function getAudioManager() {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}

// UI Update helpers
export function updateVolumeUI(volume) {
  const volumeSlider = document.getElementById('volume-slider');
  const volumeValue = document.getElementById('volume-value');
  
  if (volumeSlider) volumeSlider.value = volume;
  if (volumeValue) volumeValue.textContent = Math.round(volume * 100) + '%';
}

export function updateMuteUI(isMuted) {
  const muteButton = document.getElementById('mute-button');
  if (!muteButton) return;
  
  muteButton.textContent = isMuted ? '🔇 Unmute' : '🔊 Mute';
  muteButton.setAttribute('aria-label', isMuted ? 'Unmute sound' : 'Mute sound');
}