/* ==========================================================================
   LAWC Shop - Logica principal de la aplicacion
   Estructura:
   1. Configuracion y variables globales
   2. Internacionalizacion (i18n)
   3. Utilidades
   4. Consumo de API (Fetch)
   5. Render de productos (cards)
   6. Modal de producto
   7. Carrito (localStorage)
   8. Render del carrito (sidebar)
   9. Buscador y categorias
   10. Inicializacion
   ========================================================================== */

/* ============================================================
   1. Configuracion y variables globales
   ============================================================ */
const API_BASE = 'https://web-api-products.runasp.net';
const PRODUCTS_URL = API_BASE + '/api/products';
const CATEGORIES_URL = API_BASE + '/api/categories';

const CART_STORAGE_KEY = 'lawc-cart';
const LANG_STORAGE_KEY = 'lawc-lang';

// Categorias de la API que se ignoran (no tienen nombre real)
const INVALID_CATEGORY_NAMES = ['string'];

// Elementos del DOM
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const elements = {
    productsGrid: $('#productsGrid'),
    productsState: $('#productsState'),
    productsStateText: $('#productsStateText'),
    productsCount: $('#productsCount'),
    categoriesContainer: $('#categoriesContainer'),
    searchInput: $('#searchInput'),
    cartBtn: $('#cartBtn'),
    cartBadge: $('#cartBadge'),
    cartSidebar: $('#cartSidebar'),
    cartOverlay: $('#cartOverlay'),
    cartCloseBtn: $('#cartCloseBtn'),
    cartItems: $('#cartItems'),
    cartEmpty: $('#cartEmpty'),
    cartFooter: $('#cartFooter'),
    cartTotalPrice: $('#cartTotalPrice'),
    cartClearBtn: $('#cartClearBtn'),
    cartCheckoutBtn: $('#cartCheckoutBtn'),
    productModal: $('#productModal'),
    modalImage: $('#modalImage'),
    modalName: $('#modalName'),
    modalPrice: $('#modalPrice'),
    modalDescription: $('#modalDescription'),
    modalAddCart: $('#modalAddCart'),
    year: $('#year'),
    brandLogo: $('#brandLogo'),
};

// Estado global de la app
let allProducts = [];
let allCategories = [];
let currentCategory = 'all';
let currentSearch = '';
let cart = loadCartFromStorage();
let productModal = null;

/* ============================================================
   2. Internacionalizacion (i18n)
   ============================================================ */
const translations = {
    es: {
        brand: 'LAWC Shop',
        searchPlaceholder: 'Buscar productos por nombre...',
        productsTitle: 'Nuestros Productos',
        productsCount: '{count} productos disponibles',
        productsCountAlt: '{count} productos',
        productsLoading: 'Cargando productos...',
        productsError: 'No se pudieron cargar los productos. Intenta nuevamente.',
        productsEmpty: 'No se encontraron productos con esos criterios.',
        viewMore: 'Ver',
        addToCart: 'Agregar al carrito',
        addedToCart: 'Producto agregado',
        addedToCartMsg: '"{title}" se agregó a tu carrito.',
        cartTitle: 'Tu Carrito',
        cartEmpty: 'Tu carrito está vacío.',
        cartTotalDisplay: 'Total: ',
        clearAll: 'Eliminar todos',
        clearAllConfirm: '¿Eliminar todos los productos del carrito?',
        clearAllTitle: 'Carrito vaciado',
        clearAllMsg: 'Se eliminaron todos los productos del carrito.',
        checkout: 'Finalizar compra',
        checkoutConfirm: '¿Confirmar la compra?',
        checkoutTitle: '¡Compra exitosa!',
        checkoutMsg: 'Gracias por tu compra. Tu pedido fue procesado correctamente.',
        close: 'Cerrar',
        all: 'Todas',
        footerText: 'Todos los derechos reservados.',
        rating: 'Puntuación',
        quantity: 'Cantidad',
        remove: 'Eliminar',
    },
    en: {
        brand: 'LAWC Shop',
        searchPlaceholder: 'Search products by name...',
        productsTitle: 'Our Products',
        productsCount: '{count} products available',
        productsCountAlt: '{count} products',
        productsLoading: 'Loading products...',
        productsError: 'Could not load products. Please try again.',
        productsEmpty: 'No products found matching those criteria.',
        viewMore: 'View',
        addToCart: 'Add to cart',
        addedToCart: 'Product added',
        addedToCartMsg: '"{title}" has been added to your cart.',
        cartTitle: 'Your Cart',
        cartEmpty: 'Your cart is empty.',
        cartTotalDisplay: 'Total: ',
        clearAll: 'Remove all',
        clearAllConfirm: 'Remove all products from the cart?',
        clearAllTitle: 'Cart cleared',
        clearAllMsg: 'All products were removed from the cart.',
        checkout: 'Checkout',
        checkoutConfirm: 'Confirm the purchase?',
        checkoutTitle: 'Purchase successful!',
        checkoutMsg: 'Thank you for your purchase. Your order has been processed successfully.',
        close: 'Close',
        all: 'All',
        footerText: 'All rights reserved.',
        rating: 'Rating',
        quantity: 'Quantity',
        remove: 'Remove',
    },
};

