import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

async function getMvpData() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://projetoyufa.com/rankings/mvp", {
    waitUntil: "networkidle2",
  });
    const html = await page.content();

    // Carrega o HTML com cheerio
    const $ = cheerio.load(html);

    // Encontra o script ou elemento que contém os dados JSON
    // (supondo que eles estão dentro de um <script> com '[[\"$\",\"$L1a\"...' no texto)
    const scriptContent = $("script")
      .map((i, el) => $(el).html())
      .get()
      .find((t) => t && t.includes('Lista dos top caçadores de MvP'));

    if (!scriptContent) {
      console.log("❌ Nenhum dado JSON encontrado.");
      return;
    }

    // Tenta extrair o JSON do texto (precisa limpar as barras invertidas)
    const match = scriptContent.match(/(\[\[.*\]\])/s);
    if (!match) {
      console.log("❌ Estrutura JSON não encontrada no script.");
      return;
    }

    // Limpa e parseia o JSON
    const cleanJson = match[1].replace(/\\"/g, '"');
    //console.log(cleanJson)
    const data = JSON.parse(cleanJson);

    console.log("✅ Dados capturados com sucesso!");
    console.log(data[1][3].children[2][3].children[0][3].character); // exemplo: primeiro personagem
    return
  } catch (error) {
    console.error("Erro ao obter dados:", error.message);
    return
  }
}

getMvpData();