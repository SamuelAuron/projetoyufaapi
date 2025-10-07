import * as cheerio from "cheerio";
import { writeFileSync } from "fs";
import puppeteer from "puppeteer";

async function scrapePage(page) {
  console.log(`🕷️ Lendo página ${page}...`);

  try {
    
    const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
    const pageRank = await browser.newPage();
    await pageRank.goto(`https://projetoyufa.com/rankings/mvp`, {
    waitUntil: "networkidle2",
  });
    const html = await pageRank.content();

    // Carrega o HTML com cheerio
    const $ = cheerio.load(html);
    
    

    // Ajuste o seletor de acordo com a estrutura real da página
    const results = [];

    const scriptContent = $("script")
      .map((i, el) => $(el).html())
      .get()
      .find((t) => t && t.includes('Lista dos top caçadores de MvP'));

    if (!scriptContent) {
      console.log("❌ Nenhum dado JSON encontrado.");
      return;
    }

    const match = scriptContent.match(/(\[\[.*\]\])/s);
    if (!match) {
      console.log("❌ Estrutura JSON não encontrada no script.");
      return;
    }

    // Limpa e parseia o JSON
    const cleanJson = match[1].replace(/\\"/g, '"');
    const data = JSON.parse(cleanJson);

    console.log("✅ Dados capturados com sucesso!");
    for (let i = 0; i < data[1][3].children[2][3].children.length ; i++) {
      results.push(data[1][3].children[2][3].children[i][3].character)
    }

    return results;
  } catch (err) {
    console.error(`Erro na página ${page}:`, err.message);
    return [];
  }
}



export async function runCrawler() {
  let allData = [];

  for (let i = 1; i < 2; i++) {
    const pageData = await scrapePage(i);
    allData = allData.concat(pageData);
  }

  console.log("✅ Coleta finalizada!");

  //Caso queira salvar em arquivo JSON
  
  writeFileSync("killers_data.json", JSON.stringify(allData, null, 2));
}


//runCrawler();