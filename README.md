## Integrantes
- **Federico Javier Romero** — `ZakeD6-1`
- **Julian Emanuel Guajardo Luchesi** — `JulianIstea`

## Stack
- API: https://web-api-products.runasp.net / https://fakestoreapi.com (catálogo)
- Bootstrap 5 + SweetAlert2 + Google Fonts (Poppins)
- LocalStorage para el carrito (`lawc-cart`)
- i18n ES/EN con memoria (`lawc-lang`): la primera vez usa el idioma del navegador y luego persiste

## Federico Javier Romero — ZakeD6-1
- Estructura semántica HTML5 y estilos responsive (`CSS/styles.css`)
- Consumo de API con Fetch (productos y categorías)
- Home con secciones de destacados (rating 5) y nuevos productos + hero de bienvenida y contacto
- Cards de productos + modal de detalle
- Botón "Agregar al carrito" directo en las cards (Index y Catálogo)
- Carrito lateral con localStorage (`lawc-cart`, con migración automática de la clave vieja `lawc_cart`): badge de unidades, −/+, eliminar, total por producto, eliminar todos
- Buscador en tiempo real y navegación por categorías
- Mensajes con SweetAlert2 e internacionalización ES/EN
- Checkout en varios pasos (`HTML/checkout.html` + `JS/checkout.js`): datos personales y entrega, método de pago (efectivo PagoFácil/RapiPago con código de pago, tarjeta de crédito y débito), revisión y confirmación
- Selector de idioma ES/EN compartido (`JS/i18n.js`) en Index, Catálogo y Checkout, con persistencia en localStorage

## Julian Emanuel Guajardo Luchesi — JulianIstea
