document.addEventListener('DOMContentLoaded', () => {
  // Game state
  const state = {
    currentPage: 'home',
    language: 'english',
    currentSlide: 0,
    cart: [],
    user: null,
    categories: [
      { id: 'fruits', name: 'Fruits', nameSwahili: 'Matunda', emoji: '🍎' },
      { id: 'vegetables', name: 'Vegetables', nameSwahili: 'Mboga', emoji: '🥬' },
      { id: 'dairy', name: 'Dairy', nameSwahili: 'Maziwa', emoji: '🥛' },
      { id: 'eggs', name: 'Eggs', nameSwahili: 'Mayai', emoji: '🥚' },
      { id: 'herbs', name: 'Herbs', nameSwahili: 'Viungo', emoji: '🌿' }
    ],
    products: [
      // Just keeping a few sample products for brevity
      {
        id: 'apple-red',
        name: 'Red Apple',
        nameSwahili: 'Tufaa Jekundu',
        category: 'fruits',
        price: 25,
        unit: 'per piece',
        unitSwahili: 'kwa kipande',
        description: 'Fresh and juicy red apples from the highlands of Kenya.',
        descriptionSwahili: 'Matufaa mekundu safi na matamu kutoka milimani Kenya.',
        images: ['🍎'],
        inStock: true,
        isFeatured: true,
        farm: 'Njoro Highlands Farm',
        farmLocation: 'Nakuru County'
      },
      {
        id: 'banana',
        name: 'Banana',
        nameSwahili: 'Ndizi',
        category: 'fruits',
        price: 15,
        unit: 'per piece',
        unitSwahili: 'kwa kipande',
        description: 'Sweet and ripe bananas, perfect for eating or cooking.',
        descriptionSwahili: 'Ndizi tamu na mbivu, nzuri kwa kula au kupika.',
        images: ['🍌'],
        inStock: true,
        isFeatured: true,
        farm: 'Kisii Farms',
        farmLocation: 'Kisii County'
      },
      {
        id: 'milk',
        name: 'Fresh Milk',
        nameSwahili: 'Maziwa Mafresh',
        category: 'dairy',
        price: 65,
        unit: 'per liter',
        unitSwahili: 'kwa lita',
        description: 'Farm-fresh cow milk, pasteurized and ready to drink.',
        descriptionSwahili: 'Maziwa ya ng\'ombe mafresh, yaliyochemshwa na tayari kunywa.',
        images: ['🥛'],
        inStock: true,
        isFeatured: true,
        farm: 'Kinangop Dairy Cooperative',
        farmLocation: 'Nyandarua County'
      }
    ],
    deliveryZones: [
      {
        id: 'nairobi-cbd',
        name: 'Nairobi CBD',
        fee: 150,
        estimatedTime: '30-45 minutes'
      },
      {
        id: 'nakuru',
        name: 'Nakuru',
        fee: 400,
        estimatedTime: 'Same day delivery'
      }
    ]
  };

  // DOM Elements
  const mainContent = document.getElementById('main-content');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('overlay');
  const langToggle = document.getElementById('lang-toggle');

  // Load user and cart from localStorage
  const loadUserData = () => {
    const savedCart = localStorage.getItem('freshgrocer-cart');
    if (savedCart) {
      state.cart = JSON.parse(savedCart);
      updateCartCount();
    }

    const savedUser = localStorage.getItem('freshgrocer-user');
    if (savedUser) {
      state.user = JSON.parse(savedUser);
      updateAuthButtons();
    }
  };

  // Save cart to localStorage
  const saveCart = () => {
    localStorage.setItem('freshgrocer-cart', JSON.stringify(state.cart));
    updateCartCount();
  };

  // UI Updates
  const updateCartCount = () => {
    const count = state.cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
    document.querySelectorAll('.mobile-cart-count').forEach(el => el.textContent = count);
  };

  const updateAuthButtons = () => {
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const mobileAuthLinks = document.querySelector('.auth-links');
    const userMenuMobile = document.querySelector('.user-menu-mobile');
    
    if (state.user) {
      if (authButtons) authButtons.classList.add('hidden');
      if (userMenu) {
        userMenu.classList.remove('hidden');
        userMenu.querySelector('.user-name').textContent = state.user.name;
      }
      
      if (mobileAuthLinks) mobileAuthLinks.classList.add('hidden');
      if (userMenuMobile) {
        userMenuMobile.classList.remove('hidden');
        userMenuMobile.querySelector('.user-name-mobile').textContent = state.user.name;
      }
    } else {
      if (authButtons) authButtons.classList.remove('hidden');
      if (userMenu) userMenu.classList.add('hidden');
      
      if (mobileAuthLinks) mobileAuthLinks.classList.remove('hidden');
      if (userMenuMobile) userMenuMobile.classList.add('hidden');
    }
  };

  // Helpers
  const formatPrice = (price) => `KES ${price}`;
  const translate = (english, swahili) => state.language === 'english' ? english : swahili;

  // Page Navigation
  const navigateTo = (page, productId = null) => {
    state.currentPage = page;
    const url = new URL(window.location.href);
    url.hash = page + (productId ? `/${productId}` : '');
    window.history.pushState({}, '', url);
    renderPage();
    window.scrollTo(0, 0);
    closeMobileMenu();
  };

  // Render current page
  const renderPage = () => {
    const templates = {
      home: 'home-template',
      shop: 'shop-template',
      product: 'product-detail-template',
      cart: 'cart-template',
      checkout: 'checkout-template',
      login: 'login-template',
      signup: 'signup-template',
      about: 'about-template',
      contact: 'contact-template'
    };

    const template = document.getElementById(templates[state.currentPage] || 'not-found-template');
    if (template) {
      mainContent.innerHTML = '';
      const clone = document.importNode(template.content, true);
      mainContent.appendChild(clone);
      initPageHandlers();
    }
  };

  // Initialize page-specific handlers
  const initPageHandlers = () => {
    const pageHandlers = {
      home: () => {
        initHomeSlider();
        renderCategories();
        renderFeaturedProducts();
        renderTestimonials();
      },
      shop: () => {
        renderProductFilters();
        renderShopProducts();
        initShopEvents();
      },
      product: renderProductDetail,
      cart: () => {
        renderCartItems();
        initCartEvents();
      },
      checkout: () => {
        renderCheckoutItems();
        initCheckoutEvents();
      },
      login: initLoginForm,
      signup: initSignupForm
    };

    if (pageHandlers[state.currentPage]) {
      pageHandlers[state.currentPage]();
    }
    
    updateLanguage();
  };

  // Update language across the site
  const updateLanguage = () => {
    // This would update text content based on language selection
  };

  // Home page functions
  const initHomeSlider = () => {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    
    const showSlide = (index) => {
      slides.forEach(slide => slide.classList.remove('active'));
      slides[index].classList.add('active');
      state.currentSlide = index;
    };
    
    showSlide(0);
    
    setInterval(() => {
      const nextSlide = (state.currentSlide + 1) % slides.length;
      showSlide(nextSlide);
    }, 5000);
    
    document.querySelector('.prev-slide')?.addEventListener('click', () => {
      const prevSlide = (state.currentSlide - 1 + slides.length) % slides.length;
      showSlide(prevSlide);
    });
    
    document.querySelector('.next-slide')?.addEventListener('click', () => {
      const nextSlide = (state.currentSlide + 1) % slides.length;
      showSlide(nextSlide);
    });
  };

  const renderCategories = () => {
    const categoriesGrid = document.getElementById('categories-grid');
    if (!categoriesGrid) return;
    
    categoriesGrid.innerHTML = '';
    
    state.categories.forEach(category => {
      const card = document.createElement('a');
      card.href = '#';
      card.className = 'category-card';
      card.dataset.category = category.id;
      
      card.innerHTML = `
        <div class="category-image">
          <div class="category-emoji">${category.emoji}</div>
        </div>
        <div class="category-name">${translate(category.name, category.nameSwahili)}</div>
      `;
      
      card.addEventListener('click', e => {
        e.preventDefault();
        navigateTo('shop');
      });
      
      categoriesGrid.appendChild(card);
    });
  };

  const renderFeaturedProducts = () => {
    const grid = document.getElementById('featured-products-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    state.products.filter(p => p.isFeatured).forEach(product => {
      const card = createProductCard(product);
      grid.appendChild(card);
    });
  };

  const renderTestimonials = () => {
    // Simplified - would render testimonials in a real implementation
  };

  // Product display functions
  const createProductCard = (product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
      <div class="product-image">
        ${product.isFeatured ? `<div class="product-badge">${translate('Featured', 'Inasifiwa')}</div>` : ''}
        <a href="#" data-product="${product.id}" class="product-link">
          <div style="font-size: 4rem;">${product.images[0]}</div>
        </a>
      </div>
      <div class="product-info">
        <h3 class="product-name">
          <a href="#" data-product="${product.id}" class="product-link">
            ${translate(product.name, product.nameSwahili)}
          </a>
        </h3>
        <div class="product-meta">
          <div class="product-price">${formatPrice(product.price)}</div>
          <div class="product-unit">${translate(product.unit, product.unitSwahili)}</div>
        </div>
        <div class="product-farm">
          ${translate('From:', 'Kutoka:')} ${product.farm}
        </div>
        ${product.inStock ? 
          `<button class="add-to-cart-btn" data-product="${product.id}">
            ${translate('Add to Cart', 'Ongeza kwenye Kikapu')}
          </button>` : 
          `<button class="product-out-of-stock" disabled>
            ${translate('Out of Stock', 'Haipatikani')}
          </button>`
        }
      </div>
    `;
    
    // Add event listeners
    card.querySelectorAll('.product-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo('product', link.dataset.product);
      });
    });
    
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        addToCart(product.id, 1);
        showToast('success', `${translate('Added to cart', 'Imeongezwa kwenye kikapu')}: ${translate(product.name, product.nameSwahili)}`);
      });
    }
    
    return card;
  };

  // Shop page functions
  const renderProductFilters = () => {
    // Would implement filter rendering in a real app
  };

  const renderShopProducts = () => {
    const productsGrid = document.getElementById('shop-products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    state.products.forEach(product => {
      const productCard = createProductCard(product);
      productsGrid.appendChild(productCard);
    });
  };

  const initShopEvents = () => {
    // Would initialize shop filter events in a real app
  };

  // Product detail page
  const renderProductDetail = () => {
    const productDetail = document.getElementById('product-detail');
    if (!productDetail) return;
    
    const productId = window.location.hash.split('/')[1];
    const product = state.products.find(p => p.id === productId);
    
    if (!product) {
      navigateTo('not-found');
      return;
    }
    
    productDetail.innerHTML = `
      <div class="product-gallery">
        <div class="product-main-image">
          <div style="font-size: 8rem;">${product.images[0]}</div>
        </div>
      </div>
      <div class="product-detail-info">
        <h1>${translate(product.name, product.nameSwahili)}</h1>
        <div class="product-detail-meta">
          <div class="product-farm">
            ${translate('Farm Source:', 'Shamba:')} ${product.farm}, ${product.farmLocation}
          </div>
        </div>
        <div class="product-detail-price">${formatPrice(product.price)} <span class="text-sm text-gray-500">${translate(product.unit, product.unitSwahili)}</span></div>
        <div class="product-description">
          ${translate(product.description, product.descriptionSwahili)}
        </div>
        
        ${product.inStock ? `
        <div class="product-detail-actions">
          <div class="product-quantity">
            <label for="product-quantity">${translate('Quantity:', 'Idadi:')}</label>
            <div class="quantity-control">
              <button type="button" class="quantity-btn quantity-decrease">-</button>
              <input type="number" id="product-quantity" class="quantity-input" value="1" min="1">
              <button type="button" class="quantity-btn quantity-increase">+</button>
            </div>
          </div>
          <div class="product-detail-buttons">
            <button class="add-to-cart-detail-btn" data-product="${product.id}">
              ${translate('Add to Cart', 'Ongeza kwenye Kikapu')}
            </button>
          </div>
        </div>` : `
        <div class="product-detail-actions">
          <button class="product-out-of-stock" disabled>
            ${translate('Out of Stock', 'Haipatikani')}
          </button>
        </div>`}
      </div>
    `;
    
    initProductDetailEvents(product);
  };

  const initProductDetailEvents = (product) => {
    const quantityInput = document.getElementById('product-quantity');
    const decreaseBtn = document.querySelector('.quantity-decrease');
    const increaseBtn = document.querySelector('.quantity-increase');
    const addToCartBtn = document.querySelector('.add-to-cart-detail-btn');
    
    if (decreaseBtn && quantityInput) {
      decreaseBtn.addEventListener('click', () => {
        const current = parseInt(quantityInput.value);
        if (current > 1) quantityInput.value = current - 1;
      });
    }
    
    if (increaseBtn && quantityInput) {
      increaseBtn.addEventListener('click', () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
      });
    }
    
    if (addToCartBtn && quantityInput) {
      addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        addToCart(product.id, quantity);
        showToast('success', `${translate('Added to cart', 'Imeongezwa kwenye kikapu')}: ${quantity} x ${translate(product.name, product.nameSwahili)}`);
      });
    }
  };

  // Cart functions
  const addToCart = (productId, quantity) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    
    const existing = state.cart.find(item => item.id === productId);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        nameSwahili: product.nameSwahili,
        price: product.price,
        image: product.images[0],
        quantity
      });
    }
    
    saveCart();
  };

  const renderCartItems = () => {
    const cartItems = document.getElementById('cart-items');
    const cartContent = document.getElementById('cart-content');
    const emptyCart = document.getElementById('empty-cart');
    
    if (!cartItems || !cartContent || !emptyCart) return;
    
    if (state.cart.length === 0) {
      cartContent.classList.add('hidden');
      emptyCart.classList.remove('hidden');
      return;
    }
    
    cartContent.classList.remove('hidden');
    emptyCart.classList.add('hidden');
    cartItems.innerHTML = '';
    
    let subtotal = 0;
    
    state.cart.forEach(item => {
      subtotal += item.price * item.quantity;
      
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      
      cartItem.innerHTML = `
        <div class="cart-item-image">
          <div style="font-size: 3rem;">${item.image}</div>
        </div>
        <div class="cart-item-details">
          <h3 class="cart-item-name">${translate(item.name, item.nameSwahili)}</h3>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-actions">
            <div class="quantity-control">
              <button type="button" class="quantity-btn quantity-decrease" data-product="${item.id}">-</button>
              <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-product="${item.id}">
              <button type="button" class="quantity-btn quantity-increase" data-product="${item.id}">+</button>
            </div>
            <button class="remove-btn" data-product="${item.id}">
              ${translate('Remove', 'Ondoa')}
            </button>
          </div>
        </div>
      `;
      
      cartItems.appendChild(cartItem);
    });
    
    // Set cart totals
    const subtotalEl = document.getElementById('cart-subtotal');
    const deliveryEl = document.getElementById('cart-delivery');
    const totalEl = document.getElementById('cart-total');
    
    const deliveryFee = 200; // Default delivery fee
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (deliveryEl) deliveryEl.textContent = formatPrice(deliveryFee);
    if (totalEl) totalEl.textContent = formatPrice(subtotal + deliveryFee);
  };

  const initCartEvents = () => {
    // Quantity decrease
    document.querySelectorAll('.quantity-decrease').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.product;
        const item = state.cart.find(item => item.id === productId);
        
        if (item && item.quantity > 1) {
          item.quantity--;
          saveCart();
          renderCartItems();
        }
      });
    });
    
    // Quantity increase
    document.querySelectorAll('.quantity-increase').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.product;
        const item = state.cart.find(item => item.id === productId);
        
        if (item) {
          item.quantity++;
          saveCart();
          renderCartItems();
        }
      });
    });
    
    // Remove item
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.dataset.product;
        state.cart = state.cart.filter(item => item.id !== productId);
        saveCart();
        renderCartItems();
      });
    });
    
    // Proceed to checkout
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (state.user) {
          navigateTo('checkout');
        } else {
          showToast('warning', translate('Please sign in to checkout', 'Tafadhali ingia ili uweze kuendelea kulipia'));
          navigateTo('login');
        }
      });
    }
  };

  // Checkout page functions
  const renderCheckoutItems = () => {
    // Would render checkout items in a real app
  };

  const initCheckoutEvents = () => {
    const checkoutForm = document.getElementById('checkout-form');
    
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', e => {
        e.preventDefault();
        
        setTimeout(() => {
          state.cart = [];
          saveCart();
          showToast('success', translate('Order placed successfully!', 'Agizo limepokelewa kikamilifu!'));
          navigateTo('home');
        }, 1500);
      });
    }
  };

  // Authentication functions
  const initLoginForm = () => {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Simulate login
        setTimeout(() => {
          const users = JSON.parse(localStorage.getItem('freshgrocer-users') || '[]');
          const user = users.find(u => u.email === email && u.password === password);
          
          if (user) {
            const { password: _, ...userDetails } = user;
            state.user = userDetails;
            localStorage.setItem('freshgrocer-user', JSON.stringify(state.user));
            updateAuthButtons();
            showToast('success', `${translate('Welcome back', 'Karibu tena')}, ${user.name}!`);
            navigateTo(state.cart.length > 0 ? 'checkout' : 'home');
          } else {
            document.getElementById('login-error').style.display = 'block';
            document.getElementById('login-error').textContent = translate('Invalid email or password', 'Barua pepe au nenosiri si sahihi');
          }
        }, 500);
      });
    }
  };

  const initSignupForm = () => {
    const signupForm = document.getElementById('signup-form');
    
    if (signupForm) {
      signupForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const phone = document.getElementById('signup-phone').value;
        const password = document.getElementById('signup-password').value;
        
        // Create new user
        const newUser = {
          id: `user_${Date.now()}`,
          name,
          email,
          phone,
          password
        };
        
        // Add to "database"
        const users = JSON.parse(localStorage.getItem('freshgrocer-users') || '[]');
        users.push(newUser);
        localStorage.setItem('freshgrocer-users', JSON.stringify(users));
        
        // Log in the user
        const { password: _, ...userDetails } = newUser;
        state.user = userDetails;
        localStorage.setItem('freshgrocer-user', JSON.stringify(state.user));
        
        updateAuthButtons();
        showToast('success', `${translate('Welcome', 'Karibu')}, ${name}!`);
        navigateTo(state.cart.length > 0 ? 'checkout' : 'home');
      });
    }
  };

  // UI helper functions
  const showToast = (type, message) => {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-title">${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'} ${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto dismiss
    const dismissTimeout = setTimeout(() => {
      dismissToast(toast);
    }, 5000);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(dismissTimeout);
      dismissToast(toast);
    });
  };

  const dismissToast = (toast) => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  };

  // Mobile menu functions
  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    overlay.classList.add('hidden');
  }

  // Navigation event listeners
  document.addEventListener('click', e => {
    // Page navigation links
    if (e.target.matches('[data-page]') || e.target.closest('[data-page]')) {
      e.preventDefault();
      const target = e.target.matches('[data-page]') ? e.target : e.target.closest('[data-page]');
      navigateTo(target.dataset.page);
    }
    
    // Product links
    if (e.target.matches('[data-product]') || e.target.closest('[data-product]')) {
      e.preventDefault();
      const target = e.target.matches('[data-product]') ? e.target : e.target.closest('[data-product]');
      navigateTo('product', target.dataset.product);
    }
  });

  // Initialize mobile menu
  document.querySelector('.mobile-menu-btn')?.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    overlay.classList.remove('hidden');
  });

  document.getElementById('close-mobile-menu')?.addEventListener('click', closeMobileMenu);

  // Language toggle
  if (langToggle) {
    langToggle.addEventListener('change', () => {
      state.language = langToggle.checked ? 'swahili' : 'english';
      updateLanguage();
    });
  }

  // Initialize the app
  loadUserData();
  renderPage();
});
