(function themeDevPanel() {
  const isDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.search.includes('themeDev=1');

  if (!isDev) return;

  const root = document.documentElement;
  const storageKey = 'theme-dev-colors-v1';
  const vars = [
    ['--bg', 'Background'],
    ['--surface', 'Panel'],
    ['--ink', 'Text'],
    ['--muted', 'Muted'],
    ['--accent', 'Accent'],
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
    <h3>Theme Dev</h3>
    <p>Color controls for rapid panel/theme tuning.</p>
    <div class="dev-theme-controls"></div>
    <div class="dev-theme-actions">
      <button type="button" class="btn btn-muted" id="themeResetBtn">Reset</button>
    </div>
  `;

  const controlsWrap = panel.querySelector('.dev-theme-controls');
  const colors = {};

  vars.forEach(([name, label]) => {
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
