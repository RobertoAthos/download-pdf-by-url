// download-pdf.js
const { chromium } = require("playwright");

async function downloadPDF(url) {
  let downloadedFile = null;
  
  try {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      acceptDownloads: true, // necessário para capturar o download
    });
    const page = await context.newPage();

    // Escuta o evento de download
    page.on("download", async (download) => {
      const suggestedFilename = download.suggestedFilename();
      const filePath = `./${suggestedFilename}`;
      await download.saveAs(filePath);
      downloadedFile = {
        path: filePath,
        filename: suggestedFilename
      };
    });

    await page.goto(url, { waitUntil: "load" });

    // Aguarde alguns segundos para o PDF ser gerado e baixado
    await page.waitForTimeout(5000);

    await browser.close();

    if (downloadedFile) {
      return {
        success: true,
        path: downloadedFile.path,
        filename: downloadedFile.filename
      };
    } else {
      return {
        success: false,
        message: 'No PDF file was downloaded'
      };
    }
  } catch (error) {
    console.error('Error in downloadPDF:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

module.exports = downloadPDF;
