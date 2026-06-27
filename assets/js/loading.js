class LoadingManager {
  constructor() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.progressBar = document.getElementById('loading-progress-bar');
    this.progressPercent = document.getElementById('loading-percent');
    this.statusText = document.getElementById('loading-status');
    this.loadingPfp = document.getElementById('loading-pfp');
    this.mainPfp = document.getElementById('dc-pfp');
    this.main = document.querySelector('main');
    this.footer = document.querySelector('.site-footer');
    this.progress = 0;
    this.isComplete = false;
    this.eventDispatched = false;
    this.pfpLoaded = false;
    this.colorThief = typeof ColorThief !== 'undefined' ? new ColorThief() : null;
    this.loadedColors = null;
    this.loadedAvatarUrl = null;
    
    this.init();
  }

  init() {
    this.startLoading();
    this.loadProfilePicture();
    
    window.addEventListener('load', () => {
      console.log('📋 Window load event fired');
      if (!this.pfpLoaded) {
        this.loadProfilePicture();
      }
      setTimeout(() => this.completeLoading(), 300);
    });
    
    setTimeout(() => {
      if (!this.isComplete) {
        console.log('📋 Safety timeout reached, completing loading...');
        this.completeLoading();
      }
    }, 5000);
  }

  async loadProfilePicture() {
    if (this.pfpLoaded) return;
    
    try {
      console.log('📸 Loading profile picture for loading screen...');
      
      const response = await fetch('https://api.wxrn.lol/discord/user/1158429903629336646');
      
      if (response.ok) {
        const data = await response.json();
        if (data.avatarUrl) {
          this.loadedAvatarUrl = data.avatarUrl;
          
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            this.loadingPfp.src = data.avatarUrl;
            this.pfpLoaded = true;
            console.log('✅ Loading PFP loaded from API');
            
            // Extract and store colors
            this.loadedColors = this.extractColorsFromImage(img);
            if (this.loadedColors) {
              this.applyColorsToLoadingScreen(this.loadedColors);
            }
            
            if (this.mainPfp) {
              this.mainPfp.src = data.avatarUrl;
            }
          };
          img.onerror = () => {
            console.warn('Failed to load PFP from API, using fallback');
            this.loadingPfp.src = 'assets/img/black.png';
          };
          img.src = data.avatarUrl;
          return;
        }
      }
      
      if (this.mainPfp && this.mainPfp.src && !this.mainPfp.src.includes('black.png')) {
        this.loadingPfp.src = this.mainPfp.src;
        this.pfpLoaded = true;
        console.log('✅ Loading PFP loaded from main PFP');
        return;
      }
      
      this.loadingPfp.src = 'assets/img/black.png';
      console.log('📸 Using fallback PFP');
    } catch (error) {
      console.error('Failed to load PFP:', error);
      this.loadingPfp.src = 'assets/img/black.png';
    }
  }

  extractColorsFromImage(imgElement) {
    try {
      if (!imgElement.complete) {
        imgElement.onload = () => this.extractColorsFromImage(imgElement);
        return null;
      }

      const canvas = document.createElement('canvas');
      const size = Math.min(imgElement.width, imgElement.height) || 100;
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgElement, 0, 0, size, size);

      if (!this.colorThief) {
        console.warn('ColorThief not available');
        return null;
      }

      const dominantColor = this.colorThief.getColor(canvas);
      return {
        rgb: `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`,
        r: dominantColor[0],
        g: dominantColor[1],
        b: dominantColor[2]
      };
    } catch (error) {
      console.error('Error extracting colors:', error);
      return null;
    }
  }

  applyColorsToLoadingScreen(colors) {
    if (!colors) return;
    
    try {
      const { rgb, r, g, b } = colors;
      
      const loadingScreen = document.getElementById('loading-screen');
      const loadingGlow = document.querySelector('.loading-avatar-glow');
      const loadingRing = document.querySelector('.loading-ring');
      const loadingPfp = document.getElementById('loading-pfp');
      const progressBar = document.getElementById('loading-progress-bar');

      if (loadingScreen) {
        const darkenedBg = this.adjustColorBrightness(rgb, -90);
        loadingScreen.style.backgroundColor = darkenedBg;
      }

      if (loadingGlow) {
        loadingGlow.style.background = `radial-gradient(circle, ${rgb} 0%, transparent 70%)`;
        loadingGlow.style.opacity = '0.2';
      }

      if (loadingRing) {
        loadingRing.style.borderTopColor = rgb;
        document.documentElement.style.setProperty('--loading-ring-color', rgb);
      }

      if (loadingPfp) {
        loadingPfp.style.borderColor = rgb;
        loadingPfp.style.boxShadow = `0 0 40px rgba(${r}, ${g}, ${b}, 0.2)`;
      }

      if (progressBar) {
        progressBar.style.background = `linear-gradient(90deg, ${rgb}, ${this.adjustColorBrightness(rgb, 30)})`;
      }

      const statusText = document.getElementById('loading-status');
      const percentText = document.getElementById('loading-percent');
      
      if (statusText) {
        statusText.style.color = this.adjustColorBrightness(rgb, 60);
      }
      if (percentText) {
        percentText.style.color = rgb;
      }

      console.log('🎨 Loading screen colors applied:', rgb);
    } catch (error) {
      console.error('Error applying colors to loading screen:', error);
    }
  }

  adjustColorBrightness(color, percent) {
    const rgb = color.match(/\d+/g).map(Number);
    const adjust = (value, percent) =>
      Math.min(255, Math.max(0, value + Math.floor(value * (percent / 100))));
    const adjustedColor = rgb.map((value) => adjust(value, percent));
    return `rgb(${adjustedColor[0]}, ${adjustedColor[1]}, ${adjustedColor[2]})`;
  }

  startLoading() {
    this.updateProgress(5, 'Loading profile...');
    
    const steps = [
      { progress: 20, text: 'Loading profile picture...' },
      { progress: 35, text: 'Loading assets...' },
      { progress: 50, text: 'Loading music player...' },
      { progress: 70, text: 'Connecting to API...' },
      { progress: 85, text: 'Almost ready...' }
    ];
    
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (this.isComplete) {
        clearInterval(interval);
        return;
      }
      
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        this.updateProgress(step.progress, step.text);
        stepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);
  }

  updateProgress(progress, text) {
    this.progress = Math.min(progress, 95);
    if (this.progressBar) {
      this.progressBar.style.width = this.progress + '%';
    }
    if (this.progressPercent) {
      this.progressPercent.textContent = this.progress + '%';
    }
    if (text && this.statusText) {
      this.statusText.textContent = text;
    }
  }

  completeLoading() {
    if (this.isComplete) return;
    this.isComplete = true;
    console.log('📋 Completing loading...');
    
    this.updateProgress(100, 'Done!');
    
    if (this.loadedColors) {
      document.documentElement.style.setProperty('--accent-color', this.loadedColors.rgb);
      const textColor = this.adjustColorBrightness(this.loadedColors.rgb, 80);
      const lighterTextColor = this.adjustColorBrightness(this.loadedColors.rgb, 95);
      const darkenedBg = this.adjustColorBrightness(this.loadedColors.rgb, -90);
      
      document.documentElement.style.setProperty('--text-color', textColor);
      document.documentElement.style.setProperty('--text-color-light', lighterTextColor);
      document.documentElement.style.setProperty('--bg-color', darkenedBg);
      document.body.style.backgroundColor = darkenedBg;
    }
    
    if (this.pfpLoaded && this.mainPfp && this.loadedAvatarUrl) {
      this.mainPfp.src = this.loadedAvatarUrl;
    }
    
    setTimeout(() => {
      if (this.loadingScreen) {
        this.loadingScreen.style.opacity = '0';
        this.loadingScreen.style.transition = 'opacity 0.6s ease';
      }
      
      if (this.main) {
        this.main.style.display = 'flex';
        this.main.style.opacity = '1';
        this.main.style.visibility = 'visible';
        this.main.classList.add('fade-in');
      }
      
      if (this.footer) {
        this.footer.style.opacity = '1';
        this.footer.classList.add('visible');
      }
      
      setTimeout(() => {
        if (this.loadingScreen) {
          this.loadingScreen.style.display = 'none';
        }
        
        if (!this.eventDispatched) {
          this.eventDispatched = true;
          const event = new CustomEvent('loadingComplete', {
            detail: { 
              timestamp: Date.now(),
              success: true,
              colors: this.loadedColors,
              avatarUrl: this.loadedAvatarUrl
            }
          });
          document.dispatchEvent(event);
          console.log('✅ loadingComplete event dispatched with colors');
        }
      }, 700);
    }, 400);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('📋 DOM ready, initializing LoadingManager...');
  setTimeout(() => {
    new LoadingManager();
  }, 100);
});

window.loadingManager = null;