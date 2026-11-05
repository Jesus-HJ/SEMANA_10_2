import pool from "../db.js";

const fields = ["nombre", "descripcion", "categoria", "precio", "stock", "imagen"];

function validateProduct(body) {
  const errors = {};
  const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
  const categoria = typeof body.categoria === "string" ? body.categoria.trim() : "";
  const precio = Number(body.precio);
  const stock = Number(body.stock);

  if (!nombre) errors.nombre = "El nombre es obligatorio.";
  if (nombre.length > 160) errors.nombre = "El nombre no puede superar 160 caracteres.";
  if (!categoria) errors.categoria = "La categoría es obligatoria.";
  if (categoria.length > 100) errors.categoria = "La categoría no puede superar 100 caracteres.";
  if (!Number.isFinite(precio) || precio < 0) errors.precio = "Ingresa un precio válido mayor o igual a cero.";
  if (!Number.isInteger(stock) || stock < 0) errors.stock = "El stock debe ser un entero mayor o igual a cero.";
  if (body.imagen != null && typeof body.imagen !== "string") errors.imagen = "La imagen debe ser una URL de texto.";
  if (typeof body.imagen === "string" && body.imagen.length > 2048) errors.imagen = "La URL de imagen es demasiado larga.";

  return {
    errors,
    values: {
      nombre,
      descripcion: typeof body.descripcion === "string" ? body.descripcion.trim() : "",
      categoria,
      precio,
      stock,
      imagen: typeof body.imagen === "string" ? body.imagen.trim() || null : null
    }
  };
}

export async function listProducts(_req, res, next) {
  try {
    const [products] = await pool.query(
      `SELECT ${fields.join(", ")}, id, creado_en, actualizado_en
       FROM productos ORDER BY actualizado_en DESC, id DESC`
    );
    res.json(products);
  } catch (error) {
    next(error);
  }
}

export async function getProductStats(_req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(stock > 0), 0) AS disponibles,
        COALESCE(SUM(stock = 0), 0) AS agotados,
        COALESCE(SUM(stock > 0 AND stock <= 5), 0) AS stock_bajo
      FROM productos
    `);
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  const { errors, values } = validateProduct(req.body ?? {});
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: "Revisa los datos del producto.", errors });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO productos (nombre, descripcion, categoria, precio, stock, imagen)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [values.nombre, values.descripcion || null, values.categoria, values.precio, values.stock, values.imagen]
    );
    const [rows] = await pool.execute("SELECT * FROM productos WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: "El identificador del producto no es válido." });
  }

  const { errors, values } = validateProduct(req.body ?? {});
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: "Revisa los datos del producto.", errors });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE productos
       SET nombre = ?, descripcion = ?, categoria = ?, precio = ?, stock = ?, imagen = ?
       WHERE id = ?`,
      [values.nombre, values.descripcion || null, values.categoria, values.precio, values.stock, values.imagen, id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "No se encontró el producto." });

    const [rows] = await pool.execute("SELECT * FROM productos WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ message: "El identificador del producto no es válido." });
  }

  try {
    const [result] = await pool.execute("DELETE FROM productos WHERE id = ?", [id]);
    if (!result.affectedRows) return res.status(404).json({ message: "No se encontró el producto." });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
