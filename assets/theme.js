
(function() {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    initTheme();
  });

  function initTheme() {
    // Initialize all components
    initLazyLoading();
    initCartFunctionality();
    initSearchFunctionality();
    initWishlist();
    initProductQuickView();
    initScrollAnimations();
  }

  // Lazy Loading Images
  function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      images.forEach(img => img.classList.add('loaded'));
    }
  }

  // Cart Functionality
  function initCartFunctionality() {
    const cartIcon = document.getElementById('cart-icon-bubble');
    
    if (!cartIcon) return;

    // Update cart count
    function updateCartCount(count) {
      const countElement = cartIcon.querySelector('span');
      if (countElement) {
        countElement.textContent = count;
        cartIcon.classList.add('cart-updated');
        setTimeout(() => cartIcon.classList.remove('cart-updated'), 300);
      }
    }

    // Listen for cart updates
    document.addEventListener('cart:updated', function(event) {
      if (event.detail && event.detail.item_count !== undefined) {
        updateCartCount(event.detail.item_count);
      }
    });
  }

  // Search Functionality
  function initSearchFunctionality() {
    const searchToggle = document.getElementById('searchToggle');
    
    if (!searchToggle) return;

    searchToggle.addEventListener('click', function() {
      // Create search overlay
      const searchOverlay = document.createElement('div');
      searchOverlay.className = 'fixed inset-0 bg-black/95 z-50 flex items-center justify-center';
      searchOverlay.innerHTML = `
        <div class="container mx-auto px-6">
          <button class="absolute top-6 right-6 text-white" id="searchClose">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
          <div class="max-w-3xl mx-auto">
            <form action="/search" method="get" class="relative">
              <input 
                type="search" 
                name="q" 
                placeholder="Buscar productos..." 
                class="w-full bg-white/10 border border-white/20 text-white px-6 py-4 text-lg focus:outline-none focus:border-white"
                autofocus
              >
              <button type="submit" class="absolute right-4 top-1/2 -translate-y-1/2 text-white">
                <i data-lucide="search" class="w-6 h-6"></i>
              </button>
            </form>
          </div>
        </div>
      `;
      
      document.body.appendChild(searchOverlay);
      lucide.createIcons();

      // Animate in
      gsap.fromTo(searchOverlay, 
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );

      // Close search
      document.getElementById('searchClose').addEventListener('click', function() {
        gsap.to(searchOverlay, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => searchOverlay.remove()
        });
      });

      // Close on Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchOverlay) {
          searchOverlay.remove();
        }
      });
    });
  }

  // Wishlist Functionality
  function initWishlist() {
    const wishlistButtons = document.querySelectorAll('[data-lucide="heart"]');
    
    wishlistButtons.forEach(button => {
      button.parentElement.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const icon = this.querySelector('[data-lucide="heart"]');
        const isActive = icon.classList.contains('fill-current');
        
        if (isActive) {
          icon.classList.remove('fill-current');
          showNotification('Eliminado de favoritos');
        } else {
          icon.classList.add('fill-current');
          showNotification('Añadido a favoritos');
        }
      });
    });
  }

  // Product Quick View
  function initProductQuickView() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
      card.addEventListener('click', function(e) {
        // Only trigger if not clicking on wishlist button
        if (e.target.closest('[data-lucide="heart"]')) return;
        
        const productLink = this.querySelector('a[href*="/products/"]');
        if (productLink) {
          window.location.href = productLink.href;
        }
      });
    });
  }

  // Scroll Animations
  function initScrollAnimations() {
    // Smooth scroll to anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });

    // Scroll progress indicator (optional)
    createScrollIndicator();
  }

  // Scroll Progress Indicator
  function createScrollIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'fixed top-0 left-0 h-1 bg-white z-50 transition-all';
    indicator.style.width = '0%';
    document.body.appendChild(indicator);

    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      indicator.style.width = scrolled + '%';
    });
  }

  // Notification System
  function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    gsap.fromTo(notification,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3 }
    );

    setTimeout(() => {
      gsap.to(notification, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        onComplete: () => notification.remove()
      });
    }, duration);
  }

  // Expose functions globally for Shopify events
  window.themeUtils = {
    showNotification,
    updateCartCount: function(count) {
      document.dispatchEvent(new CustomEvent('cart:updated', {
        detail: { item_count: count }
      }));
    }
  };

  // Performance optimization - Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Resize handler with debounce
  window.addEventListener('resize', debounce(function() {
    // Handle responsive adjustments
    document.body.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  }, 250));

  // Initialize viewport height variable
  document.body.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);

})();