let lang = detectLanguage();

// Deteccion de idioma: usa el del navegador o el guardado en localStorage
function detectLanguage() {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'es' || saved === 'en') {
        return saved;
    }
    const browserLang = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
    return browserLang.startsWith('es') ? 'es' : 'en';
}

function t(key) {
    return translations[lang][key] || key;
}

// Aplica los textos i18n a los elementos con atributos data-i18n / data-i18n-placeholder
function applyI18n() {
    $$('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    $$('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', t(key));
    });

    const count = currentSearch || currentCategory !== 'all'
        ? getFilteredProducts().length
        : allProducts.length;
    elements.productsCount.textContent = t('productsCount').replace('{count}', count);
    renderCategories();
}

/* ============================================================
   3. Utilidades
   ============================================================ */
function formatPrice(value) {
    return '$' + Number(value).toFixed(2);
}

function categoryName(id) {
    const cat = allCategories.find((c) => c.id === id);
    return cat ? cat.name : '';
}

// Los titulos vienen en la API con caracteres mal codificados (mojibake)
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/�/g, 'í')
        .replace(/�/g, 'ó')
        .replace(/�/g, 'é')
        .replace(/�/g, 'á')
        .replace(/�/g, 'ñ');
}

/* ============================================================
   4. Consumo de API (Fetch)
   ============================================================ */
async function fetchProducts() {
    const res = await fetch(PRODUCTS_URL);
    if (!res.ok) throw new Error('Error al obtener productos');
    const data = await res.json();
    return data.map((p) => ({
        id: p.id,
        title: cleanText(p.title),
        description: cleanText(p.description),
        image: p.image,
        price: p.price,
        rate: p.rate,
        categoryId: p.categoryId,
    }));
}

async function fetchCategories() {
    const res = await fetch(CATEGORIES_URL);
    if (!res.ok) throw new Error('Error al obtener categorias');
    const data = await res.json();
    // Filtra ids y categorias invalidas (por ejemplo "string")
    return data.filter((c) => c.name && !INVALID_CATEGORY_NAMES.includes(c.name.toLowerCase()));
}

async function loadData() {
    setProductsState(true, t('productsLoading'));
    try {
        const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);
        allProducts = products;
        allCategories = categories;
        renderCategories();
        renderProducts();
        applyI18n();
    } catch (error) {
        console.error(error);
        setProductsState(true, t('productsError'));
        Swal.fire({
            icon: 'error',
            title: t('productsError'),
            text: error.message,
            confirmButtonColor: '#6c5ce7',
        });
    }
}

/* ============================================================
   5. Render de productos (cards)
   ============================================================ */
function getFilteredProducts() {
    let filtered = allProducts;

    if (currentCategory !== 'all') {
        filtered = filtered.filter((p) => p.categoryId === currentCategory);
    }

    if (currentSearch) {
        const searchTerm = currentSearch.toLowerCase();
        filtered = filtered.filter((p) => p.title.toLowerCase().includes(searchTerm));
    }

    return filtered;
}

function createRatingStars(rate) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rate
            ? '<i class="fa-solid fa-star"></i>'
            : '<i class="fa-regular fa-star"></i>';
    }
    return stars;
}

