/* ==========================================================================
   checkout.js - Pagina de pago (checkout)
   - Lee el carrito compartido de localStorage (lawc-cart)
   - Flujo en pasos: datos personales -> metodo de pago -> revision
   - Metodos: efectivo (PagoFacil/RapiPago con codigo de pago) y
     tarjeta de credito/debito (simulado)
   ========================================================================== */

(function () {
    'use strict';

    var CART_STORAGE_KEY = 'lawc-cart';
    var OLD_CART_STORAGE_KEY = 'lawc_cart';

    var cart = loadCart();
    var currentStep = 1;
    var paymentMethod = null;
    var cashCode = null;

    var dom = {
        checkoutEmpty: document.getElementById('checkoutEmpty'),
        checkoutLayout: document.getElementById('checkoutLayout'),
        checkoutSteps: document.getElementById('checkoutSteps'),
        summaryItems: document.getElementById('summaryItems'),
        summarySubtotal: document.getElementById('summarySubtotal'),
        summaryShipping: document.getElementById('summaryShipping'),
        summaryTotal: document.getElementById('summaryTotal'),
        cartBadge: document.getElementById('cartBadge'),
        year: document.getElementById('year'),
        langCurrent: document.getElementById('langCurrent'),
        langOptions: document.querySelectorAll('.lang-option'),
        confirmPayBtn: document.getElementById('confirmPayBtn'),
    };

    document.addEventListener('DOMContentLoaded', function () {
        dom.year.textContent = new Date().getFullYear();

        updateBadge();
        updateLangToggle();
        I18N.applyI18n();

        if (cart.length === 0) {
            showEmpty();
            return;
        }

        renderSummary();
        bindPaymentOptions();
        bindStepNav();
        bindConfirm();
        bindLanguageButtons();
    });

    /* ========================
       Carrito
       ======================== */
    function loadCart() {
        try {
            var raw = localStorage.getItem(CART_STORAGE_KEY);
            if (!raw) {
                var oldCart = localStorage.getItem(OLD_CART_STORAGE_KEY);
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

    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }

    function showEmpty() {
        dom.checkoutEmpty.hidden = false;
        dom.checkoutLayout.hidden = true;
        dom.checkoutSteps.hidden = true;
        updateBadge();
    }

    function updateBadge() {
        var units = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
        dom.cartBadge.textContent = units;
        dom.cartBadge.hidden = units === 0;
    }

    function getTotalPrice() {
        return cart.reduce(function (sum, item) { return sum + item.price * item.quantity; }, 0);
    }

    function formatPrice(value) {
        return '$' + Number(value).toFixed(2);
    }

    function hasShipping() {
        var method = document.querySelector('input[name="deliveryMethod"]:checked');
        return method ? method.value === 'home' : true;
    }

    function shippingLabel() {
        return hasShipping() ? I18N.t('shippingToPay') : I18N.t('shippingFree');
    }

    /* ========================
       Resumen del pedido
       ======================== */
    function renderSummary() {
        dom.summaryItems.innerHTML = '';

        cart.forEach(function (item) {
            var el = document.createElement('div');
            el.className = 'summary-item';
            el.innerHTML =
                '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" class="summary-item-img">' +
                '<div class="summary-item-info">' +
                    '<p class="summary-item-title">' + escapeHtml(item.title) + '</p>' +
                    '<span class="summary-item-qty">' + item.quantity + ' ' + I18N.t('unitsLabel') + ' × ' + formatPrice(item.price) + '</span>' +
                '</div>' +
                '<strong class="summary-item-total">' + formatPrice(item.price * item.quantity) + '</strong>';
            dom.summaryItems.appendChild(el);
        });

        dom.summarySubtotal.textContent = formatPrice(getTotalPrice());
        dom.summaryShipping.textContent = shippingLabel();
        dom.summaryTotal.textContent = formatPrice(getTotalPrice());
    }

    /* ========================
       Stepper / Navegacion de pasos
       ======================== */
    function goToStep(step) {
        if (step < 1) step = 1;
        if (step > 3) step = 3;
        currentStep = step;

        document.querySelectorAll('.checkout-pane').forEach(function (pane) {
            pane.classList.toggle('active', Number(pane.getAttribute('data-pane')) === step);
            pane.hidden = Number(pane.getAttribute('data-pane')) !== step;
        });

        document.querySelectorAll('.checkout-step').forEach(function (st) {
            st.classList.toggle('active', Number(st.getAttribute('data-step-target')) <= step);
        });

        if (step === 3) {
            renderReview();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function bindStepNav() {
        document.querySelectorAll('.btn-next').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (!validateStep(currentStep)) return;
                goToStep(Number(btn.getAttribute('data-next')));
            });
        });
        document.querySelectorAll('.btn-back').forEach(function (btn) {
            btn.addEventListener('click', function () {
                goToStep(Number(btn.getAttribute('data-back')));
            });
        });
    }

    /* ========================
       Validacion de pasos
       ======================== */
    function validateStep(step) {
        if (step === 1) {
            var fields = ['checkoutName', 'checkoutEmail', 'checkoutPhone', 'checkoutAddress', 'checkoutCity', 'checkoutPostal'];
            var allOk = true;
            fields.forEach(function (id) {
                var input = document.getElementById(id);
                input.classList.remove('is-invalid');
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    allOk = false;
                }
            });
            if (!allOk) {
                Swal.fire({ icon: 'error', title: I18N.t('validationError'), confirmButtonColor: '#6c5ce7' });
                return false;
            }
            return true;
        }

        if (step === 2) {
            if (!paymentMethod) {
                Swal.fire({ icon: 'error', title: I18N.t('choosePayment'), confirmButtonColor: '#6c5ce7' });
                return false;
            }
            if (paymentMethod === 'cash' && !cashCode) {
                Swal.fire({ icon: 'error', title: I18N.t('selectProvider'), confirmButtonColor: '#6c5ce7' });
                return false;
            }
            if ((paymentMethod === 'credit' || paymentMethod === 'debit')) {
                var prefix = paymentMethod === 'credit' ? 'cc' : 'dc';
                var card = [
                    prefix + 'Number',
                    prefix + 'Holder',
                    prefix + 'Expiry',
                    prefix + 'Cvv'
                ];
                var ok = true;
                card.forEach(function (id) {
                    var input = document.getElementById(id);
                    input.classList.remove('is-invalid');
                    if (!input.value.trim()) {
                        input.classList.add('is-invalid');
                        ok = false;
                    }
                });
                if (!ok) {
                    Swal.fire({ icon: 'error', title: I18N.t('validationError'), confirmButtonColor: '#6c5ce7' });
                    return false;
                }
            }
            return true;
        }

        return true;
    }

    /* ========================
       Metodo de pago
       ======================== */
    function bindPaymentOptions() {
        document.querySelectorAll('input[name="paymentMethod"]').forEach(function (radio) {
            radio.addEventListener('change', function () {
                paymentMethod = radio.value;
                document.getElementById('cashBody').hidden = radio.value !== 'cash';
                document.getElementById('creditBody').hidden = radio.value !== 'credit';
                document.getElementById('debitBody').hidden = radio.value !== 'debit';
            });
        });

        document.getElementById('generateCashCode').addEventListener('click', function () {
            var provider = document.getElementById('cashProvider').value;
            var providerName = provider === 'pagofacil' ? I18N.t('cashPagoFacil') : I18N.t('cashRapiPago');
            cashCode = generateCode();
            document.getElementById('cashCodeValue').textContent = cashCode;
            document.getElementById('cashCodeMsg').textContent = I18N.t('paymentCodeMsg').replace('{provider}', providerName);
            document.getElementById('cashCodeResult').hidden = false;

            Swal.fire({
                icon: 'info',
                title: I18N.t('paymentCodeTitle'),
                text: I18N.t('paymentCodeMsg').replace('{provider}', providerName) + ' ' + cashCode,
                confirmButtonColor: '#6c5ce7',
            });
        });
    }

    function generateCode() {
        var code = '';
        var chars = '0123456789';
        for (var i = 0; i < 10; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /* ========================
       Revision
       ======================== */
    function paymentSummaryText() {
        if (paymentMethod === 'cash') {
            var providerName = document.getElementById('cashProvider').value === 'pagofacil'
                ? I18N.t('cashPagoFacil') : I18N.t('cashRapiPago');
            return I18N.t('payCash') + ' · ' + providerName + ' · ' + (cashCode || '-');
        }
        if (paymentMethod === 'credit') {
            return I18N.t('payCardCredit') + ' · **** ' + maskCard(document.getElementById('ccNumber').value);
        }
        return I18N.t('payCardDebit') + ' · **** ' + maskCard(document.getElementById('dcNumber').value);
    }

    function maskCard(value) {
        value = value.replace(/\s/g, '');
        return value.slice(-4);
    }

    /* ========================
       Confirmar y pagar
       ======================== */
    function bindConfirm() {
        dom.confirmPayBtn.addEventListener('click', function () {
            if (!validateStep(3)) return;

            var total = formatPrice(getTotalPrice());
            Swal.fire({
                icon: 'question',
                title: I18N.t('paymentConfirmTitle'),
                text: I18N.t('paymentConfirmMsg').replace('{total}', total),
                showCancelButton: true,
                confirmButtonText: I18N.t('yes'),
                cancelButtonText: I18N.t('no'),
                confirmButtonColor: '#6c5ce7',
                cancelButtonColor: '#b2bec3',
            }).then(function (result) {
                if (result.isConfirmed) {
                    cart = [];
                    saveCart();
                    Swal.fire({
                        icon: 'success',
                        title: I18N.t('paySuccessTitle'),
                        text: I18N.t('paySuccessMsg'),
                        confirmButtonColor: '#6c5ce7',
                    }).then(function () {
                        window.location.href = 'catalogo.html';
                    });
                }
            });
        });
    }

    /* ========================
       Idioma
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
        renderReview();
        renderSummary();
    }

    function renderReview() {
        var personal = [
            I18N.t('name') + ': ' + document.getElementById('checkoutName').value,
            I18N.t('email') + ': ' + document.getElementById('checkoutEmail').value,
            I18N.t('phone') + ': ' + document.getElementById('checkoutPhone').value,
            I18N.t('address') + ': ' + document.getElementById('checkoutAddress').value,
            I18N.t('city') + ': ' + document.getElementById('checkoutCity').value,
            I18N.t('postalCode') + ': ' + document.getElementById('checkoutPostal').value,
        ];
        var delivery = document.querySelector('input[name="deliveryMethod"]:checked');
        var deliveryLabel = delivery && delivery.value === 'pickup' ? I18N.t('deliveryPickup') : I18N.t('deliveryHome');
        personal.push(I18N.t('deliveryMethod') + ': ' + deliveryLabel);

        document.getElementById('reviewPersonal').innerHTML =
            '<h4 class="checkout-review-title">' + I18N.t('step1Title') + '</h4>' +
            personal.map(function (line) { return '<p class="mb-1">' + escapeHtml(line) + '</p>'; }).join('');

        document.getElementById('reviewPayment').innerHTML =
            '<h4 class="checkout-review-title">' + I18N.t('step2Title') + '</h4>' +
            '<p class="mb-0">' + escapeHtml(paymentSummaryText()) + '</p>';
    }

    /* ========================
       Helpers
       ======================== */
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

})();
