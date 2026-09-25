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
- Checkout en varios pasos (`checkout.html` + `JS/checkout.js`): datos personales y entrega, método de pago (efectivo PagoFácil/RapiPago con código de pago, tarjeta de crédito y débito), revisión y confirmación
- Selector de idioma ES/EN compartido (`JS/i18n.js`) en Index, Catálogo y Checkout, con persistencia en localStorage

## Julian Emanuel Guajardo Luchesi — JulianIstea
- Página de Catálogo (catalogo.html + catalogo.js)
- Página independiente con la misma temática del index
- Fetch de productos desde fakestoreapi.com
- Tarjetas con imagen, título, precio y estrellas de rating
- Filtrado por categoría (botones del nav)
- Búsqueda en tiempo real por nombre
- Ordenamiento: precio mayor/menor, nombre A-Z/Z-A
- Paginación client-side (8 productos por página)
- Modal de detalle con "Agregar al carrito"
- Sidebar del carrito completo (cantidad +/-, eliminar, total, localStorage)
- SweetAlert2 para todos los mensajes
. Enlace al Catálogo en el Index
 - Botón "Catálogo" en la navbar del index.html que redirige a catalogo.html
. Panel de Administración (admin.html + admin.js)
 - Login con credenciales hardcodeadas (admin / admin123)
 - CRUD completo: agregar, editar y eliminar productos
 - localStorage con clave lawc-admin-products
 - Sesión persistente (lawc-admin-session) — no se pierde al recargar
 - Formulario modal con validación: título, precio, categoría, URL de imagen, descripción
 - Preview de imagen en tiempo real
 - Tabla responsiva con botones de editar/eliminar
 - Confirmaciones con SweetAlert2
. Integración de productos del admin
 - main.js: loadData() ahora carga productos de la API + los del admin
 - catalogo.js: loadProducts() ahora carga productos de la API + los del admin
 - Si la API falla, se muestran al menos los productos del admin
. Enlace Admin en navbar
 - Icono fa-gear en la navbar del index y del catálogo que accede a admin.html
