import express from "express";
import fetch from "node-fetch";
import { dirname } from "path";
import { fileURLToPath } from "url";
import NodeCache from "node-cache";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import { param, validationResult } from "express-validator";
import https from "https";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

app.use(helmet());
app.use(xss());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Muitas requisições. Tente novamente mais tarde." },
});

app.use(limiter);
app.use(express.static(__dirname));

app.get("/", (_req, res) => {
  res.sendFile(__dirname, "index.html");
});

app.get("/consultar/:cep", param("cep").isLength({ min: 8, max: 8 }).isNumeric().withMessage("CEP inválido. Deve conter 8 dígitos numéricos."),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { cep } = req.params;

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
      console.error("Erro ao buscar o CEP:", error);
      res.status(500).json({ error: "Erro interno do servidor." });
    }
  }
);

https.createServer(
  {
    key: readFileSync('server.key'),
    cert: readFileSync('server.crt')
  },
  app
).listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});