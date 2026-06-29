const friendsData = [
  {
    id: "eddie",
    discordId: "959190681472077834",
    name: "eddie",
    description: "habiba habiba",
    color: "#4ecdc4",
  },
  {
    id: "emir",
    discordId: "1414249903055437884",
    name: "emir",
    description: "daytrading bro",
    color: "#ffd93d",
  },
  {
    id: "zaza",
    discordId: "1467259512829382950",
    name: "zaza",
    description: "zazafied",
    color: "#ff6b6b",
  },
  {
    id: "vods",
    discordId: "235718964213186560",
    name: "vods",
    description: "spends too much money on discord",
    color: "#6c5ce7",
  },
  {
    id: "sudo",
    discordId: "463360937949134852",
    name: "sudo",
    description: "mr paygate bypass",
    color: "#FF8C00",
  },
  {
    id: "repax",
    discordId: "1139990216820658257",
    name: "repax",
    description: "long time mf",
    color: "#00b894",
  },
  {
    id: "reject",
    discordId: "903969587031339019",
    name: "reject",
    description: "uh idk yet",
    color: "#FF7F7F",
  },
  {
    id: "jade",
    discordId: "925155098223591434",
    name: "jade",
    description: "twerkprincess lol",
    color: "#fd79a8",
  },
];

class FriendsMenu {
  constructor() {
    this.friends = friendsData;
    this.loadedAvatars = new Map();
    this.currentSlide = 0;
    this.itemsPerSlide = 2;
    this.totalSlides = Math.ceil(this.friends.length / this.itemsPerSlide);
    this.isAutoScrolling = true;
    this.autoScrollInterval = null;
    this.autoScrollDelay = 4000;
    this.container = null;
    this.track = null;
    this.isTransitioning = false;
    this.slideWidth = 0;
    
    this.init();
  }

  init() {
    this.container = document.getElementById("friends-scroll-container");
    this.track = document.getElementById("friends-track");

    if (!this.container || !this.track) {
      console.error("Friends container not found");
      return;
    }

    this.renderFriends();
    this.setupCarousel();
    this.setupControls();
    this.loadAvatars();
    this.startAutoScroll();
    this.setupPopupTrigger();
  }

  renderFriends() {
    this.track.innerHTML = '';

    // Create slides with 2 friends each
    for (let i = 0; i < this.totalSlides; i++) {
      const slide = document.createElement("div");
      slide.className = "friends-slide";
      slide.dataset.index = i;

      const start = i * this.itemsPerSlide;
      const end = Math.min(start + this.itemsPerSlide, this.friends.length);
      const slideFriends = this.friends.slice(start, end);

      // Create a vertical stack for friends
      const stack = document.createElement("div");
      stack.className = "friends-stack";

      slideFriends.forEach(friend => {
        const card = this.createFriendCard(friend);
        stack.appendChild(card);
      });

      // If only 1 friend in slide, add empty placeholder to maintain layout
      if (slideFriends.length === 1) {
        const placeholder = document.createElement("div");
        placeholder.className = "friend-card-placeholder";
        stack.appendChild(placeholder);
      }

      slide.appendChild(stack);
      this.track.appendChild(slide);
    }

    this.totalSlides = this.track.children.length;
    
    // Update slide width after render
    setTimeout(() => {
      this.updateSlideWidth();
    }, 100);
  }

  updateSlideWidth() {
    const containerWidth = this.container.offsetWidth;
    if (containerWidth > 0) {
      this.slideWidth = containerWidth;
      // Set each slide to exactly match container width
      document.querySelectorAll('.friends-slide').forEach(slide => {
        slide.style.minWidth = `${containerWidth}px`;
        slide.style.width = `${containerWidth}px`;
      });
    }
  }

  createFriendCard(friend) {
    const card = document.createElement("div");
    card.className = "friend-card";
    card.dataset.friendId = friend.id;

    // Avatar container
    const avatarWrapper = document.createElement("div");
    avatarWrapper.className = "friend-avatar-wrapper";

    const avatarImg = document.createElement("img");
    avatarImg.className = "friend-avatar";
    avatarImg.id = `friend-avatar-${friend.id}`;
    avatarImg.alt = friend.discordId || friend.id;
    avatarImg.src = "assets/img/black.png";
    avatarImg.loading = "lazy";

    // Decoration overlay
    const decorationOverlay = document.createElement("div");
    decorationOverlay.className = "friend-decoration";
    decorationOverlay.id = `friend-decoration-${friend.id}`;

    avatarWrapper.appendChild(avatarImg);
    avatarWrapper.appendChild(decorationOverlay);

    // Info container
    const infoContainer = document.createElement("div");
    infoContainer.className = "friend-info";

    const nameEl = document.createElement("div");
    nameEl.className = "friend-name";
    nameEl.textContent = friend.name;
    if (friend.color) {
      nameEl.style.color = friend.color;
    }

    const descEl = document.createElement("div");
    descEl.className = "friend-description";
    descEl.textContent = friend.description || "✦";

    infoContainer.appendChild(nameEl);
    infoContainer.appendChild(descEl);

    // Fade effect
    const fadeEl = document.createElement("div");
    fadeEl.className = "friend-fade";

    card.appendChild(avatarWrapper);
    card.appendChild(infoContainer);
    card.appendChild(fadeEl);

    // Store reference for avatar loading
    card.dataset.discordId = friend.discordId;
    card.dataset.friendName = friend.name;

    return card;
  }

