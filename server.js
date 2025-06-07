const http = require('http');
const url = require('url');
const fs = require('fs');
const downloadPDF = require('./download-pdf');


function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}


const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/download' && req.method === 'GET') {
    const targetUrl = parsedUrl.query.url;
    
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'URL parameter is required',
        usage: 'GET /download?url=https://example.com'
      }));
      return;
    }

    if (!isValidUrl(targetUrl)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Invalid URL provided',
        providedUrl: targetUrl      }));
      return;
    }
    
    try {
      console.log(`Starting PDF download for: ${targetUrl}`);
      const result = await downloadPDF(targetUrl);
      
      if (result.success && result.path) {
        if (fs.existsSync(result.path)) {
          const pdfBuffer = fs.readFileSync(result.path);
          
          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `attachment; filename="${result.filename}"`
          });
          
          res.end(pdfBuffer);
          
          fs.unlinkSync(result.path);
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Downloaded file not found',
            details: `File ${result.path} does not exist`
          }));
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'No PDF was downloaded',
          details: result.message || 'Unknown error'
        }));
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Failed to download PDF',
        details: error.message
      }));
    }
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`PDF Download Server running on http://localhost:${PORT}`);
});
