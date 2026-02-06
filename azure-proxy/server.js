#!/usr/bin/env node
/**
 * Azure OpenAI Proxy for OpenClaw
 * 
 * PROBLEM:
 * OpenClaw appends `/chat/completions` to the provider's baseUrl.
 * Azure OpenAI requires `?api-version=YYYY-MM-DD` as a query parameter.
 * When baseUrl contains query params, the appended path breaks the URL.
 * 
 * SOLUTION:
 * This lightweight proxy sits between OpenClaw and Azure OpenAI,
 * forwarding requests with the correct api-version query parameter.
 * 
 * USAGE:
 * 1. Configure your Azure endpoint, deployment, and API version below
 * 2. Run: node server.js
 * 3. Point OpenClaw provider baseUrl to: http://127.0.0.1:18790
 * 
 * @author Clawfinger
 * @license MIT
 */

const http = require('http');
const https = require('https');

// ╔════════════════════════════════════════════════════════════════╗
// ║                      CONFIGURATION                              ║
// ╚════════════════════════════════════════════════════════════════╝

const config = {
  // Local proxy settings
  port: parseInt(process.env.AZURE_PROXY_PORT || '18790'),
  bind: process.env.AZURE_PROXY_BIND || '127.0.0.1',
  
  // Azure OpenAI settings
  azure: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'YOUR_RESOURCE.openai.azure.com',
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2025-01-01-preview'
  }
};

// ╔════════════════════════════════════════════════════════════════╗
// ║                        PROXY SERVER                             ║
// ╚════════════════════════════════════════════════════════════════╝

const server = http.createServer((req, res) => {
  // Health check endpoint
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', deployment: config.azure.deployment }));
    return;
  }

  // Only handle POST to /chat/completions (or paths containing it)
  if (req.method !== 'POST' || !req.url.includes('/chat/completions')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Not found',
      hint: 'This proxy only handles POST /chat/completions'
    }));
    return;
  }

  // Collect request body
  let body = '';
  req.on('data', chunk => { body += chunk; });
  
  req.on('end', () => {
    const azurePath = `/openai/deployments/${config.azure.deployment}/chat/completions?api-version=${config.azure.apiVersion}`;
    
    // Extract API key from headers (OpenClaw sends it as api-key or Authorization: Bearer)
    const apiKey = req.headers['api-key'] || 
                   req.headers['authorization']?.replace('Bearer ', '') ||
                   '';

    const options = {
      hostname: config.azure.endpoint,
      port: 443,
      path: azurePath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] → Azure: ${config.azure.deployment}`);

    const proxyReq = https.request(options, (proxyRes) => {
      // Log response status
      const status = proxyRes.statusCode >= 400 ? '❌' : '✓';
      console.log(`[${timestamp}] ${status} ${proxyRes.statusCode}`);
      
      // Forward response headers and body
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error(`[${timestamp}] ✗ Error: ${err.message}`);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Bad Gateway', 
        message: err.message,
        target: config.azure.endpoint
      }));
    });

    proxyReq.write(body);
    proxyReq.end();
  });

  req.on('error', (err) => {
    console.error('Request error:', err.message);
  });
});

// ╔════════════════════════════════════════════════════════════════╗
// ║                          STARTUP                                ║
// ╚════════════════════════════════════════════════════════════════╝

server.listen(config.port, config.bind, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║         🚀 Azure OpenAI Proxy for OpenClaw               ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Proxy:      http://${config.bind}:${config.port}`.padEnd(59) + '║');
  console.log(`║  Deployment: ${config.azure.deployment}`.padEnd(59) + '║');
  console.log(`║  API Ver:    ${config.azure.apiVersion}`.padEnd(59) + '║');
  console.log(`║  Target:     ${config.azure.endpoint}`.padEnd(59) + '║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Interrupted, shutting down...');
  server.close(() => process.exit(0));
});
