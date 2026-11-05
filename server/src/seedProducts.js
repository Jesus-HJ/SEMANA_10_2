import "dotenv/config";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const scriptUrl = new URL("../seed-products.sql", import.meta.url);
const sql = await readFile(fileURLToPath(scriptUrl), "utf8");
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "db_lab10",
  multipleStatements: true,
  charset: "utf8mb4"
});

try {
  await connection.query(sql);
  console.log("Productos de referencia cargados. El script se puede ejecutar de nuevo sin duplicarlos.");
} finally {
  await connection.end();
}
