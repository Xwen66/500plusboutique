const homeVehicleGrid = document.querySelector('#homeVehicleGrid');
const DEFAULT_IMAGE = 'assets/default-image.svg';

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value || 0);

function statusClass(status) {
  return `status-${String(status || '').toLowerCase().replace(/\\s+/g, '-')}`;
}

function orderValue(vehicle) {
  return Number.isFinite(Number(vehicle.displayOrder)) ? Number(vehicle.displayOrder) : Number.MAX_SAFE_INTEGER;
}

function renderFeatured(list) {
  if (!homeVehicleGrid) return;

  if (!list.length) {
    homeVehicleGrid.innerHTML = '<p class="card" style="padding:1rem;">No featured vehicles available right now.</p>';
    return;
  }

  homeVehicleGrid.innerHTML = list
    .map(
      (vehicle) => `
      <article class="vehicle-card card">
        <img src="${vehicle.images?.[0] || DEFAULT_IMAGE}" alt="${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}" loading="lazy" />
        <div class="vehicle-card-content">
          <div class="vehicle-title">
            <span>${vehicle.year || '-'} ${vehicle.make || '-'} ${vehicle.model || ''}</span>
          </div>
          <div class="price">${formatMoney(vehicle.price)}</div>
          <div class="specs">
            <span>${Number(vehicle.mileage || 0).toLocaleString()} mi</span>
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
}

async function initFeatured() {
  if (!homeVehicleGrid || !window.InventoryService) return;

  try {
    const vehicles = await window.InventoryService.getVehicles();
    const featured = [...vehicles]
      .filter((v) => v.isDisplayed !== false)
      .sort((a, b) => {
        const byOrder = orderValue(a) - orderValue(b);
        if (byOrder !== 0) return byOrder;
        return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
      })
      .slice(0, 3);

    renderFeatured(featured);
  } catch (error) {
    console.error(error);
    homeVehicleGrid.innerHTML = '<p class="card" style="padding:1rem;">Unable to load featured vehicles.</p>';
  }
}

initFeatured();