  setupCarousel() {
    // Update slide width on resize
    window.addEventListener('resize', () => {
      this.updateSlideWidth();
    });

    // Set initial position
    setTimeout(() => {
      this.goToSlide(0, false);
    }, 200);

    // Snap scroll on user interaction
    let snapTimeout = null;

    this.container.addEventListener('scroll', () => {
      if (this.isTransitioning) return;
      
      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(() => {
        if (this.slideWidth === 0) {
          this.updateSlideWidth();
        }
        const scrollLeft = this.container.scrollLeft;
        const currentSlide = Math.round(scrollLeft / this.slideWidth);
        
        if (currentSlide !== this.currentSlide && currentSlide >= 0 && currentSlide < this.totalSlides) {
          this.goToSlide(currentSlide);
        }
      }, 150);
    });
  }

  goToSlide(index, animate = true) {
    if (this.isTransitioning) return;
    if (index < 0) index = this.totalSlides - 1;
    if (index >= this.totalSlides) index = 0;
    
    this.isTransitioning = true;
    this.currentSlide = index;
    
    if (this.slideWidth === 0) {
      this.updateSlideWidth();
    }
    
    const targetScroll = index * this.slideWidth;
    
    this.container.scrollTo({
      left: targetScroll,
      behavior: animate ? 'smooth' : 'instant'
    });
    
    this.updateIndicators();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
    
    this.resetAutoScroll();
  }

  setupControls() {
    // Navigation buttons
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const playBtn = document.getElementById('carousel-play');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.goToSlide(this.currentSlide - 1);
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.goToSlide(this.currentSlide + 1);
      });
    }
    
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.toggleAutoScroll();
      });
    }
    
    // Create dot indicators
    this.createDots();
  }

  createDots() {
    const dotsContainer = document.getElementById('carousel-dots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < this.totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === this.currentSlide ? ' active' : '');
      dot.dataset.index = i;
      dot.addEventListener('click', () => {
        this.goToSlide(i);
      });
      dotsContainer.appendChild(dot);
    }
  }

  updateIndicators() {
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentSlide);
    });
  }

  startAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
    
    this.autoScrollInterval = setInterval(() => {
      if (this.isAutoScrolling && !this.isTransitioning) {
        this.goToSlide(this.currentSlide + 1);
      }
    }, this.autoScrollDelay);
  }

  resetAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.startAutoScroll();
    }
  }

  toggleAutoScroll() {
    this.isAutoScrolling = !this.isAutoScrolling;
    const btn = document.getElementById('carousel-play');
    if (btn) {
      btn.textContent = this.isAutoScrolling ? '⏸' : '▶';
      btn.classList.toggle('paused', !this.isAutoScrolling);
    }
  }

  async loadAvatars() {
    const avatarElements = document.querySelectorAll(".friend-avatar");

    for (const img of avatarElements) {
      const discordId = img.alt;
      if (!discordId || discordId === "") {
        img.src = this.getDefaultAvatar();
        continue;
      }

      try {
        if (this.loadedAvatars.has(discordId)) {
          img.src = this.loadedAvatars.get(discordId);
          continue;
        }

        const response = await fetch(
          `https://api.wxrn.lol/discord/user/${discordId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.avatarUrl) {
            img.src = data.avatarUrl;
            this.loadedAvatars.set(discordId, data.avatarUrl);

            if (data.profileDecorationUrl) {
              const decoEl = document.getElementById(
                `friend-decoration-${img.id.replace("friend-avatar-", "")}`
              );
              if (decoEl) {
                decoEl.style.backgroundImage = `url(${data.profileDecorationUrl})`;
                decoEl.style.backgroundSize = "cover";
                decoEl.style.backgroundPosition = "center";
                decoEl.style.opacity = "0.6";
              }
            }
          } else {
            img.src = this.getDefaultAvatar();
          }
        } else {
          img.src = this.getDefaultAvatar();
        }
      } catch (error) {
        console.error(`Failed to load avatar for ${discordId}:`, error);
        img.src = this.getDefaultAvatar();
      }
    }
  }

  getDefaultAvatar() {
    return (
      "data:image/svg+xml," +
      encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <rect width="64" height="64" fill="#7289da" rx="32"/>
        <text x="32" y="40" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">👤</text>
      </svg>
    `)
    );
  }

  setupPopupTrigger() {
    document.addEventListener("popupOpened", () => {
      this.loadAvatars();
      setTimeout(() => {
        this.updateSlideWidth();
        this.goToSlide(0, false);
      }, 100);
    });
  }

  refresh() {
    this.track.innerHTML = "";
    this.currentSlide = 0;
    this.loadedAvatars.clear();
    this.renderFriends();
    this.loadAvatars();
    this.createDots();
    setTimeout(() => {
      this.updateSlideWidth();
      this.goToSlide(0, false);
    }, 100);
  }
}

// ============================================
// CLOSE POPUP FUNCTION
// ============================================

window.closePopup = function () {
  const popup = document.getElementById("popup");
  const overlay = document.getElementById("overlay");

  if (popup) popup.classList.remove("show");
  if (overlay) overlay.classList.remove("show");

  if (window.friendsMenu) {
    window.friendsMenu.isAutoScrolling = false;
  }

  setTimeout(() => {
    if (popup) popup.style.display = "none";
    if (overlay) overlay.style.display = "none";
  }, 300);
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  const checkInterval = setInterval(() => {
    const loadingScreen = document.getElementById("loading-screen");
    if (!loadingScreen || loadingScreen.style.display === "none") {
      clearInterval(checkInterval);
      setTimeout(() => {
        window.friendsMenu = new FriendsMenu();
        console.log("👥 Friends carousel initialized");
      }, 500);
    }
  }, 500);
});

document.addEventListener("loadingComplete", () => {
  setTimeout(() => {
    if (!window.friendsMenu) {
      window.friendsMenu = new FriendsMenu();
    }
  }, 300);
});

window.friendsMenu = null;