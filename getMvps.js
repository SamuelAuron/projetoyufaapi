import { writeFileSync } from "fs";
import axios from "axios";

const mvpList = [
  "1252", "1251", "1159", "1115", "1112", "1150", "1087", "1046", "1039",
  "1147", "1059", "1038", "1272", "1157", "1418", "1190", "1312", "1086",
  "1511", "1492", "1389"
];

async function fetchMvpData() {
  const result = []
 
  try {
    console.log("🔍 Buscando dados da API...");
    for (let i = 0; i < mvpList.length; i++) {
      const response = await axios.get(`https://ragnapi.com/api/v1/old-times/monsters/${mvpList[i]}`);
      console.log(response.data)
      result.push(response.data)
    }
    
    
    writeFileSync("mvps_data.json", JSON.stringify(result, null, 2));
    console.log("💾 Arquivo mvps.json criado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao buscar os dados:", error);
  }
    
}

fetchMvpData();
