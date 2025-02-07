import express from "express";
import fetch from "node-fetch"; // Certifique-se de instalar: npm install node-fetch
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/consultar/:cep", async (req, res) => {
  const { cep } = req.params;

  if (!/^\d{8}$/.test(cep)) {
    return res.status(400).json({ error: "CEP inválido. Insira um CEP com 8 dígitos." });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
      return res.status(404).json({ error: "CEP não encontrado." });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao consultar API do ViaCEP." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});