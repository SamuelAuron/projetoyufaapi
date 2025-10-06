import fs from "fs";
import path from "path";

const killersFile = path.resolve("killers_data.json");
const mvpsFile = path.resolve("mvp_kills_data.json");
const cacheFile = path.resolve("killers_cache.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function checkMvpChanges() {
  const oldData = readJson(cacheFile); //killers_cache
  const newData = readJson(killersFile); //killers_data 
  const mvpsData = readJson(mvpsFile); //mvp_kills_data

  let updates = [];

  for (const killer of newData) {
    const oldKiller = oldData.find(k => k.char_id === killer.char_id);
    if (!oldKiller) continue;
    console.log(killer.name)
    console.log(`Quantidade de mvps mortos atual ${killer.total_kills} vs Quantidade de mvps antigos = ${oldKiller.total_kills}`)
    
    console.log("Entrou para contar qual mvp foi morto")
    killer.mvp_kills.forEach(mvp => {
      const oldMvp = oldKiller.mvp_kills.find(m => m.mob_id === mvp.mob_id);
      if (!oldMvp) return;
      
      // Detectou aumento de kills
      if (mvp.kills > oldMvp.kills) {
        const diff = mvp.kills - oldMvp.kills;

        const newEntry = {
          mob_id: mvp.mob_id,
          killer_name: killer.name,
          guild: killer.guild?.name || null,
          timestamp: new Date().toISOString()
        };

        // Verifica se já existe esse mob_id no arquivo
        const existingIndex = mvpsData.findIndex(e => e.mob_id === mvp.mob_id);

        if (existingIndex >= 0) {
          // ✅ Atualiza o registro existente
          mvpsData[existingIndex] = newEntry;
        } else {
          // ✅ Adiciona novo se ainda não existir
          mvpsData.push(newEntry);
        }

        updates.push(newEntry);
      }
    });
  }

  // Salva cache atualizado
  //writeJson(cacheFile, oldData);

  // Se houve atualizações, grava o arquivo
  if (updates.length > 0) {
    writeJson(cacheFile, newData);
    writeJson(mvpsFile, mvpsData);
    console.log(`✅ ${updates.length} MVPs atualizados em mvp_kills_data.json`);
  } else {
    console.log("⏳ Nenhuma alteração detectada.");
  }
}

//checkMvpChanges();