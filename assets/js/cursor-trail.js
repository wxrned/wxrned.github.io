class CursorTrail {
  constructor() {
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.isActive = false;
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    
    this.init();
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'cursor-trail';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '99999';
    this.canvas.style.background = 'transparent';
    
    document.body.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    
    // Event listeners
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('resize', this.resize.bind(this));
    
    // Only start when mouse enters
    document.addEventListener('mouseenter', () => {
      this.isActive = true;
      this.animate();
    });
    
    document.addEventListener('mouseleave', () => {
      this.isActive = false;
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  onMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    
    // Create new particle
    this.createParticle();
  }

  createParticle() {
    // Get accent color
    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent-color').trim() || '#9f4ac6';
    
    // Parse RGB values from the color
    const rgb = this.hexToRgb(accentColor) || { r: 159, g: 74, b: 198 };
    
    const particle = {
      x: this.mouseX,
      y: this.mouseY,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2,
      life: 1,
      decay: Math.random() * 0.02 + 0.01,
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      alpha: Math.random() * 0.5 + 0.3
    };
    
    this.particles.push(particle);
    
    // Limit particles
    if (this.particles.length > 100) {
      this.particles.shift();
    }
  }

  hexToRgb(hex) {
    const result = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      };
    }
    // Handle rgb(r, g, b) format
    const rgbMatch = hex.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      };
    }
    return null;
  }

  animate() {
    if (!this.isActive) {
      // Clear canvas if not active
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      return;
    }
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.x += p.speedX;
      p.y += p.speedY;
      p.life -= p.decay;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Draw particle with glow effect
      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
      gradient.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha * p.life})`);
      gradient.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, 0)`);
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      
      // Core dot
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${p.alpha * p.life * 0.8})`;
      this.ctx.fill();
    }
    
    // Connect particles with lines
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 60) {
          const p1 = this.particles[i];
          const p2 = this.particles[j];
          const avgLife = (p1.life + p2.life) / 2;
          const alpha = (1 - distance / 60) * avgLife * 0.3;
          
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(159, 74, 198, ${alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
    
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
  }

  // Clean up on page unload
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.canvas) {
      this.canvas.remove();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for everything to load
  setTimeout(() => {
    const trail = new CursorTrail();
    // Store for cleanup
    window.cursorTrail = trail;
  }, 500);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.cursorTrail) {
    window.cursorTrail.destroy();
  }
});