// particles.js - Ambient Background Particles

class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById('particles-canvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.isVisible = false;
    
    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.setupEventListeners();
    this.animate();
    
    // Show after loading completes
    document.addEventListener('loadingComplete', () => {
      this.isVisible = true;
      this.canvas.style.opacity = '1';
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    const count = Math.min(50, Math.floor((window.innerWidth * window.innerHeight) / 20000));
    this.particles = [];
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 1.8 + 0.5,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.3 + 0.08,
        baseOpacity: Math.random() * 0.3 + 0.08,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());
    
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  animate() {
    if (!this.ctx) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Only draw if visible
    if (this.isVisible) {
      const time = Date.now() * 0.001;
      
      this.particles.forEach((p, i) => {
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Bounce off edges
        if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;
        
        // Pulse opacity
        const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.3 + 0.7;
        const currentOpacity = p.baseOpacity * pulse;
        
        // Mouse interaction - particles move away from mouse
        const dx = p.x - this.mouseX;
        const dy = p.y - this.mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 200 && distance > 0) {
          const force = (1 - distance / 200) * 0.5;
          p.x += (dx / distance) * force;
          p.y += (dy / distance) * force;
        }
        
        // Draw particle
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        const accentColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--accent-color').trim() || '#9f4ac6';
        
        this.ctx.fillStyle = accentColor;
        this.ctx.globalAlpha = currentOpacity;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        
        // Draw connections
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          
          if (dist < 150) {
            const opacity = 0.06 * (1 - dist / 150);
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = accentColor;
            this.ctx.globalAlpha = opacity;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
          }
        }
      });
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for loading to complete before showing particles
  const particleSystem = new ParticleSystem();
  
  // Update accent color when it changes
  const observer = new MutationObserver(() => {
    // Particles will pick up new color on next frame
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style']
  });
});