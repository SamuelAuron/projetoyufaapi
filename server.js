import express from "express";
import cors from "cors";
import fs from "fs";
import { checkMvpChanges } from "./watchMvps.js";
import { runCrawler } from "./botmvp2.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 🔁 Atualiza os dados de 1 em 1 minutos (300.000 ms)
setInterval(async () => {
  console.log(`[${new Date().toLocaleTimeString()}] Atualizando arquivos...`);

  try {
    await runCrawler(); // chama sua função que lê/atualiza os arquivos JSON
    console.log("✅ Arquivos atualizados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao atualizar os arquivos:", error);
  }

  try {
    await checkMvpChanges(); // chama sua função que lê/atualiza os arquivos JSON
    console.log("✅ Arquivos atualizados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao atualizar os arquivos:", error);
  }
}, 5 * 60 * 1000); // 1 minutos

// Lê o arquivo mvps.json
const mvps = JSON.parse(fs.readFileSync("mvp_kills_data.json", "utf-8"));
const mvpsInfo = JSON.parse(fs.readFileSync("mvps_data.json", "utf-8"));


// ✅ Rota principal - retorna todos os MVPs
app.get("/api/mvps", (req, res) => {
  res.json(mvps);
});

// ✅ Rota por ID - retorna um MVP específico
app.get("/api/mvps/:id", (req, res) => {
  const { id } = req.params;
  const mvp = mvps.find(m => String(m.mob_id) === id);
  if (!mvp) {
    return res.status(404).json({ error: "MVP não encontrado" });
  }
  res.json(mvp);
});

app.get("/api/mvps_info", (req, res) => {
  res.json(mvpsInfo);
});

app.get("/api/mvps_info/:id", (req, res) => {
  const { id } = req.params;
  const mvp = mvpsInfo.find(m => String(m.monster_id) === id);
  if (!mvp) {
    return res.status(404).json({ error: "MVP não encontrado" });
  }
  res.json(mvp);
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});