const express = require('express');
const router = express.Router();
const fetchService = require('../services/fetchService');
const puppeteerService = require('../services/puppeteerService');
const formService = require('../services/formService');

router.post('/clone', async (req, res) => {
  try {
    let { url, action = '/login', modifyAllForms = false, usePuppeteer = false, waitTime = 5000 } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }
    
    if (!url.startsWith('http')) url = 'https://' + url;
    
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid URL format' });
    }
    
    let html;
    let renderMethod = 'fetch';
    
    if (usePuppeteer) {
      renderMethod = 'puppeteer';
      html = await puppeteerService.fetchWithPuppeteer(url, waitTime);
    } else {
      try {
        html = await fetchService.fetchWebsite(url);
      } catch (fetchError) {
        console.log('Fetch failed, trying Puppeteer:', fetchError.message);
        renderMethod = 'puppeteer-fallback';
        html = await puppeteerService.fetchWithPuppeteer(url, waitTime);
      }
    }
    
    const result = formService.processForms(html, action, modifyAllForms);
    const formattedForms = result.forms.map(form => ({
      index: form.index,
      originalAction: form.originalAction,
      newAction: form.newAction,
      method: form.method,
      isLoginForm: form.isLoginForm,
      isDynamic: form.isDynamic || false,
      fields: form.fields || []
    }));
    
    res.json({
      success: true,
      originalUrl: url,
      action,
      html: result.html,
      forms: formattedForms,
      fileSize: result.html.length,
      renderMethod,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Clone error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/preview', async (req, res) => {
  try {
    let { url, action = '/login', modifyAllForms = false, usePuppeteer = false, waitTime = 5000 } = req.body;
    
    if (!url) {
      return res.render('index', { title: 'Website Login Page Cloner', error: 'URL is required', success: null });
    }
    
    if (!url.startsWith('http')) url = 'https://' + url;
    
    let html;
    if (usePuppeteer) {
      html = await puppeteerService.fetchWithPuppeteer(url, waitTime);
    } else {
      try {
        html = await fetchService.fetchWebsite(url);
      } catch {
        html = await puppeteerService.fetchWithPuppeteer(url, waitTime);
      }
    }
    
    const result = formService.processForms(html, action, modifyAllForms === 'on');
    res.send(result.html);
    
  } catch (error) {
    res.status(500).send(`
      <html><head><title>Error</title></head>
      <body style="font-family:Arial;padding:50px;text-align:center;background:#1e293b;color:white;">
        <h1 style="color:#ef4444;">Error</h1>
        <p>${error.message}</p>
        <a href="/" style="color:#10b981;">← Go Back</a>
      </body></html>
    `);
  }
});

router.post('/download', async (req, res) => {
  try {
    let { url, action = '/login', modifyAllForms = false, usePuppeteer = false, waitTime = 5000 } = req.body;
    
    if (!url) return res.redirect('/?error=' + encodeURIComponent('URL is required'));
    if (!url.startsWith('http')) url = 'https://' + url;
    
    let html;
    if (usePuppeteer) {
      html = await puppeteerService.fetchWithPuppeteer(url, waitTime);
    } else {
      try {
        html = await fetchService.fetchWebsite(url);
      } catch {
        html = await puppeteerService.fetchWithPuppeteer(url, waitTime);
      }
    }
    
    const result = formService.processForms(html, action, modifyAllForms === 'on');
    const domain = new URL(url).hostname.replace('www.', '');
    const filename = `cloned_${domain}_${Date.now()}.html`;
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(result.html);
    
  } catch (error) {
    res.redirect('/?error=' + encodeURIComponent(error.message));
  }
});

module.exports = router;
