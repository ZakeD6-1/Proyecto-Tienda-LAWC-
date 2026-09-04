/* ==========================================================================
   i18n.js - Internacionalizacion compartida (ES/EN) para toda la app
   - Detecta el idioma del navegador solo la primera vez que el usuario
     entra (si no hay uno guardado en localStorage).
   - Guarda la eleccion en localStorage (lawc-lang) para que persista al
     navegar entre paginas o volver a entrar mas tarde.
   ========================================================================== */

(function () {
    'use strict';

    var LANG_STORAGE_KEY = 'lawc-lang';

    var translations = {
        es: {
            brand: 'FJ Shop',
            homeHeroTitle: 'Bienvenido a FJ Shop',
            homeHeroSubtitle: 'Productos destacados y las últimas novedades en un solo lugar.',
            featuredTitle: 'Productos destacados',
            featuredSubtitle: 'Los favoritos de nuestros clientes',
            newTitle: 'Nuevos productos',
            newSubtitle: 'Las últimas incorporaciones',
            contactTitle: 'Contacto',
            contactSubtitle: 'Escribinos, respondemos a la brevedad',
            contactEmail: 'contacto@fjshop.com',
            contactPhone: '+54 11 2345-6789',
            contactAddress: 'Calle Falsa 123',
            searchPlaceholder: 'Buscar productos por nombre...',
            productsTitle: 'Nuestros Productos',
            catalogTitle: 'Catalogo de Productos',
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
            clearAllWarning: 'Esta acción no se puede deshacer.',
            clearAllTitle: 'Carrito vaciado',
            clearAllMsg: 'Se eliminaron todos los productos del carrito.',
            checkout: 'Finalizar compra',
            close: 'Cerrar',
            all: 'Todas',
            footerText: 'Todos los derechos reservados.',
            rating: 'Puntuación',
            quantity: 'Cantidad',
            remove: 'Eliminar',
            qtyMinus: 'Restar cantidad',
            qtyPlus: 'Sumar cantidad',
            catalogo: 'Catalogo',
            inicio: 'Inicio',
            home: 'Inicio',
            store: 'Catálogo',
            langEs: 'ES',
            langEn: 'EN',
            sortBy: 'Ordenar por:',
            sortDefault: 'Por defecto',
            sortPriceAsc: 'Precio: menor a mayor',
            sortPriceDesc: 'Precio: mayor a menor',
            sortNameAsc: 'Nombre: A - Z',
            sortNameDesc: 'Nombre: Z - A',
            productsFound: '{count} producto(s) encontrado(s)',
            pageOf: 'Página {current} de {total}',
            prev: 'Anterior',
            next: 'Siguiente',
            noProducts: 'No se encontraron productos.',
            checkoutTitle: 'Finalizar compra',
            checkoutSubtitle: 'Completá tus datos para procesar el pedido',
            checkoutEmpty: 'Tu carrito está vacío.',
            checkoutEmptyMsg: 'Agregá productos antes de finalizar la compra.',
            goCatalog: 'Ir al catálogo',
            step1: 'Datos personales',
            step2: 'Pago',
            step3: 'Revisión',
            step1Title: 'Datos personales y entrega',
            step2Title: 'Método de pago',
            step3Title: 'Revisión y confirmación',
            name: 'Nombre completo',
            email: 'Correo electrónico',
            phone: 'Teléfono',
            address: 'Dirección',
            city: 'Ciudad',
            postalCode: 'Código postal',
            deliveryMethod: 'Método de entrega',
            deliveryHome: 'Envío a domicilio',
            deliveryPickup: 'Retiro en sucursal',
            nextBtn: 'Siguiente',
            backBtn: 'Volver',
            confirmPay: 'Confirmar y pagar',
            paymentMethod: 'Forma de pago',
            payCash: 'Efectivo',
            payCardCredit: 'Tarjeta de crédito',
            payCardDebit: 'Tarjeta de débito',
            cashOption: 'Elegí el proveedor para abonar en efectivo',
            cashPagoFacil: 'PagoFácil',
            cashRapiPago: 'RapiPago',
            generateCode: 'Generar código de pago',
            paymentCode: 'Código de pago',
            paymentCodeMsg: 'Presentá este código en {provider} para abonar tu pedido.',
            cardNumber: 'Número de la tarjeta',
            cardHolder: 'Titular',
            cardExpiry: 'Vencimiento (MM/AA)',
            cardCvv: 'CVV',
            installments: 'Cuotas',
            onePayment: '1 pago',
            orderSummary: 'Resumen del pedido',
            subtotal: 'Subtotal',
            shippingCost: 'Costo de envío',
            shippingFree: 'Gratis',
            shippingToPay: 'A convenir',
            total: 'Total',
            unitsLabel: 'unidades',
            paySuccessTitle: '¡Pago realizado!',
            paySuccessMsg: 'Gracias por tu compra. Tu pedido fue procesado correctamente.',
            validationError: 'Revisá los campos marcados.',
            choosePayment: 'Elegí un método de pago para continuar.',
            paymentConfirmTitle: 'Confirmar compra',
            paymentConfirmMsg: '¿Confirmar el pago de {total}?',
            yes: 'Sí',
            no: 'No',
            paymentCodeTitle: 'Código de pago generado',
            selectInstallments: 'Seleccioná la cantidad de cuotas',
            selectProvider: 'Seleccioná un proveedor de pago en efectivo',
            catElectronics: 'Electrónica',
            catJewelery: 'Joyería',
            catMensClothing: 'Ropa Hombre',
            catWomensClothing: 'Ropa Mujer',
        },
        en: {
            brand: 'FJ Shop',
            homeHeroTitle: 'Welcome to FJ Shop',
            homeHeroSubtitle: 'Featured products and the latest news all in one place.',
            featuredTitle: 'Featured products',
            featuredSubtitle: "Our customers' favorites",
            newTitle: 'New products',
            newSubtitle: 'Latest additions',
            contactTitle: 'Contact',
            contactSubtitle: "Write to us, we'll reply shortly",
            contactEmail: 'contacto@fjshop.com',
            contactPhone: '+54 11 2345-6789',
            contactAddress: 'Calle Falsa 123',
            searchPlaceholder: 'Search products by name...',
            productsTitle: 'Our Products',
            catalogTitle: 'Product Catalog',
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
            clearAllWarning: 'This action cannot be undone.',
            clearAllTitle: 'Cart cleared',
            clearAllMsg: 'All products were removed from the cart.',
            checkout: 'Checkout',
            close: 'Close',
            all: 'All',
            footerText: 'All rights reserved.',
            rating: 'Rating',
            quantity: 'Quantity',
            remove: 'Remove',
            qtyMinus: 'Decrease quantity',
            qtyPlus: 'Increase quantity',
            catalogo: 'Catalog',
            inicio: 'Home',
            home: 'Home',
            store: 'Catalog',
            langEs: 'ES',
            langEn: 'EN',
            sortBy: 'Sort by:',
            sortDefault: 'Default',
            sortPriceAsc: 'Price: low to high',
            sortPriceDesc: 'Price: high to low',
            sortNameAsc: 'Name: A - Z',
            sortNameDesc: 'Name: Z - A',
            productsFound: '{count} product(s) found',
            pageOf: 'Page {current} of {total}',
            prev: 'Previous',
            next: 'Next',
            noProducts: 'No products found.',
            checkoutTitle: 'Checkout',
            checkoutSubtitle: 'Complete your details to process the order',
            checkoutEmpty: 'Your cart is empty.',
            checkoutEmptyMsg: 'Add products before checking out.',
            goCatalog: 'Go to catalog',
            step1: 'Personal details',
            step2: 'Payment',
            step3: 'Review',
            step1Title: 'Personal details and delivery',
            step2Title: 'Payment method',
            step3Title: 'Review and confirm',
            name: 'Full name',
            email: 'Email',
            phone: 'Phone',
            address: 'Address',
            city: 'City',
            postalCode: 'Postal code',
            deliveryMethod: 'Delivery method',
            deliveryHome: 'Home delivery',
            deliveryPickup: 'In-store pickup',
            nextBtn: 'Next',
            backBtn: 'Back',
            confirmPay: 'Confirm and pay',
            paymentMethod: 'Payment method',
            payCash: 'Cash',
            payCardCredit: 'Credit card',
            payCardDebit: 'Debit card',
            cashOption: 'Choose the provider to pay in cash',
            cashPagoFacil: 'PagoFácil',
            cashRapiPago: 'RapiPago',
            generateCode: 'Generate payment code',
            paymentCode: 'Payment code',
            paymentCodeMsg: 'Show this code at {provider} to pay for your order.',
            cardNumber: 'Card number',
            cardHolder: 'Cardholder',
            cardExpiry: 'Expiry (MM/YY)',
            cardCvv: 'CVV',
            installments: 'Installments',
            onePayment: '1 payment',
            orderSummary: 'Order summary',
            subtotal: 'Subtotal',
            shippingCost: 'Shipping cost',
            shippingFree: 'Free',
            shippingToPay: 'To be determined',
            total: 'Total',
            unitsLabel: 'units',
            paySuccessTitle: 'Payment successful!',
            paySuccessMsg: 'Thank you for your purchase. Your order has been processed successfully.',
            validationError: 'Please review the highlighted fields.',
            choosePayment: 'Choose a payment method to continue.',
            paymentConfirmTitle: 'Confirm purchase',
            paymentConfirmMsg: 'Confirm the payment of {total}?',
            yes: 'Yes',
            no: 'No',
            paymentCodeTitle: 'Payment code generated',
            selectInstallments: 'Select the number of installments',
            selectProvider: 'Select a cash payment provider',
            catElectronics: 'Electronics',
            catJewelery: 'Jewelery',
            catMensClothing: "Men's Clothing",
            catWomensClothing: "Women's Clothing",
        },
    };

    // Idiomas soportados
    var SUPPORTED = ['es', 'en'];

    // Idioma activo
    var currentLang = detectLanguage();

    function detectLanguage() {
        try {
            var saved = localStorage.getItem(LANG_STORAGE_KEY);
            if (saved && SUPPORTED.indexOf(saved) !== -1) {
                return saved;
            }
        } catch (e) { /* ignore */ }

        // Primera vez: usa el idioma del navegador
        var browserLang = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
        return browserLang.indexOf('es') === 0 ? 'es' : 'en';
    }

    function getLang() {
        return currentLang;
    }

    // Cambia el idioma, lo guarda y luego aplica los textos
    function setLanguage(lang, apply) {
        if (SUPPORTED.indexOf(lang) === -1) return;
        currentLang = lang;
        try {
            localStorage.setItem(LANG_STORAGE_KEY, lang);
        } catch (e) { /* ignore */ }
        if (apply !== false) {
            applyI18n();
        }
    }

    function t(key) {
        var dict = translations[currentLang] || {};
        return dict[key] !== undefined ? dict[key] : key;
    }

    // Aplica textos i18n a elementos con data-i18n / data-i18n-placeholder
    function applyI18n() {
        var els = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        }
        var phs = document.querySelectorAll('[data-i18n-placeholder]');
        for (var j = 0; j < phs.length; j++) {
            var p = phs[j];
            var pk = p.getAttribute('data-i18n-placeholder');
            p.setAttribute('placeholder', t(pk));
        }
    }

    // Expone la API globalmente
    window.I18N = {
        getLang: getLang,
        setLanguage: setLanguage,
        t: t,
        applyI18n: applyI18n,
        translations: translations,
    };
})();
