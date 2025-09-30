import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();



// Add COOP/COEP
// Add middleware for .wasm files
app.use((req, res, next) => {
  if (req.path.endsWith(".wasm")) {
    res.set("Content-Type", "application/wasm");
  }
  next();
});
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  next();
});

// Serve your CRA build or public folder
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "dist")));


// All other routes go to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 8082;
app.listen(port, () => console.log(`Server listening on ${port}`));