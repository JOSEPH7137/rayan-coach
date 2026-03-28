// Counter Animation Script for Rayan Coach
// This script handles number counting animation on scroll for both home and about pages

class NumberCounter {
  constructor() {
    this.counters = [];
    this.hasAnimated = false;
    this.observer = null;
    this.init();
  }

  init() {
    // Find all counter elements
    this.counters = document.querySelectorAll('.counter');
    
    if (this.counters.length === 0) return;
    
    // Parse and store target values
    this.counters.forEach(counter => {
      const target = counter.getAttribute('data-target');
      if (target) {
        counter.setAttribute('data-current', 0);
      }
    });
    
    // Create intersection observer
    this.createObserver();
  }
  
  createObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.3
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.hasAnimated = true;
          this.startCounters();
          this.observer.disconnect();
        }
      });
    }, options);
    
    // Observe the stats container on home page
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
      this.observer.observe(statsContainer);
    }
    
    // Also observe stats section on about page
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      this.observer.observe(statsSection);
    }
    
    // Fallback: observe each counter container
    if (!statsContainer && !statsSection) {
      this.counters.forEach(counter => {
        const parent = counter.closest('.stat, .stat-item');
        if (parent) {
          this.observer.observe(parent);
        }
      });
    }
  }
  
  formatNumber(num, originalText) {
    // Check if original had K+ format
    const original = originalText || '';
    if (original.includes('K+') || num >= 1000) {
      if (num >= 10000) {
        return Math.floor(num / 1000) + 'K+';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K+';
      }
    }
    return Math.floor(num);
  }
  
  startCounters() {
    this.counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const originalText = counter.innerText;
      const duration = 2000; // 2 seconds
      const stepTime = 20; // Update every 20ms
      const steps = duration / stepTime;
      const increment = target / steps;
      let current = 0;
      
      const updateCounter = () => {
        current += increment;
        if (current >= target) {
          // Final value
          let finalValue;
          if (target >= 1000) {
            finalValue = (target / 1000).toFixed(target >= 10000 ? 0 : 1) + 'K+';
          } else {
            finalValue = Math.floor(target);
          }
          counter.innerText = finalValue;
          return;
        }
        
        // Intermediate value
        let displayValue;
        if (target >= 1000) {
          displayValue = (current / 1000).toFixed(1) + 'K+';
        } else {
          displayValue = Math.floor(current);
        }
        counter.innerText = displayValue;
        
        setTimeout(updateCounter, stepTime);
      };
      
      updateCounter();
    });
  }
  
  // Reset counters for replay (if needed)
  resetCounters() {
    this.hasAnimated = false;
    this.counters.forEach(counter => {
      counter.innerText = '0';
    });
    this.createObserver();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure all elements are rendered
  setTimeout(() => {
    const counterAnimation = new NumberCounter();
  }, 100);
});

// Also check for page navigation (when switching between home and about)
const originalShowPage = window.showPage;
if (typeof window.showPage === 'function') {
  window.showPage = function(pageName) {
    originalShowPage(pageName);
    // Reset counter animation when page changes
    setTimeout(() => {
      const newCounterAnimation = new NumberCounter();
    }, 200);
  };
}