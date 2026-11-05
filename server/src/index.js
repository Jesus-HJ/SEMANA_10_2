import "dotenv/config";
import app from "./app.js";
import pool from "./db.js";

const port = Number(process.env.PORT || 3001);

const server = app.listen(port, () => {
  console.log(`TechStore Pro API escuchando en http://localhost:${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} recibido; cerrando conexiones...`);
  server.close(async (serverError) => {
    try {
      await pool.end();
      if (serverError) {
        console.error("Error al cerrar el servidor:", serverError);
        process.exitCode = 1;
      }
    } catch (error) {
      console.error("Error al cerrar la conexión MySQL:", error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
