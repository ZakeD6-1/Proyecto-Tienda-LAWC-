/* ==========================================================================
   FJ Shop - Logica principal del home (index)
   Estructura:
   1. Configuracion y variables globales
   2. Utilidades
   3. Consumo de API (Fetch)
   4. Render del home (destacados y nuevos)
   5. Modal de producto
   6. Carrito (localStorage)
   7. Render del carrito (sidebar)
   8. Inicializacion
   ========================================================================== */

/* ============================================================
   1. Configuracion y variables globales
   ============================================================ */
const API_BASE = 'https://web-api-products.runasp.net';
const PRODUCTS_URL = API_BASE + '/api/products';

const CART_STORAGE_KEY = 'lawc-cart';
const OLD_CART_STORAGE_KEY = 'lawc_cart';
const LANG_STORAGE_KEY = 'lawc-lang';

// Cantidad de productos mostrados en cada seccion del home
const FEATURED_COUNT = 4;
const NEW_COUNT = 4;

// Elementos del DOM
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const elements = {
    featuredGrid: $('#featuredGrid'),
    featuredState: $('#featuredState'),
    featuredStateText: $('#featuredStateText'),
    newGrid: $('#newGrid'),
    newState: $('#newState'),
    newStateText: $('#newStateText'),
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
    langCurrent: $('#langCurrent'),
    langOptions: $$('.lang-option'),
};

// Estado global de la app
let allProducts = [];
let cart = loadCartFromStorage();
let productModal = null;

/* ============================================================
   2. Utilidades
   ============================================================ */
// Nota: la internacionalizacion (traducciones, detectLanguage, applyI18n
// y los botones de idioma) se maneja de forma compartida en JS/i18n.js,
// expuesta globalmente como I18N.

function formatPrice(value) {
    return '$' + Number(value).toFixed(2);
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
   3. Consumo de API (Fetch)
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

async function loadData() {
    setState(elements.featuredState, elements.featuredStateText, I18N.t('productsLoading'));
    setState(elements.newState, elements.newStateText, I18N.t('productsLoading'));
    try {
        allProducts = await fetchProducts();
        renderHome();
        I18N.applyI18n();
    } catch (error) {
        console.error(error);
        setState(elements.featuredState, elements.featuredStateText, I18N.t('productsError'));
        setState(elements.newState, elements.newStateText, I18N.t('productsError'));
        Swal.fire({
            icon: 'error',
            title: I18N.t('productsError'),
            text: error.message,
            confirmButtonColor: '#6c5ce7',
        });
    }
}

/* ============================================================
   4. Render del home (destacados y nuevos)
   ============================================================ */
// Destacados: productos con calificacion perfecta (rate 5)
function getFeaturedProducts() {
    return allProducts
        .filter((p) => p.rate === 5)
        .sort((a, b) => b.id - a.id)
        .slice(0, FEATURED_COUNT);
}

// Nuevos: los de ID mas alto (mas recientes)
function getNewProducts() {
    return allProducts
        .slice()
        .sort((a, b) => b.id - a.id)
        .slice(0, NEW_COUNT);
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

function renderProductCards(products) {
    return products.map((product) => `
        <article class="card product-card" data-id="${product.id}">
            <div class="product-card-img-wrapper">
                <img src="${product.image}" alt="${product.title}" class="product-card-img" loading="lazy">
            </div>
            <div class="product-card-body">
                <h3 class="product-card-title" title="${product.title}">${product.title}</h3>
                <div class="product-rate" title="${I18N.t('rating')}: ${product.rate}">
                    ${createRatingStars(product.rate)}
                </div>
                <div class="product-card-footer">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <button type="button" class="btn-add-to-cart" data-add-cart="${product.id}"
                            aria-label="${I18N.t('addToCart')}: ${product.title}">
                        <i class="fa-solid fa-cart-plus" aria-hidden="true"></i>
                        ${I18N.t('addToCart')}
                    </button>
                </div>
            </div>
        </article>
    `).join('');
}

function renderHome() {
    renderFeatured();
    renderNew();
    bindAddCartButtons();
    I18N.applyI18n();
}

function renderFeatured() {
    const featured = getFeaturedProducts();
    if (featured.length === 0) {
        elements.featuredGrid.innerHTML = '';
        setState(elements.featuredState, elements.featuredStateText, I18N.t('productsEmpty'));
    } else {
        hideState(elements.featuredState);
        elements.featuredGrid.innerHTML = renderProductCards(featured);
    }
}

function renderNew() {
    const newProducts = getNewProducts();
    if (newProducts.length === 0) {
        elements.newGrid.innerHTML = '';
        setState(elements.newState, elements.newStateText, I18N.t('productsEmpty'));
    } else {
        hideState(elements.newState);
        elements.newGrid.innerHTML = renderProductCards(newProducts);
    }
}

// Muestra el estado (carga / vacio / error) de una grilla
function setState(stateEl, textEl, text) {
    stateEl.hidden = false;
    textEl.textContent = text || '';
}

function hideState(stateEl) {
    stateEl.hidden = true;
}

function bindAddCartButtons() {
    $$('[data-add-cart]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = Number(btn.getAttribute('data-add-cart'));
            addToCart(id);
            showAddedToast(findProduct(id));
        });
    });
}