function renderProducts() {
    const filtered = getFilteredProducts();

    if (filtered.length === 0) {
        elements.productsGrid.innerHTML = '';
        setProductsState(true, currentSearch || currentCategory !== 'all' ? t('productsEmpty') : t('productsError'));
    } else {
        setProductsState(false);
        elements.productsGrid.innerHTML = filtered.map((product) => `
            <article class="card product-card" data-id="${product.id}">
                <div class="product-card-img-wrapper">
                    <img src="${product.image}" alt="${product.title}" class="product-card-img" loading="lazy">
                </div>
                <div class="product-card-body">
                    <h3 class="product-card-title" title="${product.title}">${product.title}</h3>
                    <div class="product-rate" title="${t('rating')}: ${product.rate}">
                        ${createRatingStars(product.rate)}
                    </div>
                    <div class="product-card-footer">
                        <span class="product-price">${formatPrice(product.price)}</span>
                        <button type="button" class="btn-view" data-view="${product.id}" aria-label="${t('viewMore')}: ${product.title}">
                            ${t('viewMore')}
                        </button>
                    </div>
                </div>
            </article>
        `).join('');
    }

    elements.productsCount.textContent = t('productsCount').replace('{count}', filtered.length);

    // Eventos de los botones "Ver"
    $$('[data-view]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-view'));
            openProductModal(id);
        });
    });
}

function setProductsState(visible, text) {
    elements.productsState.hidden = !visible;
    elements.productsStateText.textContent = text || '';
    elements.productsGrid.hidden = visible;
}

/* ============================================================
   6. Modal de producto
   ============================================================ */
function findProduct(id) {
    return allProducts.find((p) => p.id === id);
}

function openProductModal(id) {
    const product = findProduct(id);
    if (!product) return;

    const modalTitle = product.title;
    const name = product.title;
    const price = formatPrice(product.price);
    const description = product.description;

    // Textos estaticos: titulo, precio y descripcion vienen de la API directamente
    $('#productModalTitle').textContent = modalTitle;
    elements.modalName.textContent = name;
    elements.modalPrice.textContent = price;
    elements.modalDescription.textContent = description;

    // La imagen usa encoding URI para manejar caracteres especiales en la URL
    let imageSrc = product.image;
    try {
        imageSrc = encodeURI(product.image);
    } catch (e) {
        imageSrc = product.image;
    }
    elements.modalImage.src = imageSrc;
    elements.modalImage.alt = product.title;

    elements.modalAddCart.dataset.productId = id;

    if (!productModal) {
        productModal = new bootstrap.Modal(elements.productModal);
    }
    productModal.show();
}

function closeProductModal() {
    if (productModal) {
        productModal.hide();
    }
}

/* ============================================================
   7. Carrito (localStorage)
   ============================================================ */
function loadCartFromStorage() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveCartToStorage() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function addToCart(productId, quantity = 1) {
    const product = findProduct(productId);
    if (!product) return;

    const existing = cart.find((item) => item.id === productId);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: quantity,
        });
    }

    saveCartToStorage();
    updateCartUI();
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
    renderCart();
}

