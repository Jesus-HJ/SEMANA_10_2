# TechStore Pro

Panel administrativo y tienda pública para gestionar productos con React, Express y MySQL. La API calcula los indicadores desde la tabla `productos` y no genera estadísticas simuladas.

## Requisitos

- Node.js 20 o posterior
- MySQL de XAMPP en ejecución

## Preparación

1. En phpMyAdmin o en la consola MySQL, ejecuta `server/database.sql`. Esto crea `db_lab10` y la tabla `productos` si todavía no existen.
2. Copia `server/.env.example` a `server/.env` y ajusta usuario, contraseña, puerto u host si tu instalación de MySQL lo requiere.
3. Desde la raíz del proyecto, instala dependencias y ejecuta el frontend y la API:

   ```sh
   npm install
   npm run dev
   ```

4. Abre la dirección de Vite que aparece en la consola. La API se ejecuta en `http://localhost:3001` y Vite reenvía `/api` al servidor.

En Windows PowerShell, puedes copiar la configuración con `Copy-Item server\.env.example server\.env`.

### Productos reales e imágenes de referencia

Ejecuta `npm run seed:references --workspace server` para cargar referencias a cuatro modelos reales: Logitech MX Master 3S, Raspberry Pi 5, Nintendo Switch y Samsung Galaxy Z Fold3 5G. El script es idempotente y no altera productos que ya existan. Las fotografías están guardadas localmente en `client/public/products`; sus autores, licencias y enlaces de atribución constan en `client/public/products/credits.txt`.

Los registros se crean intencionalmente con precio y stock en `0`: son referencias de catálogo, no una confirmación de inventario o precios de venta. La tienda muestra “Consultar precio” y “Agotado” hasta que actualices los valores reales desde el panel de Productos.

## API

- `GET /api/products` — lista productos.
- `GET /api/products/stats` — devuelve `total`, `disponibles`, `agotados` y `stock_bajo` calculados desde MySQL. Stock bajo significa entre 1 y 5 unidades.
- `POST /api/products` — crea un producto.
- `PUT /api/products/:id` — actualiza un producto.
- `DELETE /api/products/:id` — elimina un producto.
- `GET /api/health` — estado del servidor Express.

Los campos JSON son `id`, `nombre`, `descripcion`, `categoria`, `precio`, `stock` e `imagen`. Los controladores y las rutas están implementados manualmente en `server/src/controllers` y `server/src/routes`.

## Producción

`npm run build` genera los estáticos del frontend en `client/dist`. El servidor de desarrollo no sirve esos estáticos; configura tu servidor web o proxy de producción para publicar `client/dist` y dirigir `/api` a Express.

![
   
](05-get-200.png) ![
   
](04-xampp-activo.png) ![
   
](03-conexion-mysql.png) ![
   
](02-controlador.png) ![
   
](01-estructura.png)