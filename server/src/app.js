import cors from "cors";
import express from "express";
import productRoutes from "./routes/productRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/products", productRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `No existe la ruta ${req.method} ${req.path}.` });
});

app.use((error, _req, res, _next) => {
  console.error("API error:", error);
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ message: "El cuerpo de la solicitud no contiene JSON válido." });
  }
  res.status(500).json({ message: "Ocurrió un error interno. Inténtalo nuevamente." });
});

export default app;
