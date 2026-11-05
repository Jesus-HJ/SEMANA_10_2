USE db_lab10;

INSERT INTO productos (nombre, descripcion, categoria, precio, stock, imagen)
SELECT
  'Logitech MX Master 3S',
  'Mouse inalámbrico ergonómico. Producto de referencia: confirma el precio y registra las existencias reales antes de venderlo.',
  'Periféricos',
  0,
  0,
  '/products/logitech-mx-master-3s.jpg'
WHERE NOT EXISTS (
  SELECT 1 FROM productos WHERE nombre = 'Logitech MX Master 3S' LIMIT 1
);

INSERT INTO productos (nombre, descripcion, categoria, precio, stock, imagen)
SELECT
  'Raspberry Pi 5',
  'Computadora de placa única para proyectos y desarrollo. Producto de referencia: confirma el precio y registra las existencias reales antes de venderlo.',
  'Computación',
  0,
  0,
  '/products/raspberry-pi-5.jpg'
WHERE NOT EXISTS (
  SELECT 1 FROM productos WHERE nombre = 'Raspberry Pi 5' LIMIT 1
);

INSERT INTO productos (nombre, descripcion, categoria, precio, stock, imagen)
SELECT
  'Nintendo Switch',
  'Consola híbrida portátil y de sobremesa. Producto de referencia: confirma el precio y registra las existencias reales antes de venderlo.',
  'Videojuegos',
  0,
  0,
  '/products/nintendo-switch.jpg'
WHERE NOT EXISTS (
  SELECT 1 FROM productos WHERE nombre = 'Nintendo Switch' LIMIT 1
);

INSERT INTO productos (nombre, descripcion, categoria, precio, stock, imagen)
SELECT
  'Samsung Galaxy Z Fold3 5G',
  'Smartphone plegable de la serie Galaxy Z Fold3. Producto de referencia: confirma el precio y registra las existencias reales antes de venderlo.',
  'Celulares',
  0,
  0,
  '/products/samsung-galaxy-z-fold3.jpg'
WHERE NOT EXISTS (
  SELECT 1 FROM productos WHERE nombre = 'Samsung Galaxy Z Fold3 5G' LIMIT 1
);
