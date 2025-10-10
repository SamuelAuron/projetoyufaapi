import * as cheerio from "cheerio";
import { writeFileSync } from "fs";
import puppeteer from "puppeteer";

async function scrapePage(browser, pageNumber) {
  console.time(`⏳ Tempo para verificar a Página ${pageNumber}`);
  console.log(`🕷️ Lendo página ${pageNumber}...`);

  const page = await browser.newPage();

  try {
    await page.goto(`https://projetoyufa.com/rankings/mvp?page=${pageNumber}`, {
      waitUntil: "networkidle2",
    });

    const html = await page.content();
    const $ = cheerio.load(html);

    const results = [];

    const scriptContent = $("script")
      .map((i, el) => $(el).html())
      .get()
      .find((t) => t && t.includes("Lista dos top caçadores de MvP"));

    if (!scriptContent) {
      console.log("❌ Nenhum dado JSON encontrado.");
      await page.close();
      return [];
    }

    const match = scriptContent.match(/(\[\[.*\]\])/s);
    if (!match) {
      console.log("❌ Estrutura JSON não encontrada no script.");
      await page.close();
      return [];
    }

    const cleanJson = match[1].replace(/\\"/g, '"');
    const data = JSON.parse(cleanJson);

    for (let i = 0; i < data[1][3].children[2][3].children.length; i++) {
      results.push(data[1][3].children[2][3].children[i][3].character);
    }
    console.timeEnd(`⏳ Tempo para verificar a Página ${pageNumber}`);
    console.log(`✅ Página ${pageNumber} capturada com sucesso!`);
    await page.close();
    return results;
  } catch (err) {
    console.timeEnd(`⏳ Tempo para verificar a Página ${pageNumber}`);
    console.error(`❌ Erro na página ${pageNumber}:`, err.message);
    await page.close();
    return [];
  }
}

export async function runCrawler() {
  console.time(`⏳ Tempo de Execuçaõ total do bot `);
  console.log("🚀 Iniciando o crawler...");

  // 🔹 Abre o navegador uma única vez
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  let allData = [];

  for (let i = 1; i <= 10; i++) {
    const pageData = await scrapePage(browser, i);
    allData = allData.concat(pageData);
  }

  // 🔹 Fecha o navegador apenas no final
  await browser.close();

  console.log("✅ Coleta finalizada!");
  writeFileSync("killers_data.json", JSON.stringify(allData, null, 2));
  console.timeEnd(`⏳ Tempo de Execuçaõ total do bot `);
}