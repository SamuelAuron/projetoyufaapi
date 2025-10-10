import fs from "fs";
import path from "path";

const tmpDir = "/tmp"; // Diretório temporário do Render

const killersFile = path.join(tmpDir, "killers_data.json");
const mvpsFile = path.join(tmpDir, "mvp_kills_data.json");
const cacheFile = path.join(tmpDir, "killers_cache.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    console.error(`⚠️ Erro ao ler ${filePath}, retornando lista vazia.`);
    return [];
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`❌ Erro ao salvar ${filePath}:`, err.message);
  }
}

export function checkMvpChanges() {
  const oldData = readJson(cacheFile); // killers_cache
  const newData = readJson(killersFile); // killers_data 
  const mvpsData = readJson(mvpsFile); // mvp_kills_data

  let updates = [];

  for (const killer of newData) {
    const oldKiller = oldData.find(k => k.char_id === killer.char_id);
    if (!oldKiller) continue;

    console.log(`🧙‍♂️ Verificando ${killer.name}`);
    console.log(`💀 Kills atuais: ${killer.total_kills} | Antigos: ${oldKiller.total_kills}`);

    killer.mvp_kills.forEach(mvp => {
      const oldMvp = oldKiller.mvp_kills.find(m => m.mob_id === mvp.mob_id);
      if (!oldMvp) return;

      if (mvp.kills > oldMvp.kills) {
        const diff = mvp.kills - oldMvp.kills;
        const newEntry = {
          mob_id: mvp.mob_id,
          killer_name: killer.name,
          guild: killer.guild?.name || null,
          timestamp: new Date().toISOString(),
          diff
        };

        const existingIndex = mvpsData.findIndex(e => e.mob_id === mvp.mob_id);
        if (existingIndex >= 0) {
          mvpsData[existingIndex] = newEntry;
        } else {
          mvpsData.push(newEntry);
        }

        updates.push(newEntry);
      }
    });
  }

  if (updates.length > 0) {
    writeJson(cacheFile, newData);
    writeJson(mvpsFile, mvpsData);
    console.log(`✅ ${updates.length} MVPs atualizados em mvp_kills_data.json`);
  } else {
    console.log("⏳ Nenhuma alteração detectada.");
  }
}