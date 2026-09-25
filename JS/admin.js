/* ==========================================================================
   admin.js - Panel de administracion de productos (CRUD + localStorage)
   ========================================================================== */

(function () {
    'use strict';

    /* ========================
       Configuracion
       ======================== */
    var ADMIN_USER = 'admin';
    var ADMIN_PASS = 'admin123';
    var PRODUCTS_STORAGE_KEY = 'lawc-admin-products';
    var SESSION_STORAGE_KEY = 'lawc-admin-session';

    /* ========================
       Selectores del DOM
       ======================== */
    var dom = {
        loginSection: document.getElementById('loginSection'),
        adminPanel: document.getElementById('adminPanel'),
        loginForm: document.getElementById('loginForm'),
        loginUser: document.getElementById('loginUser'),
        loginPass: document.getElementById('loginPass'),
        logoutBtn: document.getElementById('logoutBtn'),
        addProductBtn: document.getElementById('addProductBtn'),
        adminTableBody: document.getElementById('adminTableBody'),
        adminEmpty: document.getElementById('adminEmpty'),
        productFormModal: document.getElementById('productFormModal'),
        productForm: document.getElementById('productForm'),
        formProductId: document.getElementById('formProductId'),
        formTitle: document.getElementById('formTitle'),
        formPrice: document.getElementById('formPrice'),
        formCategory: document.getElementById('formCategory'),
        formImage: document.getElementById('formImage'),
        formDescription: document.getElementById('formDescription'),
        formSaveBtn: document.getElementById('formSaveBtn'),
        imagePreviewWrapper: document.getElementById('imagePreviewWrapper'),
        imagePreview: document.getElementById('imagePreview'),
        year: document.getElementById('year'),
        langCurrent: document.getElementById('langCurrent'),
        langOptions: document.querySelectorAll('.lang-option'),
    };

    var bootstrapModal = null;
    var editingId = null;

    /* ========================
       Inicializacion
       ======================== */
    document.addEventListener('DOMContentLoaded', function () {
        dom.year.textContent = new Date().getFullYear();
        bootstrapModal = new bootstrap.Modal(dom.productFormModal);

        updateLangToggle();
        I18N.applyI18n();

        initEventListeners();
        bindLanguageButtons();
        checkSession();
    });

    /* ========================
       Idioma (i18n)
       ======================== */
    function updateLangToggle() {
        var current = I18N.getLang();
        if (dom.langCurrent) dom.langCurrent.textContent = current === 'es' ? 'ES' : 'EN';
    }

    function bindLanguageButtons() {
        dom.langOptions.forEach(function (btn) {
            btn.addEventListener('click', function () { changeLanguage(btn.getAttribute('data-lang')); });
        });
    }

    function changeLanguage(lang) {
        I18N.setLanguage(lang);
        updateLangToggle();
        I18N.applyI18n();
        // La tabla y el estado vacio contienen textos traducidos
        if (!dom.adminPanel.hidden) renderProducts();
    }

    /* ========================
       Event Listeners
       ======================== */
    function initEventListeners() {
        dom.loginForm.addEventListener('submit', handleLogin);
        dom.logoutBtn.addEventListener('click', handleLogout);
        dom.addProductBtn.addEventListener('click', function () {
            openFormModal();
        });
        dom.formSaveBtn.addEventListener('click', handleSaveProduct);
        dom.formImage.addEventListener('input', handleImagePreview);

        dom.productFormModal.addEventListener('hidden.bs.modal', function () {
            resetForm();
        });
    }

    /* ========================
       Autenticacion
       ======================== */
    function handleLogin(e) {
        e.preventDefault();

        var user = dom.loginUser.value.trim();
        var pass = dom.loginPass.value;

        if (user === ADMIN_USER && pass === ADMIN_PASS) {
            localStorage.setItem(SESSION_STORAGE_KEY, 'active');
            showPanel();
            Swal.fire({
                icon: 'success',
                title: I18N.t('adminWelcome'),
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
                customClass: { container: 'toast-offset' },
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: I18N.t('adminInvalidCreds'),
                text: I18N.t('adminTryAgain'),
                confirmButtonColor: '#6c5ce7',
            });
        }
    }

    function handleLogout() {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        showLogin();
    }

    function checkSession() {
        var session = localStorage.getItem(SESSION_STORAGE_KEY);
        if (session === 'active') {
            showPanel();
        } else {
            showLogin();
        }
    }

    function showLogin() {
        dom.loginSection.hidden = false;
        dom.adminPanel.hidden = true;
        dom.logoutBtn.hidden = true;
        dom.loginForm.reset();
    }

    function showPanel() {
        dom.loginSection.hidden = true;
        dom.adminPanel.hidden = false;
        dom.logoutBtn.hidden = false;
        renderProducts();
    }

    /* ========================
       CRUD - Productos
       ======================== */
    function loadProducts() {
        try {
            var raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveProducts(products) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    }

    function renderProducts() {
        var products = loadProducts();
        dom.adminTableBody.innerHTML = '';

        if (products.length === 0) {
            dom.adminEmpty.hidden = false;
            dom.adminTableBody.closest('.admin-table-wrapper').hidden = true;
            return;
        }

        dom.adminEmpty.hidden = true;
        dom.adminTableBody.closest('.admin-table-wrapper').hidden = false;

        products.forEach(function (product) {
            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td class="admin-td-img">' +
                    '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.title) + '" class="admin-product-img">' +
                '</td>' +
                '<td class="admin-td-title">' + escapeHtml(product.title) + '</td>' +
                '<td>' + formatCategory(product.category) + '</td>' +
                '<td class="admin-td-price">$' + Number(product.price).toFixed(2) + '</td>' +
                '<td class="admin-td-actions">' +
                    '<button type="button" class="btn-admin-action btn-admin-edit" data-edit="' + product.id + '" aria-label="' + I18N.t('adminEditAria') + ': ' + escapeHtml(product.title) + '">' +
                        '<i class="fa-solid fa-pen-to-square"></i>' +
                    '</button>' +
                    '<button type="button" class="btn-admin-action btn-admin-delete" data-delete="' + product.id + '" aria-label="' + I18N.t('remove') + ': ' + escapeHtml(product.title) + '">' +
                        '<i class="fa-solid fa-trash-can"></i>' +
                    '</button>' +
                '</td>';

            tr.querySelector('[data-edit]').addEventListener('click', function () {
                openFormModal(product);
            });

            tr.querySelector('[data-delete]').addEventListener('click', function () {
                deleteProduct(product.id, product.title);
            });

            dom.adminTableBody.appendChild(tr);
        });
    }

    function addProduct(data) {
        var products = loadProducts();
        var newProduct = {
            id: Date.now(),
            title: data.title,
            price: Number(data.price),
            description: data.description,
            category: data.category,
            image: data.image,
            rate: 4,
            source: 'admin',
        };
        products.push(newProduct);
        saveProducts(products);
    }

    function editProduct(id, data) {
        var products = loadProducts();
        var index = products.findIndex(function (p) { return p.id === id; });
        if (index === -1) return;

        products[index].title = data.title;
        products[index].price = Number(data.price);
        products[index].description = data.description;
        products[index].category = data.category;
        products[index].image = data.image;
        saveProducts(products);
    }

    function deleteProduct(id, title) {
        Swal.fire({
            title: I18N.t('adminDeleteTitle'),
            text: I18N.t('adminDeleteConfirm').replace('{title}', title),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#636e72',
            confirmButtonText: I18N.t('adminDeleteYes'),
            cancelButtonText: I18N.t('adminCancel'),
        }).then(function (result) {
            if (result.isConfirmed) {
                var products = loadProducts();
                products = products.filter(function (p) { return p.id !== id; });
                saveProducts(products);
                renderProducts();
                Swal.fire({
                    icon: 'success',
                    title: I18N.t('adminProductDeleted'),
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
        });
    }

    /* ========================
       Formulario (agregar / editar)
       ======================== */
    function openFormModal(product) {
        resetForm();

        if (product) {
            editingId = product.id;
            document.getElementById('productFormModalTitle').textContent = I18N.t('adminEditProduct');
            dom.formTitle.value = product.title;
            dom.formPrice.value = product.price;
            dom.formCategory.value = product.category;
            dom.formImage.value = product.image;
            dom.formDescription.value = product.description;
            handleImagePreview();
        } else {
            editingId = null;
            document.getElementById('productFormModalTitle').textContent = I18N.t('adminAddProduct');
        }

        bootstrapModal.show();
    }

    function handleSaveProduct() {
        if (!dom.productForm.checkValidity()) {
            dom.productForm.classList.add('was-validated');
            return;
        }

        var data = {
            title: dom.formTitle.value.trim(),
            price: dom.formPrice.value,
            category: dom.formCategory.value,
            image: dom.formImage.value.trim(),
            description: dom.formDescription.value.trim(),
        };

        if (editingId !== null) {
            editProduct(editingId, data);
            Swal.fire({
                icon: 'success',
                title: I18N.t('adminProductUpdated'),
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
                customClass: { container: 'toast-offset' },
            });
        } else {
            addProduct(data);
            Swal.fire({
                icon: 'success',
                title: I18N.t('adminProductAdded'),
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
                customClass: { container: 'toast-offset' },
            });
        }

        bootstrapModal.hide();
        renderProducts();
    }

    function resetForm() {
        dom.productForm.reset();
        dom.productForm.classList.remove('was-validated');
        dom.imagePreviewWrapper.hidden = true;
        editingId = null;
    }

    function handleImagePreview() {
        var url = dom.formImage.value.trim();
        if (url) {
            dom.imagePreview.src = url;
            dom.imagePreview.onerror = function () {
                dom.imagePreviewWrapper.hidden = true;
            };
            dom.imagePreview.onload = function () {
                dom.imagePreviewWrapper.hidden = false;
            };
        } else {
            dom.imagePreviewWrapper.hidden = true;
        }
    }

    /* ========================
       Helpers
       ======================== */
    function formatCategory(cat) {
        var labels = {
            electronics: I18N.t('catElectronics'),
            jewelery: I18N.t('catJewelery'),
            "men's clothing": I18N.t('catMensClothing'),
            "women's clothing": I18N.t('catWomensClothing'),
        };
        return labels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

})();
