// ==================== THEME TOGGLE WITH PERSISTENCE ====================
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    if (themeIcon) themeIcon.className = 'fas fa-sun';
    if (themeText) themeText.textContent = 'Dark';
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    if (themeIcon) themeIcon.className = 'fas fa-sun';
    if (themeText) themeText.textContent = 'Light';
    localStorage.setItem('theme', 'light');
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  
  // Default to light mode if no preference saved
  if (savedTheme === 'dark') {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    // Update icons if they exist
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (themeIcon) themeIcon.className = 'fas fa-moon';
    if (themeText) themeText.textContent = 'Dark';
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (themeIcon) themeIcon.className = 'fas fa-sun';
    if (themeText) themeText.textContent = 'Light';
  }
}

// Make sure theme loads on every page

// Also run immediately to prevent flash
loadTheme();

// ==================== TOAST ====================
function showToast(msg, type = 'success', dur = 3500) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const colors = { success: '#0FCF7D', error: '#F04545', info: '#E8A020', warning: '#E8A020' };
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<div class="toast-dot" style="background:${colors[type]};"></div><span style="flex:1;">${msg}</span><span style="cursor:pointer;" onclick="this.parentElement.remove()">×</span>`;
  c.appendChild(t);
  setTimeout(() => t.style.opacity = '0', dur - 300);
  setTimeout(() => t.remove(), dur);
}

// ==================== CAROUSEL TYPING ====================
const typingText = "WELCOME TO RAYAN COACH";
let typingTimeouts = {};
let currentTypingSlide = 0;

function startTypingForSlide(slideIndex) {
  if (typingTimeouts[slideIndex]) {
    typingTimeouts[slideIndex].forEach(timeout => clearTimeout(timeout));
  }
  typingTimeouts[slideIndex] = [];
  
  const typingElement = document.getElementById(`typingLine${slideIndex}`);
  if (!typingElement) return;
  
  let currentCharIndex = 0;
  let isDeleting = false;
  
  function typeEffect() {
    if (!typingElement) return;
    
    if (!isDeleting && currentCharIndex <= typingText.length) {
      typingElement.textContent = typingText.substring(0, currentCharIndex);
      currentCharIndex++;
      
      if (currentCharIndex > typingText.length) {
        isDeleting = true;
        const timeout = setTimeout(typeEffect, 3000);
        typingTimeouts[slideIndex].push(timeout);
        return;
      }
    } else if (isDeleting && currentCharIndex >= 0) {
      typingElement.textContent = typingText.substring(0, currentCharIndex);
      currentCharIndex--;
      
      if (currentCharIndex < 0) {
        isDeleting = false;
        currentCharIndex = 0;
        const timeout = setTimeout(typeEffect, 500);
        typingTimeouts[slideIndex].push(timeout);
        return;
      }
    }
    
    const speed = isDeleting ? 50 : 100;
    const timeout = setTimeout(typeEffect, speed);
    typingTimeouts[slideIndex].push(timeout);
  }
  
  typeEffect();
}

function initCarousel() {
  const slides = document.querySelector('.carousel-slides');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  let currentIndex = 0;
const totalSlides = document.querySelectorAll('.carousel-slide').length;
  let autoSlideInterval;

  startTypingForSlide(0);
  currentTypingSlide = 0;

  function updateCarousel() {
    if (slides) {
      slides.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
    
    if (currentTypingSlide !== currentIndex) {
      if (typingTimeouts[currentTypingSlide]) {
        typingTimeouts[currentTypingSlide].forEach(timeout => clearTimeout(timeout));
      }
      currentTypingSlide = currentIndex;
      startTypingForSlide(currentIndex);
    }
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
  }

  function startAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
    }
  }

  if (prevBtn && nextBtn) {
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
    
    newPrevBtn.addEventListener('click', () => {
      stopAutoSlide();
      prevSlide();
      startAutoSlide();
    });

    newNextBtn.addEventListener('click', () => {
      stopAutoSlide();
      nextSlide();
      startAutoSlide();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopAutoSlide();
      currentIndex = index;
      updateCarousel();
      startAutoSlide();
    });
  });

  startAutoSlide();

  const carouselContainer = document.querySelector('.carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);
  }
}

// ==================== ROLE SELECTION TYPING ====================
const heroTypingText = "WELCOME TO RAYAN COACH";
let heroTypingTimeout = null;
let heroTypingActive = false;

function startHeroTyping() {
  const typingElement = document.getElementById('typingHeroLine');
  if (!typingElement) return;
  
  if (heroTypingTimeout) {
    clearTimeout(heroTypingTimeout);
    heroTypingTimeout = null;
  }
  
  heroTypingActive = true;
  let currentCharIndex = 0;
  let isDeleting = false;
  
  function heroTypeEffect() {
    if (!typingElement || !heroTypingActive) return;
    
    if (!isDeleting && currentCharIndex <= heroTypingText.length) {
      typingElement.textContent = heroTypingText.substring(0, currentCharIndex);
      currentCharIndex++;
      
      if (currentCharIndex > heroTypingText.length) {
        isDeleting = true;
        heroTypingTimeout = setTimeout(heroTypeEffect, 3000);
        return;
      }
    } else if (isDeleting && currentCharIndex >= 0) {
      typingElement.textContent = heroTypingText.substring(0, currentCharIndex);
      currentCharIndex--;
      
      if (currentCharIndex < 0) {
        isDeleting = false;
        currentCharIndex = 0;
        heroTypingTimeout = setTimeout(heroTypeEffect, 500);
        return;
      }
    }
    
    const speed = isDeleting ? 50 : 100;
    heroTypingTimeout = setTimeout(heroTypeEffect, speed);
  }
  
  heroTypeEffect();
}

function stopHeroTyping() {
  heroTypingActive = false;
  if (heroTypingTimeout) {
    clearTimeout(heroTypingTimeout);
    heroTypingTimeout = null;
  }
}

// ==================== SCROLL EFFECT ====================
window.addEventListener('scroll', function() {
  const nav = document.querySelector('.main-nav');
  if (nav) {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
});

// Make functions globally available
window.App = {
  toggleTheme,
  loadTheme,
  showToast,
  initCarousel
};
window.loadTheme = loadTheme;
window.showToast = showToast;
window.initCarousel = initCarousel;
window.startHeroTyping = startHeroTyping;
window.stopHeroTyping = stopHeroTyping;