function changeQuantity(productId, delta) {
    const item = cart.find((i) => i.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    item.quantity = newQuantity;
    saveCartToStorage();
    updateCartUI();
    renderCart();
}

function clearCart() {
    cart = [];
    saveCartToStorage();
    updateCartUI();
    renderCart();
}

// Suma total de unidades (no de productos distintos)
function getTotalUnits() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getTotalPrice() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/* ============================================================
   8. Render del carrito (sidebar)
   ============================================================ */
function renderCart() {
    const totalUnits = getTotalUnits();

    // Badge con cantidad TOTAL de productos
    elements.cartBadge.textContent = totalUnits;
    elements.cartBadge.hidden = totalUnits === 0;

    const isEmpty = cart.length === 0;

    elements.cartEmpty.style.display = isEmpty ? 'flex' : 'none';
    elements.cartItems.style.display = isEmpty ? 'none' : 'flex';
    elements.cartFooter.hidden = isEmpty;

    elements.cartTotalPrice.textContent = formatPrice(getTotalPrice());

    if (isEmpty) {
        elements.cartItems.innerHTML = '';
        return;
    }

    elements.cartItems.innerHTML = cart.map((item) => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.title}" class="cart-item-img">
            <div class="cart-item-info">
                <p class="cart-item-title" title="${item.title}">${item.title}</p>
                <p class="cart-item-price">${formatPrice(item.price)}</p>
            </div>
            <div class="cart-item-line-total">${formatPrice(item.price * item.quantity)}</div>
            <button type="button" class="cart-item-remove" data-remove="${item.id}"
                    aria-label="${t('remove')}: ${item.title}">
                <i class="fa-solid fa-trash-can"></i>
            </button>
            <div class="quantity-control">
                <button type="button" class="qty-btn" data-minus="${item.id}"
                        ${item.quantity <= 1 ? 'disabled' : ''} aria-label="-">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button type="button" class="qty-btn" data-plus="${item.id}" aria-label="+">+</button>
            </div>
        </div>
    `).join('');

    // Eventos de los items
    $$('[data-remove]').forEach((btn) => {
        btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.remove)));
    });
    $$('[data-plus]').forEach((btn) => {
        btn.addEventListener('click', () => changeQuantity(Number(btn.dataset.plus), 1));
    });
    $$('[data-minus]').forEach((btn) => {
        if (!btn.disabled) {
            btn.addEventListener('click', () => changeQuantity(Number(btn.dataset.minus), -1));
        }
    });
}

function updateCartUI() {
    const totalUnits = getTotalUnits();
    elements.cartBadge.textContent = totalUnits;
    elements.cartBadge.hidden = totalUnits === 0;
}

function openCart() {
    renderCart();
    elements.cartSidebar.classList.add('open');
    elements.cartOverlay.hidden = false;
    elements.cartSidebar.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    elements.cartSidebar.classList.remove('open');
    elements.cartOverlay.hidden = true;
    elements.cartSidebar.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/* ============================================================
   9. Buscador y categorias
   ============================================================ */
function renderCategories() {
    const categories = [
        { id: 'all', name: t('all') },
        ...allCategories,
    ];

    elements.categoriesContainer.innerHTML = categories.map((cat) => `
        <button type="button"
                class="category-btn ${currentCategory === cat.id ? 'active' : ''}"
                data-category="${cat.id}">
            ${cat.name}
        </button>
    `).join('');

    $$('[data-category]').forEach((btn) => {
        btn.addEventListener('click', () => {
            currentCategory = Number(btn.dataset.category) || btn.dataset.category;
            renderCategories();
            renderProducts();
            applyI18n();
        });
    });
}

/* ============================================================
   10. Inicializacion
   ============================================================ */
function bindEvents() {
    // Buscador en tiempo real
    elements.searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim();
        renderProducts();
        applyI18n();
    });

    // Abrir / cerrar carrito
    elements.cartBtn.addEventListener('click', openCart);
    elements.cartCloseBtn.addEventListener('click', closeCart);
    elements.cartOverlay.addEventListener('click', closeCart);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
        }
    });

    // Agregar al carrito desde el modal
    elements.modalAddCart.addEventListener('click', () => {
        const id = Number(elements.modalAddCart.dataset.productId);
        if (!id) return;

        const product = findProduct(id);
        addToCart(id);
        closeProductModal();

        Swal.fire({
            icon: 'success',
            title: t('addedToCart'),
            text: t('addedToCartMsg').replace('{title}', product ? product.title : ''),
            confirmButtonColor: '#6c5ce7',
            timer: 1800,
            timerProgressBar: true,
            showConfirmButton: false,
        });
    });

    // Eliminar todos los productos
    elements.cartClearBtn.addEventListener('click', async () => {
        const result = await Swal.fire({
            icon: 'warning',
            title: t('clearAllConfirm'),
            showCancelButton: true,
            confirmButtonText: t('clearAll'),
            cancelButtonText: t('close'),
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#b2bec3',
        });

        if (result.isConfirmed) {
            clearCart();
            Swal.fire({
                icon: 'success',
                title: t('clearAllTitle'),
                text: t('clearAllMsg'),
                confirmButtonColor: '#6c5ce7',
                timer: 1800,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    });

    // Finalizar compra
    elements.cartCheckoutBtn.addEventListener('click', async () => {
        const result = await Swal.fire({
            icon: 'question',
            title: t('checkoutConfirm'),
            showCancelButton: true,
            confirmButtonText: t('checkout'),
            cancelButtonText: t('close'),
            confirmButtonColor: '#6c5ce7',
            cancelButtonColor: '#b2bec3',
        });

        if (result.isConfirmed) {
            clearCart();
            closeCart();
            Swal.fire({
                icon: 'success',
                title: t('checkoutTitle'),
                text: t('checkoutMsg'),
                confirmButtonColor: '#6c5ce7',
            });
        }
    });

    // Año del footer
    elements.year.textContent = new Date().getFullYear();
}

function init() {
    elements.brandLogo.addEventListener('click', (e) => {
        e.preventDefault();
        currentSearch = '';
        currentCategory = 'all';
        elements.searchInput.value = '';
        renderCategories();
        renderProducts();
        applyI18n();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    applyI18n();
    bindEvents();
    updateCartUI();
    loadData();
}

document.addEventListener('DOMContentLoaded', init);
