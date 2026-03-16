let clonedData = null;

const elements = {
  cloneForm: document.getElementById('cloneForm'),
  cloneBtn: document.getElementById('cloneBtn'),
  initialState: document.getElementById('initialState'),
  loadingState: document.getElementById('loadingState'),
  loadingText: document.getElementById('loadingText'),
  successState: document.getElementById('successState'),
  errorState: document.getElementById('errorState'),
  errorMessage: document.getElementById('errorMessage'),
  previewModal: document.getElementById('previewModal'),
  previewFrame: document.getElementById('previewFrame'),
  previewBtn: document.getElementById('previewBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  copyBtn: document.getElementById('copyBtn'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  openNewTabBtn: document.getElementById('openNewTabBtn'),
  waitTimeGroup: document.getElementById('waitTimeGroup')
};

function showState(state) {
  elements.initialState.style.display = state === 'initial' ? 'block' : 'none';
  elements.loadingState.style.display = state === 'loading' ? 'block' : 'none';
  elements.successState.style.display = state === 'success' ? 'block' : 'none';
  elements.errorState.style.display = state === 'error' ? 'block' : 'none';
}

document.querySelectorAll('input[name="renderMode"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    elements.waitTimeGroup.style.display = e.target.value === 'puppeteer' ? 'block' : 'none';
  });
});

document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const url = btn.dataset.url;
    const usePuppeteer = btn.dataset.puppeteer === 'true';
    document.getElementById('url').value = url;
    if (usePuppeteer) {
      document.querySelector('input[name="renderMode"][value="puppeteer"]').checked = true;
      elements.waitTimeGroup.style.display = 'block';
    } else {
      document.querySelector('input[name="renderMode"][value="auto"]').checked = true;
      elements.waitTimeGroup.style.display = 'none';
    }
  });
});

elements.cloneForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('url').value.trim();
  const action = document.getElementById('action').value.trim() || '/login';
  const modifyAllForms = document.getElementById('modifyAllForms').checked;
  const renderMode = document.querySelector('input[name="renderMode"]:checked').value;
  const waitTime = parseInt(document.getElementById('waitTime').value) || 5000;
  
  if (!url) {
    showState('error');
    elements.errorMessage.textContent = '❌ Please enter a URL';
    return;
  }
  
  showState('loading');
  elements.cloneBtn.disabled = true;
  elements.loadingText.textContent = renderMode === 'fetch' ? '⚡ Fetching website...' : '🚀 Rendering JavaScript... This may take up to 30 seconds...';
  elements.cloneBtn.textContent = '⏳ Cloning...';
  
  try {
    const response = await fetch('/clone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: url.startsWith('http') ? url : 'https://' + url,
        action,
        modifyAllForms,
        usePuppeteer: renderMode === 'puppeteer',
        waitTime
      })
    });
    const data = await response.json();
    
    if (data.success) {
      clonedData = data;
      updateSuccessUI(data);
      showState('success');
    } else {
      showState('error');
      elements.errorMessage.textContent = '❌ ' + (data.error || 'Failed to clone website');
    }
  } catch (err) {
    showState('error');
    elements.errorMessage.textContent = '❌ ' + err.message;
  } finally {
    elements.cloneBtn.disabled = false;
    elements.cloneBtn.textContent = '⚡ Clone Website';
  }
});

function updateSuccessUI(data) {
  document.getElementById('formsCount').textContent = data.forms.length;
  document.getElementById('fileSize').textContent = (data.fileSize / 1024).toFixed(1) + ' KB';
  
  const renderBadge = document.getElementById('renderMethodBadge');
  renderBadge.style.display = 'inline-block';
  renderBadge.className = 'render-method ' + data.renderMethod;
  const badges = {
    fetch: '⚡ Fetch Mode (Fast)',
    puppeteer: '🚀 Puppeteer Mode (JavaScript)',
    'puppeteer-fallback': '🔄 Fallback to Puppeteer'
  };
  renderBadge.textContent = badges[data.renderMethod] || '';
  
  const formsList = document.getElementById('formsList');
  formsList.innerHTML = '';
  
  if (data.forms.length > 0) {
    const title = document.createElement('h4');
    title.style.cssText = 'margin-bottom:1rem;color:white;font-weight:600;';
    title.textContent = '📝 Modified Forms';
    formsList.appendChild(title);
    
    data.forms.forEach(form => {
      const formItem = document.createElement('div');
      formItem.className = 'form-item';
      const fields = form.fields.map(f => f.name).filter(Boolean).join(', ') || 'none';
      const badge = form.isDynamic 
        ? '<span class="badge badge-dynamic">Dynamic Form</span>' 
        : form.isLoginForm ? '<span class="badge badge-outline">Login Form</span>' : '';
      
      formItem.innerHTML = `
        <div class="form-item-header">
          <span class="badge badge-primary">Form #${form.index}</span>
          ${badge}
        </div>
        <div class="form-item-info">
          <p>Original: <code class="code-red">${form.originalAction || '(none)'}</code></p>
          <p>New: <code class="code-green">${form.newAction}</code></p>
          <p>Method: ${form.method}</p>
          <p>Fields: ${fields}</p>
        </div>
      `;
      formsList.appendChild(formItem);
    });
  }
}

elements.previewBtn.addEventListener('click', () => {
  if (!clonedData) return;
  elements.previewFrame.srcdoc = clonedData.html;
  elements.previewModal.classList.add('active');
});

elements.closeModalBtn.addEventListener('click', () => {
  elements.previewModal.classList.remove('active');
});

elements.openNewTabBtn.addEventListener('click', () => {
  if (!clonedData) return;
  const blob = new Blob([clonedData.html], { type: 'text/html' });
  window.open(URL.createObjectURL(blob), '_blank');
});

elements.downloadBtn.addEventListener('click', () => {
  if (!clonedData) return;
  const blob = new Blob([clonedData.html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cloned_${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

elements.copyBtn.addEventListener('click', async () => {
  if (!clonedData) return;
  try {
    await navigator.clipboard.writeText(clonedData.html);
    const originalText = elements.copyBtn.textContent;
    elements.copyBtn.textContent = '✅ Copied!';
    setTimeout(() => { elements.copyBtn.textContent = originalText; }, 2000);
  } catch (err) {
    alert('Failed to copy to clipboard');
  }
});

elements.previewModal.addEventListener('click', (e) => {
  if (e.target === elements.previewModal) {
    elements.previewModal.classList.remove('active');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && elements.previewModal.classList.contains('active')) {
    elements.previewModal.classList.remove('active');
  }
});
