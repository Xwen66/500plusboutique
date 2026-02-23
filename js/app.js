const vehicleGrid = document.querySelector('#vehicleGrid');
const resultCount = document.querySelector('#resultCount');
const sortSelect = document.querySelector('#sortSelect');

const controls = {
  searchInput: document.querySelector('#searchInput'),
  makeFilter: document.querySelector('#makeFilter'),
  modelFilter: document.querySelector('#modelFilter'),
  bodyFilter: document.querySelector('#bodyFilter'),
  fuelFilter: document.querySelector('#fuelFilter'),
  transmissionFilter: document.querySelector('#transmissionFilter'),
  statusFilter: document.querySelector('#statusFilter'),
  yearMin: document.querySelector('#yearMin'),
  priceMax: document.querySelector('#priceMax'),
  mileageMax: document.querySelector('#mileageMax'),
  clearFilters: document.querySelector('#clearFilters')
};

const DEFAULT_IMAGE = 'assets/default-image.svg';
let vehicles = [];

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value || 0);

function statusClass(status) {
  return `status-${String(status || '').toLowerCase().replace(/\s+/g, '-')}`;
}

function displayOrderValue(vehicle) {
  return Number.isFinite(Number(vehicle.displayOrder)) ? Number(vehicle.displayOrder) : Number.MAX_SAFE_INTEGER;
}

function primaryImage(vehicle) {
  return vehicle.images?.[0] || DEFAULT_IMAGE;
}

function renderCards(list) {
  if (!list.length) {
    vehicleGrid.innerHTML = '<p class="card" style="padding:1rem;">No vehicles match your current filters.</p>';
    resultCount.textContent = '0 vehicles listed';
    return;
  }

  vehicleGrid.innerHTML = list
    .map(
      (vehicle) => `
      <article class="vehicle-card card">
        <a href="vehicle.html?id=${vehicle.id}" aria-label="View ${vehicle.year} ${vehicle.make} ${vehicle.model} details">
          <img src="${primaryImage(vehicle)}" alt="${vehicle.year} ${vehicle.make} ${vehicle.model}" loading="lazy" />
        </a>
        <div class="vehicle-card-content">
          <div class="vehicle-title">
            <span>${vehicle.year} ${vehicle.make} ${vehicle.model}</span>
          </div>
          <div class="price">${formatMoney(vehicle.price)}</div>
          <div class="specs">
            <span>${Number(vehicle.mileage || 0).toLocaleString()} KM</span>
            <span>${vehicle.bodyType || '-'}</span>
            <span>${vehicle.fuelType || '-'}</span>
            <span>${vehicle.transmission || '-'}</span>
          </div>
          <span class="status ${statusClass(vehicle.status)}">${vehicle.status || 'Unknown'}</span>
          <a class="link-btn" href="vehicle.html?id=${vehicle.id}">View Details</a>
        </div>
      </article>
    `
    )
    .join('');

  resultCount.textContent = `${list.length} vehicle${list.length === 1 ? '' : 's'} listed`;
}

function populateOptions() {
  const makes = [...new Set(vehicles.map((v) => v.make).filter(Boolean))].sort();
  controls.makeFilter.innerHTML = '<option value="">Any</option>' + makes.map((make) => `<option>${make}</option>`).join('');
  updateModelOptions();
}

function updateModelOptions() {
  const selectedMake = controls.makeFilter.value;
  const models = [
    ...new Set(
      vehicles
        .filter((v) => !selectedMake || v.make === selectedMake)
        .map((v) => v.model)
        .filter(Boolean)
    )
  ].sort();
  const current = controls.modelFilter.value;
  controls.modelFilter.innerHTML = '<option value="">Any</option>' + models.map((model) => `<option>${model}</option>`).join('');
  if (models.includes(current)) controls.modelFilter.value = current;
}

function applyFilters(list) {
  const query = controls.searchInput.value.trim().toLowerCase();
  const minYear = Number(controls.yearMin.value) || 0;
  const maxPrice = Number(controls.priceMax.value) || Number.MAX_SAFE_INTEGER;
  const maxMileage = Number(controls.mileageMax.value) || Number.MAX_SAFE_INTEGER;

  return list.filter((vehicle) => {
    if (vehicle.isDisplayed === false) return false;

    const searchable = `${vehicle.make || ''} ${vehicle.model || ''}`.toLowerCase();

    if (query && !searchable.includes(query)) return false;
    if (controls.makeFilter.value && vehicle.make !== controls.makeFilter.value) return false;
    if (controls.modelFilter.value && vehicle.model !== controls.modelFilter.value) return false;
    if (controls.bodyFilter.value && vehicle.bodyType !== controls.bodyFilter.value) return false;
    if (controls.fuelFilter.value && vehicle.fuelType !== controls.fuelFilter.value) return false;
    if (controls.transmissionFilter.value && vehicle.transmission !== controls.transmissionFilter.value) return false;
    if (controls.statusFilter.value && vehicle.status !== controls.statusFilter.value) return false;
    if (Number(vehicle.year || 0) < minYear) return false;
    if (Number(vehicle.price || 0) > maxPrice) return false;
    if (Number(vehicle.mileage || 0) > maxMileage) return false;

    return true;
  });
}

function applySort(list) {
  const sorted = [...list];
  switch (sortSelect.value) {
    case 'price-asc':
      sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      break;
    case 'year-desc':
      sorted.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
      break;
    case 'mileage-asc':
      sorted.sort((a, b) => Number(a.mileage || 0) - Number(b.mileage || 0));
      break;
    case 'popularity':
      sorted.sort((a, b) => Number(b.popularityScore || 0) - Number(a.popularityScore || 0));
      break;
    case 'newest':
      sorted.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
      break;
    case 'listing-order':
    default:
      sorted.sort((a, b) => {
        const byOrder = displayOrderValue(a) - displayOrderValue(b);
        if (byOrder !== 0) return byOrder;
        return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
      });
  }
  return sorted;
}

function refresh() {
  const filtered = applyFilters(vehicles);
  const sorted = applySort(filtered);
  renderCards(sorted);
}

function bindEvents() {
  Object.values(controls).forEach((control) => {
    if (control && control !== controls.clearFilters) {
      control.addEventListener('input', refresh);
      control.addEventListener('change', refresh);
    }
  });

  controls.makeFilter.addEventListener('change', () => {
    updateModelOptions();
    refresh();
  });

  controls.clearFilters.addEventListener('click', () => {
    Object.entries(controls).forEach(([key, control]) => {
      if (!control || key === 'clearFilters') return;
      if (control.tagName === 'SELECT') control.value = '';
      if (control.tagName === 'INPUT') control.value = '';
    });
    sortSelect.value = 'listing-order';
    updateModelOptions();
    refresh();
  });

  sortSelect.addEventListener('change', refresh);
}

async function init() {
  try {
    vehicles = await window.InventoryService.getVehicles();
    populateOptions();
    bindEvents();
    refresh();
  } catch (error) {
    resultCount.textContent = 'Could not load inventory data.';
    vehicleGrid.innerHTML = '<p class="card" style="padding:1rem;">Check Firebase configuration or local data file.</p>';
    console.error(error);
  }
}

init();
