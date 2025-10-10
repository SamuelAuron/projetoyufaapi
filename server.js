import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { checkMvpChanges } from "./watchMvps.js";
import { runCrawler } from "./botmvp2.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Corrige path base (necessário quando usa módulos ES no Node)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Caminhos corretos para a pasta temporária do Render
const TEMP_DIR = "/tmp"; // no Render é "/tmp" (não "/temp")
const MVP_KILLS_PATH = path.join(TEMP_DIR, "mvp_kills_data.json");
const MVP_INFO_PATH = path.join(TEMP_DIR, "mvps_data.json");

app.use(cors());
app.use(express.json());

// 🔁 Atualiza os dados de 5 em 5 minutos
setInterval(async () => {
  console.log(`[${new Date().toLocaleTimeString()}] Atualizando arquivos...`);

  try {
    await runCrawler(); // Atualiza o arquivo de kills
    console.log("✅ Arquivos de kills atualizados!");
  } catch (error) {
    console.error("❌ Erro ao atualizar kills:", error);
  }

  try {
    await checkMvpChanges(); // Atualiza os dados gerais
    console.log("✅ Arquivos de info atualizados!");
  } catch (error) {
    console.error("❌ Erro ao atualizar info:", error);
  }
}, 5 * 60 * 1000); // 5 minutos

// ✅ Função para carregar os arquivos de forma segura
function loadJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } else {
      console.warn(`⚠️ Arquivo não encontrado: ${filePath}`);
      return [];
    }
  } catch (err) {
    console.error(`❌ Erro lendo ${filePath}:`, err);
    return [];
  }
}

// ✅ Rotas
app.get("/api/mvps", (req, res) => {
  const mvps = loadJsonFile(MVP_KILLS_PATH);
  res.json(mvps);
});

app.get("/api/mvps/:id", (req, res) => {
  const mvps = loadJsonFile(MVP_KILLS_PATH);
  const mvp = mvps.find((m) => String(m.mob_id) === req.params.id);
  if (!mvp) return res.status(404).json({ error: "MVP não encontrado" });
  res.json(mvp);
});

app.get("/api/mvps_info", (req, res) => {
  const mvpsInfo = loadJsonFile(MVP_INFO_PATH);
  res.json(mvpsInfo);
});

app.get("/api/mvps_info/:id", (req, res) => {
  const mvpsInfo = loadJsonFile(MVP_INFO_PATH);
  const mvp = mvpsInfo.find((m) => String(m.monster_id) === req.params.id);
  if (!mvp) return res.status(404).json({ error: "MVP não encontrado" });
  res.json(mvp);
});

// ✅ Inicializa servidor
app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});