function showAddedToast(product) {
    Swal.fire({
        icon: 'success',
        title: I18N.t('addedToCart'),
        text: product ? product.title : '',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        customClass: { container: 'toast-offset' },
        timerProgressBar: true,
    });
}

/* ============================================================
   5. Modal de producto
   ============================================================ */
function findProduct(id) {
    return allProducts.find((p) => p.id === id);
}

function openProductModal(id) {
    const product = findProduct(id);
    if (!product) return;

    // Titulo del modal
    elements.modalName.textContent = product.title;
    elements.modalPrice.textContent = formatPrice(product.price);
    elements.modalDescription.textContent = product.description;

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
   6. Carrito (localStorage)
   ============================================================ */
function loadCartFromStorage() {
    try {
        let raw = localStorage.getItem(CART_STORAGE_KEY);
        // Migracion: si el carrito viejo (clave lawc_cart) tenia datos,
        // se toma y se guarda bajo la clave unificada lawc-cart.
        if (!raw) {
            const oldCart = localStorage.getItem(OLD_CART_STORAGE_KEY);
            if (oldCart) {
                raw = oldCart;
                localStorage.setItem(CART_STORAGE_KEY, raw);
                localStorage.removeItem(OLD_CART_STORAGE_KEY);
            }
        }
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
   7. Render del carrito (sidebar)
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
                    aria-label="${I18N.t('remove')}: ${item.title}">
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

    $$('[data-minus]').forEach((btn) => {
        btn.addEventListener('click', () => changeQuantity(Number(btn.dataset.minus), -1));
    });

    $$('[data-plus]').forEach((btn) => {
        btn.addEventListener('click', () => changeQuantity(Number(btn.dataset.plus), 1));
    });
}

function updateCartUI() {
    renderCart();
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
   8. Inicializacion
   ============================================================ */
function bindEvents() {
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
            title: I18N.t('addedToCart'),
            text: I18N.t('addedToCartMsg').replace('{title}', product ? product.title : ''),
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
            title: I18N.t('clearAllConfirm'),
            showCancelButton: true,
            confirmButtonText: I18N.t('clearAll'),
            cancelButtonText: I18N.t('close'),
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#b2bec3',
        });

        if (result.isConfirmed) {
            clearCart();
            Swal.fire({
                icon: 'success',
                title: I18N.t('clearAllTitle'),
                text: I18N.t('clearAllMsg'),
                confirmButtonColor: '#6c5ce7',
                timer: 1800,
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    });

    // Finalizar compra: navega a la pagina de checkout (pago)
    elements.cartCheckoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;
        window.location.href = 'checkout.html';
    });

    // Botones de idioma (dropdown)
    elements.langOptions.forEach((btn) => {
        btn.addEventListener('click', () => changeLanguage(btn.dataset.lang));
    });

    // Año del footer
    elements.year.textContent = new Date().getFullYear();
}

// Cambia el idioma y refresca las vistas que dependen de el
function changeLanguage(lang) {
    I18N.setLanguage(lang);
    updateLanguageToggle();
    updateCartUI();
    renderHome();
    I18N.applyI18n();
}

// Marca como activo el idioma actual en el selector
function updateLanguageToggle() {
    const current = I18N.getLang();
    if (elements.langCurrent) {
        elements.langCurrent.textContent = current === 'es' ? 'ES' : 'EN';
    }
}

function init() {
    elements.brandLogo.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    I18N.applyI18n();
    updateLanguageToggle();
    bindEvents();
    updateCartUI();
    loadData();
}

document.addEventListener('DOMContentLoaded', init);
