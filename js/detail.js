const detailRoot = document.querySelector('#detailRoot');

const params = new URLSearchParams(window.location.search);
const vehicleId = params.get('id');
const DEFAULT_IMAGE = 'assets/default-image.svg';

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value || 0);

function statusClass(status) {
  return `status-${String(status || '').toLowerCase().replace(/\s+/g, '-')}`;
}

function renderNotFound() {
  detailRoot.innerHTML = `
    <section class="card" style="padding: 1rem;">
      <h1>Vehicle Not Found</h1>
      <p>The requested vehicle could not be located.</p>
      <a class="link-btn" href="inventory.html">Back to Inventory</a>
    </section>
  `;
}

function renderDetails(vehicle) {
  const features = Array.isArray(vehicle.features) ? vehicle.features.join(', ') : '-';
  const videoLink = vehicle.videoUrl
    ? `<p><a class="link-btn" href="${vehicle.videoUrl}" target="_blank" rel="noopener noreferrer">Open Vehicle Video</a></p>`
    : '';

  const images = (vehicle.images && vehicle.images.length ? vehicle.images : [DEFAULT_IMAGE]);

  detailRoot.innerHTML = `
    <section class="card detail-layout">
      <div class="gallery">
        <img class="main-image" src="${images[0]}" alt="${vehicle.year} ${vehicle.make} ${vehicle.model}" />
        <div class="thumb-row">
          ${images
      .slice(0, 3)
      .map((src, index) => `<img src="${src}" alt="${vehicle.make} ${vehicle.model} view ${index + 1}" />`)
      .join('')}
        </div>
      </div>

      <div class="detail-info">
        <p class="eyebrow">Vehicle Details</p>
        <h1>${vehicle.year} ${vehicle.make} ${vehicle.model}</h1>
        <p class="price">${formatMoney(vehicle.price)}</p>
        <p>${Number(vehicle.mileage || 0).toLocaleString()} miles</p>
        <span class="status ${statusClass(vehicle.status)}">${vehicle.status || 'Unknown'}</span>
        <p><strong>VIN:</strong> ${vehicle.vin || '-'}</p>
        <p><strong>Body:</strong> ${vehicle.bodyType || '-'} | <strong>Fuel:</strong> ${vehicle.fuelType || '-'} | <strong>Transmission:</strong> ${vehicle.transmission || '-'}</p>
        <p><strong>Features:</strong> ${features}</p>
        <p><a class="link-btn" href="${vehicle.historyReportUrl || '#'}" target="_blank" rel="noopener noreferrer">Vehicle History Report</a></p>
        ${videoLink}
        <div style="margin-top: 2rem;">
          <a class="btn" href="inquire.html?vehicle=${encodeURIComponent(vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model)}" style="width: 100%;">Inquire Now</a>
        </div>
      </div>
    </section>

    <section class="card detail-specs" style="margin-top:1rem;">
      <h2>Full Specifications</h2>
      <div class="spec-list" style="margin-top:0.8rem;">
        <div><strong>Engine</strong><br>${vehicle.specs?.engine || '-'}</div>
        <div><strong>Horsepower</strong><br>${vehicle.specs?.horsepower || '-'}</div>
        <div><strong>Drivetrain</strong><br>${vehicle.specs?.drivetrain || '-'}</div>
        <div><strong>Efficiency</strong><br>${vehicle.specs?.mpg || '-'}</div>
      </div>
    </section>
  `;
}

async function init() {
  if (!vehicleId) {
    renderNotFound();
    return;
  }

  try {
    const vehicles = await window.InventoryService.getVehicles();
    const vehicle = vehicles.find((item) => item.id === vehicleId);

    if (!vehicle) {
      renderNotFound();
      return;
    }

    renderDetails(vehicle);
  } catch (error) {
    detailRoot.innerHTML = '<section class="card" style="padding:1rem;"><p>Unable to load vehicle data.</p></section>';
    console.error(error);
  }
}

init();
