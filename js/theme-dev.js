(function themeDevPanel() {
  // Temporary switch: keep file loaded but disable panel rendering.
  const DEV_PANEL_ENABLED = false;
  if (!DEV_PANEL_ENABLED) return;
  const root = document.documentElement;
  const storageKey = 'theme-dev-colors-v6';
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const pageHint = {
    'index.html': ['index', 'inventory-like'],
    'inventory.html': ['inventory-like'],
    'vehicle.html': ['inventory-like', 'vehicle-detail'],
    'inquire.html': ['inquire']
  }[currentPage] || [];

  const catalog = [
    { name: '--bg-main', label: 'Page Bg', always: true },
    { name: '--bg-surface', label: 'Card Bg', always: true },
    { name: '--header-bg', label: 'Header Bg', always: true },
    { name: '--text-primary', label: 'Text', always: true },
    { name: '--text-muted', label: 'Muted Text', always: true },
    { name: '--brand-navy', label: 'Primary', always: true },
    { name: '--brand-accent', label: 'Accent', always: true },
    { name: '--border', label: 'Border', always: true },
    { name: '--dev-panel-bg', label: 'Theme Panel Bg', always: true },

    { name: '--label-text', label: 'Label Text', selectors: ['label'] },
    { name: '--link-border', label: 'Link Border', selectors: ['.link-btn'] },
    { name: '--spec-divider', label: 'Spec Divider', selectors: ['.spec-list'] },
    { name: '--btn-muted-bg', label: 'Muted Btn Bg', selectors: ['.btn-muted'] },
    { name: '--btn-muted-text', label: 'Muted Btn Text', selectors: ['.btn-muted'] },
    { name: '--btn-danger-bg', label: 'Danger Btn Bg', selectors: ['.btn-danger'] },
    { name: '--btn-danger-text', label: 'Danger Btn Text', selectors: ['.btn-danger'] },

    { name: '--status-available-bg', label: 'Available Bg', tags: ['inventory-like'] },
    { name: '--status-available-text', label: 'Available Text', tags: ['inventory-like'] },
    { name: '--status-sold-bg', label: 'Sold Bg', tags: ['inventory-like'] },
    { name: '--status-sold-text', label: 'Sold Text', tags: ['inventory-like'] },
    { name: '--status-reserved-bg', label: 'Reserved Bg', tags: ['inventory-like'] },
    { name: '--status-reserved-text', label: 'Reserved Text', tags: ['inventory-like'] },
    { name: '--status-coming-bg', label: 'Coming Bg', tags: ['inventory-like'] },
    { name: '--status-coming-text', label: 'Coming Text', tags: ['inventory-like'] },

    { name: '--modal-overlay-bg', label: 'Modal Overlay', tags: ['inquire'], selectors: ['.modal-overlay'] },
    { name: '--main-image-hint-bg', label: 'Image Hint Bg', tags: ['vehicle-detail'], selectors: ['.main-image-hint'] },
    { name: '--main-image-hint-text', label: 'Image Hint Text', tags: ['vehicle-detail'], selectors: ['.main-image-hint'] },
    { name: '--thumb-nav-bg', label: 'Thumb Nav Bg', tags: ['vehicle-detail'], selectors: ['.thumb-nav'] },
    { name: '--lightbox-overlay-bg', label: 'Lightbox Overlay', tags: ['vehicle-detail'], selectors: ['.image-lightbox'] },
    { name: '--lightbox-close-bg', label: 'Lightbox Close', tags: ['vehicle-detail'], selectors: ['.lightbox-close'] }
  ];

  function shouldShowItem(item) {
    if (item.always) return true;
    const tagMatch = Array.isArray(item.tags) && item.tags.some((tag) => pageHint.includes(tag));
    const selectorMatch = Array.isArray(item.selectors) && item.selectors.some((sel) => document.querySelector(sel));
    return Boolean(tagMatch || selectorMatch);
  }

  const selectedVars = catalog
    .filter(shouldShowItem)
    .map((item) => [item.name, item.label])
    .sort((a, b) => a[1].localeCompare(b[1]));

  function rgbToHex(rgb) {
    const cleaned = String(rgb || '').replace(/\s+/g, '');
    const rgba = cleaned.match(/^rgba?\((\d+),(\d+),(\d+)/i);
    if (!rgba) return rgb;
    const [r, g, b] = rgba.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, '0'));
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
    });
  }

  const defaultColors = {};
  selectedVars.forEach(([name]) => {
    defaultColors[name] = getColorValue(name);
  });

  let savedColors = {};
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      savedColors = JSON.parse(saved) || {};
      applyColors(savedColors);
    } catch (_) {
      localStorage.removeItem(storageKey);
      savedColors = {};
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
      <p>Colors for ${currentPage}.</p>
      <div class="dev-theme-controls"></div>
      <div class="dev-theme-actions">
        <button type="button" class="btn btn-muted" id="themeResetBtn">Reset</button>
      </div>
    </div>
  `;

  panel.querySelector('.dev-theme-header').addEventListener('click', () => {
    const body = panel.querySelector('#themePanelBody');
    const icon = panel.querySelector('#themeToggleIcon');
    const isClosed = body.style.display === 'none';
    body.style.display = isClosed ? 'block' : 'none';
    icon.textContent = isClosed ? '-' : '+';
  });

  const controlsWrap = panel.querySelector('.dev-theme-controls');
  const colors = { ...savedColors };
  const inputsByVar = {};

  function persistColors() {
    localStorage.setItem(storageKey, JSON.stringify(colors));
  }

  selectedVars.forEach(([name, label]) => {
    const value = getColorValue(name);
    colors[name] = value;

    const row = document.createElement('div');
    row.className = 'dev-theme-row';
    row.innerHTML = `
      <span class="dev-theme-label">${label}</span>
      <div class="dev-theme-row-controls">
        <input type="color" data-var="${name}" value="${value}" />
        <button type="button" class="dev-theme-row-reset" data-var="${name}">Reset</button>
      </div>
    `;
    controlsWrap.appendChild(row);

    const input = row.querySelector('input[type="color"]');
    if (input) inputsByVar[name] = input;
  });

  controlsWrap.querySelectorAll('input[type="color"]').forEach((input) => {
    input.addEventListener('input', () => {
      const varName = input.dataset.var;
      colors[varName] = input.value;
      root.style.setProperty(varName, input.value);
      persistColors();
    });
  });

  controlsWrap.querySelectorAll('button.dev-theme-row-reset').forEach((button) => {
    button.addEventListener('click', () => {
      const varName = button.dataset.var;
      const defaultValue = defaultColors[varName] || '#ffffff';
      colors[varName] = defaultValue;
      root.style.setProperty(varName, defaultValue);
      if (inputsByVar[varName]) inputsByVar[varName].value = defaultValue;
      persistColors();
    });
  });

  panel.querySelector('#themeResetBtn').addEventListener('click', () => {
    localStorage.removeItem(storageKey);
    window.location.reload();
  });

  document.body.appendChild(panel);
})();
