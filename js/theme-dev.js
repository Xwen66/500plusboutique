(function themeDevPanel() {
  // Always active during frontend design phase
  const root = document.documentElement;
  const storageKey = 'theme-dev-colors-v4';
  const vars = [
    ['--bg-main', 'Background'],
    ['--bg-surface', 'Panel'],
    ['--text-primary', 'Text'],
    ['--text-muted', 'Muted'],
    ['--brand-navy', 'Navy'],
    ['--brand-accent', 'Accent'],
    ['--border', 'Border']
  ];

  function rgbToHex(rgb) {
    const match = rgb.replace(/\s+/g, '').match(/^rgb\((\d+),(\d+),(\d+)\)$/i);
    if (!match) return rgb;
    const [r, g, b] = match.slice(1).map((n) => Number(n).toString(16).padStart(2, '0'));
    return `#${r}${g}${b}`;
  }

  function getColorValue(varName) {
    const value = getComputedStyle(root).getPropertyValue(varName).trim();
    if (!value) return '#ffffff';
    if (value.startsWith('#')) return value;
    if (value.startsWith('rgb')) return rgbToHex(value);
    return '#ffffff';
  }

  function applyColors(colors) {
    Object.entries(colors).forEach(([name, value]) => {
      root.style.setProperty(name, value);
      if (name === '--brand-navy') root.style.setProperty('--btn-bg', value);
    });
  }

  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      applyColors(JSON.parse(saved));
    } catch (_) {
      localStorage.removeItem(storageKey);
    }
  }

  const panel = document.createElement('aside');
  panel.className = 'dev-theme-panel';
  panel.innerHTML = `
    <div class="dev-theme-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
      <h3 style="margin: 0;">Theme Dev</h3>
      <span id="themeToggleIcon" style="font-size: 1.5rem; line-height: 1;">+</span>
    </div>
    <div id="themePanelBody" style="display: none; margin-top: 1rem;">
      <p>Color controls for rapid layout tuning.</p>
      <div class="dev-theme-controls"></div>
      <div class="dev-theme-actions">
        <button type="button" class="btn btn-muted" id="themeResetBtn">Reset</button>
      </div>
    </div>
  `;
  
  panel.querySelector('.dev-theme-header').addEventListener('click', () => {
    const body = panel.querySelector('#themePanelBody');
    const icon = panel.querySelector('#themeToggleIcon');
    if (body.style.display === 'none') {
      body.style.display = 'block';
      icon.textContent = '-';
    } else {
      body.style.display = 'none';
      icon.textContent = '+';
    }
  });

  const controlsWrap = panel.querySelector('.dev-theme-controls');
  const colors = {};

  vars.forEach(([name, label]) => {
    // delay grabbing initial value until element styles resolve if needed, but synchronous is usually fine
    const value = getColorValue(name);
    colors[name] = value;

    const row = document.createElement('label');
    row.className = 'dev-theme-row';
    row.innerHTML = `<span>${label}</span><input type="color" data-var="${name}" value="${value}" />`;
    controlsWrap.appendChild(row);
  });

  controlsWrap.querySelectorAll('input[type="color"]').forEach((input) => {
    input.addEventListener('input', () => {
      colors[input.dataset.var] = input.value;
      applyColors(colors);
      localStorage.setItem(storageKey, JSON.stringify(colors));
    });
  });

  panel.querySelector('#themeResetBtn').addEventListener('click', () => {
    localStorage.removeItem(storageKey);
    window.location.reload();
  });

  document.body.appendChild(panel);
})();
