/* ==========================================================================
   catalogo.js - Logica del catalogo de productos
   ========================================================================== */

(function () {
    'use strict';

    /* ========================
       Variables / Selectores
       ======================== */
    const API_BASE = 'https://fakestoreapi.com';
    const PRODUCTS_PER_PAGE = 8;

    const dom = {
        searchInput: document.getElementById('searchInput'),
        categoriesContainer: document.getElementById('categoriesContainer'),
        productsGrid: document.getElementById('productsGrid'),
        productsState: document.getElementById('productsState'),
        productsStateText: document.getElementById('productsStateText'),
        catalogCount: document.getElementById('catalogCount'),
        sortSelect: document.getElementById('sortSelect'),
        pagination: document.getElementById('catalogPagination'),
        prevPageBtn: document.getElementById('prevPageBtn'),
        nextPageBtn: document.getElementById('nextPageBtn'),
        paginationInfo: document.getElementById('paginationInfo'),
        cartBtn: document.getElementById('cartBtn'),
        cartBadge: document.getElementById('cartBadge'),
        cartSidebar: document.getElementById('cartSidebar'),
        cartOverlay: document.getElementById('cartOverlay'),
        cartCloseBtn: document.getElementById('cartCloseBtn'),
        cartItems: document.getElementById('cartItems'),
        cartEmpty: document.getElementById('cartEmpty'),
        cartFooter: document.getElementById('cartFooter'),
        cartTotalPrice: document.getElementById('cartTotalPrice'),
        cartClearBtn: document.getElementById('cartClearBtn'),
        cartCheckoutBtn: document.getElementById('cartCheckoutBtn'),
        productModal: document.getElementById('productModal'),
        modalImage: document.getElementById('modalImage'),
        modalTitle: document.getElementById('productModalTitle'),
        modalPrice: document.getElementById('modalPrice'),
        modalDescription: document.getElementById('modalDescription'),
        modalName: document.getElementById('modalName'),
        modalAddCart: document.getElementById('modalAddCart'),
        year: document.getElementById('year'),
    };

    /* ========================
       Estado de la aplicacion
       ======================== */
    let allProducts = [];
    let categories = [];
    let filteredProducts = [];
    let currentPage = 1;
    let activeCategory = 'all';
    let currentProduct = null;
    let cart = JSON.parse(localStorage.getItem('lawc_cart')) || [];

    let bootstrapModal = null;

    /* ========================
       Inicializacion
       ======================== */
    document.addEventListener('DOMContentLoaded', function () {
        dom.year.textContent = new Date().getFullYear();

        bootstrapModal = new bootstrap.Modal(dom.productModal);

        initEventListeners();
        loadCategories();
        loadProducts();
    });

    /* ========================
       Event Listeners
       ======================== */
    function initEventListeners() {
        dom.searchInput.addEventListener('input', handleSearch);
        dom.sortSelect.addEventListener('change', handleSort);
        dom.prevPageBtn.addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
            }
        });
        dom.nextPageBtn.addEventListener('click', function () {
            var totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts();
            }
        });

        dom.cartBtn.addEventListener('click', openCart);
        dom.cartCloseBtn.addEventListener('click', closeCart);
        dom.cartOverlay.addEventListener('click', closeCart);
        dom.cartClearBtn.addEventListener('click', clearCart);
        dom.cartCheckoutBtn.addEventListener('click', checkoutCart);

        dom.modalAddCart.addEventListener('click', function () {
            if (currentProduct) {
                addToCart(currentProduct);
                bootstrapModal.hide();
            }
        });

        dom.productModal.addEventListener('hidden.bs.modal', function () {
            currentProduct = null;
        });
    }

    /* ========================
       Categorias
       ======================== */
    function loadCategories() {
        fetch(API_BASE + '/products/categories')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                categories = data;
                renderCategories();
            })
            .catch(function () {
                categories = [];
            });
    }

    function renderCategories() {
        var html = '<button class="category-btn active" data-category="all">Todas</button>';

        var categoryLabels = {
            electronics: 'Electronica',
            jewelery: 'Joyeria',
            "men's clothing": 'Ropa Hombre',
            "women's clothing": 'Ropa Mujer',
        };

        categories.forEach(function (cat) {
            var label = categoryLabels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
            html += '<button class="category-btn" data-category="' + cat + '">' + label + '</button>';
        });

        dom.categoriesContainer.innerHTML = html;

        var btns = dom.categoriesContainer.querySelectorAll('.category-btn');
        btns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                btns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                activeCategory = btn.dataset.category;
                currentPage = 1;
                applyFilters();
            });
        });
    }

    /* ========================
       Productos
       ======================== */
    function loadProducts() {
        showState('Cargando productos...', 'fa-spinner fa-spin-pulse');

        fetch(API_BASE + '/products')
            .then(function (res) { return res.json(); })
            .then(function (data) {
                allProducts = data;
                filteredProducts = allProducts.slice();
                hideState();
                renderProducts();
            })
            .catch(function () {
                showState('Error al cargar los productos.', 'fa-triangle-exclamation');
            });
    }

    /* ========================
       Filtros y busqueda
       ======================== */
    function handleSearch() {
        currentPage = 1;
        applyFilters();
    }

    function handleSort() {
        currentPage = 1;
        applyFilters();
    }

    function applyFilters() {
        var query = dom.searchInput.value.toLowerCase().trim();
        var sortValue = dom.sortSelect.value;

        filteredProducts = allProducts.filter(function (p) {
            var matchesCategory = activeCategory === 'all' || p.category === activeCategory;
            var matchesSearch = !query || p.title.toLowerCase().indexOf(query) !== -1;
            return matchesCategory && matchesSearch;
        });

        if (sortValue === 'price-asc') {
            filteredProducts.sort(function (a, b) { return a.price - b.price; });
        } else if (sortValue === 'price-desc') {
            filteredProducts.sort(function (a, b) { return b.price - a.price; });
        } else if (sortValue === 'name-asc') {
            filteredProducts.sort(function (a, b) { return a.title.localeCompare(b.title); });
        } else if (sortValue === 'name-desc') {
            filteredProducts.sort(function (a, b) { return b.title.localeCompare(a.title); });
        }

        renderProducts();
    }

    /* ========================
       Renderizado de productos
       ======================== */
    function renderProducts() {
        dom.productsGrid.innerHTML = '';

        if (filteredProducts.length === 0) {
            showState('No se encontraron productos.', 'fa-box-open');
            dom.pagination.hidden = true;
            dom.catalogCount.textContent = '';
            return;
        }

        hideState();

        var totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
        if (currentPage > totalPages) currentPage = totalPages;

        var start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        var end = start + PRODUCTS_PER_PAGE;
        var pageProducts = filteredProducts.slice(start, end);

        dom.catalogCount.textContent = filteredProducts.length + ' producto(s) encontrado(s)';

        pageProducts.forEach(function (product) {
            dom.productsGrid.appendChild(createProductCard(product));
        });

        renderPagination(totalPages);
    }

    function createProductCard(product) {
        var card = document.createElement('article');
        card.className = 'product-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', 'Ver detalle de ' + product.title);

        var rateStars = '';
        if (product.rating && product.rating.rate) {
            var fullStars = Math.floor(product.rating.rate);
            var halfStar = product.rating.rate % 1 >= 0.5 ? 1 : 0;
            rateStars = '<span class="product-rate">';
            for (var i = 0; i < fullStars; i++) rateStars += '<i class="fa-solid fa-star"></i> ';
            if (halfStar) rateStars += '<i class="fa-solid fa-star-half-stroke"></i> ';
            rateStars += '<small>(' + product.rating.count + ')</small></span>';
        }

        card.innerHTML =
            '<div class="product-card-img-wrapper">' +
                '<img src="' + product.image + '" alt="' + escapeHtml(product.title) + '" class="product-card-img" loading="lazy">' +
            '</div>' +
            '<div class="product-card-body">' +
                '<h3 class="product-card-title">' + escapeHtml(product.title) + '</h3>' +
                '<div class="product-card-footer">' +
                    '<span class="product-price">$' + product.price.toFixed(2) + '</span>' +
                    rateStars +
                '</div>' +
            '</div>';

        card.addEventListener('click', function () {
            openProductModal(product);
        });

        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openProductModal(product);
            }
        });

        return card;
    }

    /* ========================
       Paginacion
       ======================== */
    function renderPagination(totalPages) {
        if (totalPages <= 1) {
            dom.pagination.hidden = true;
            return;
        }

        dom.pagination.hidden = false;
        dom.paginationInfo.textContent = 'Pagina ' + currentPage + ' de ' + totalPages;
        dom.prevPageBtn.disabled = currentPage <= 1;
        dom.nextPageBtn.disabled = currentPage >= totalPages;
    }

    /* ========================
       Modal de producto
       ======================== */
    function openProductModal(product) {
        currentProduct = product;

        dom.modalImage.src = product.image;
        dom.modalImage.alt = product.title;
        dom.modalTitle.textContent = product.title;
        dom.modalPrice.textContent = '$' + product.price.toFixed(2);
        dom.modalDescription.textContent = product.description;
        dom.modalName.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);

        bootstrapModal.show();
    }

    /* ========================
       Carrito de compras
       ======================== */
    function addToCart(product) {
        var existing = cart.find(function (item) { return item.id === product.id; });

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1,
            });
        }

        saveCart();
        renderCart();
        Swal.fire({
            icon: 'success',
            title: 'Agregado al carrito',
            text: product.title,
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
        });
    }

    function renderCart() {
        dom.cartItems.innerHTML = '';

        var totalUnits = 0;
        cart.forEach(function (item) {
            totalUnits += item.quantity;
        });

        if (cart.length === 0) {
            dom.cartEmpty.hidden = false;
            dom.cartFooter.hidden = true;
            dom.cartBadge.hidden = true;
            return;
        }

        dom.cartEmpty.hidden = true;
        dom.cartFooter.hidden = false;
        dom.cartBadge.hidden = false;
        dom.cartBadge.textContent = totalUnits;

        var totalPrice = 0;

        cart.forEach(function (item) {
            var lineTotal = item.price * item.quantity;
            totalPrice += lineTotal;

            var el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML =
                '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" class="cart-item-img">' +
                '<div class="cart-item-info">' +
                    '<p class="cart-item-title">' + escapeHtml(item.title) + '</p>' +
                    '<div class="quantity-control">' +
                        '<button class="qty-btn qty-minus" aria-label="Restar cantidad" data-id="' + item.id + '"' + (item.quantity <= 1 ? ' disabled' : '') + '>' +
                            '<i class="fa-solid fa-minus"></i>' +
                        '</button>' +
                        '<span class="qty-value">' + item.quantity + '</span>' +
                        '<button class="qty-btn qty-plus" aria-label="Sumar cantidad" data-id="' + item.id + '">' +
                            '<i class="fa-solid fa-plus"></i>' +
                        '</button>' +
                    '</div>' +
                    '<p class="cart-item-price">$' + lineTotal.toFixed(2) + '</p>' +
                '</div>' +
                '<button class="cart-item-remove" aria-label="Eliminar producto" data-id="' + item.id + '">' +
                    '<i class="fa-solid fa-trash-can"></i>' +
                '</button>';

            el.querySelector('.qty-minus').addEventListener('click', function () {
                changeQuantity(item.id, -1);
            });

            el.querySelector('.qty-plus').addEventListener('click', function () {
                changeQuantity(item.id, 1);
            });

            el.querySelector('.cart-item-remove').addEventListener('click', function () {
                removeFromCart(item.id);
            });

            dom.cartItems.appendChild(el);
        });

        dom.cartTotalPrice.textContent = '$' + totalPrice.toFixed(2);
    }

    function changeQuantity(productId, delta) {
        var item = cart.find(function (i) { return i.id === productId; });
        if (!item) return;

        item.quantity += delta;
        if (item.quantity < 1) item.quantity = 1;

        saveCart();
        renderCart();
    }

    function removeFromCart(productId) {
        cart = cart.filter(function (i) { return i.id !== productId; });
        saveCart();
        renderCart();
    }

    function clearCart() {
        if (cart.length === 0) return;

        Swal.fire({
            title: '¿Eliminar todos los productos?',
            text: 'Esta accion no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#636e72',
            confirmButtonText: 'Si, eliminar',
            cancelButtonText: 'Cancelar',
        }).then(function (result) {
            if (result.isConfirmed) {
                cart = [];
                saveCart();
                renderCart();
                closeCart();
                Swal.fire({
                    icon: 'success',
                    title: 'Carrito vaciado',
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        });
    }

    function checkoutCart() {
        if (cart.length === 0) return;

        Swal.fire({
            title: '¿Finalizar compra?',
            text: 'Se procesara tu pedido.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6c5ce7',
            cancelButtonColor: '#636e72',
            confirmButtonText: 'Si, comprar',
            cancelButtonText: 'Cancelar',
        }).then(function (result) {
            if (result.isConfirmed) {
                cart = [];
                saveCart();
                renderCart();
                closeCart();
                Swal.fire({
                    icon: 'success',
                    title: '¡Compra realizada!',
                    text: 'Gracias por tu compra.',
                    timer: 2500,
                    showConfirmButton: false,
                });
            }
        });
    }

    function saveCart() {
        localStorage.setItem('lawc_cart', JSON.stringify(cart));
    }

    /* ========================
       Sidebar del carrito
       ======================== */
    function openCart() {
        renderCart();
        dom.cartSidebar.classList.add('open');
        dom.cartSidebar.setAttribute('aria-hidden', 'false');
        dom.cartOverlay.hidden = false;
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        dom.cartSidebar.classList.remove('open');
        dom.cartSidebar.setAttribute('aria-hidden', 'true');
        dom.cartOverlay.hidden = true;
        document.body.style.overflow = '';
    }

    /* ========================
       Helpers
       ======================== */
    function showState(message, iconClass) {
        dom.productsState.hidden = false;
        dom.productsGrid.hidden = true;
        dom.productsStateText.textContent = message;
        var icon = dom.productsState.querySelector('.state-icon');
        icon.className = 'fa-solid ' + iconClass + ' state-icon';
    }

    function hideState() {
        dom.productsState.hidden = true;
        dom.productsGrid.hidden = false;
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

})();
