import express from "express";
import fetch from "node-fetch"; // Certifique-se de instalar: npm install node-fetch
import { dirname } from "path";
import { fileURLToPath } from "url";
import NodeCache from "node-cache";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

app.use(express.static(__dirname));
app.use(express.json());

app.get("/", (_req, res) => {
  res.sendFile(__dirname, "index.html");
});

app.get("/consultar/:cep", async (req, res) => {
  const { cep } = req.params;

  if (!/^\d{8}$/.test(cep)) {
    return res.status(400).json({ error: "CEP inválido. Insira um CEP com 8 dígitos." });
  }

  const cachedData = cache.get(cep);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) throw new Error("Erro ao consultar API do ViaCEP");

    const data = await response.json();

    if (data.erro) {
      return res.status(404).json({ error: "CEP não encontrado." });
    }

    cache.set(cep, data);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao consultar API do ViaCEP." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});