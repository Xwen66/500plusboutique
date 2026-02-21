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

function bindGalleryInteractions() {
  const mainImage = detailRoot.querySelector('#mainVehicleImage');
  const thumbRow = detailRoot.querySelector('#thumbRow');
  const thumbButtons = [...detailRoot.querySelectorAll('.thumb-item')];
  const prevBtn = detailRoot.querySelector('#thumbPrevBtn');
  const nextBtn = detailRoot.querySelector('#thumbNextBtn');
  const lightbox = detailRoot.querySelector('#imageLightbox');
  const lightboxImage = detailRoot.querySelector('#lightboxImage');
  const lightboxClose = detailRoot.querySelector('#lightboxCloseBtn');

  function setMainImage(src, alt, selectedButton) {
    mainImage.src = src;
    mainImage.alt = alt;
    thumbButtons.forEach((btn) => btn.classList.remove('active'));
    if (selectedButton) selectedButton.classList.add('active');
  }

  thumbButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setMainImage(button.dataset.src, button.dataset.alt, button);
    });
  });

  if (prevBtn && thumbRow) {
    prevBtn.addEventListener('click', () => {
      thumbRow.scrollBy({ left: -220, behavior: 'smooth' });
    });
  }

  if (nextBtn && thumbRow) {
    nextBtn.addEventListener('click', () => {
      thumbRow.scrollBy({ left: 220, behavior: 'smooth' });
    });
  }

  if (mainImage && lightbox && lightboxImage) {
    mainImage.addEventListener('click', () => {
      lightboxImage.src = mainImage.src;
      lightboxImage.alt = mainImage.alt;
      lightbox.classList.remove('hidden');
    });
  }

  if (lightboxClose && lightbox) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.add('hidden');
    });

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        lightbox.classList.add('hidden');
      }
    });
  }
}

function renderDetails(vehicle) {
  const features = Array.isArray(vehicle.features) ? vehicle.features.join(', ') : '-';
  const videoLink = vehicle.videoUrl
    ? `<p><a class="link-btn" href="${vehicle.videoUrl}" target="_blank" rel="noopener noreferrer">Open Vehicle Video</a></p>`
    : '';

  const images = vehicle.images && vehicle.images.length ? vehicle.images : [DEFAULT_IMAGE];

  detailRoot.innerHTML = `
    <section class="card detail-layout">
      <div class="gallery">
        <div class="main-image-wrap">
          <img id="mainVehicleImage" class="main-image" src="${images[0]}" alt="${vehicle.year} ${vehicle.make} ${vehicle.model}" />
          <span class="main-image-hint">Click to enlarge</span>
        </div>

        <div class="thumb-gallery-wrap">
          <button id="thumbPrevBtn" class="thumb-nav" type="button" aria-label="Scroll thumbnails left">‹</button>
          <div id="thumbRow" class="thumb-row scrollable">
            ${images
      .map(
        (src, index) => `
                  <button class="thumb-item ${index === 0 ? 'active' : ''}" data-src="${src}" data-alt="${vehicle.make} ${vehicle.model} view ${index + 1}" type="button">
                    <img src="${src}" alt="${vehicle.make} ${vehicle.model} view ${index + 1}" />
                  </button>
                `
      )
      .join('')}
          </div>
          <button id="thumbNextBtn" class="thumb-nav" type="button" aria-label="Scroll thumbnails right">›</button>
        </div>
      </div>

      <div class="detail-info">
        <p class="eyebrow">Vehicle Details</p>
        <h1>${vehicle.year} ${vehicle.make} ${vehicle.model}</h1>
        <p class="price">${formatMoney(vehicle.price)}</p>
        <p>${Number(vehicle.mileage || 0).toLocaleString()} KM</p>
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

    <div id="imageLightbox" class="image-lightbox hidden" role="dialog" aria-modal="true" aria-label="Expanded vehicle image">
      <button id="lightboxCloseBtn" class="lightbox-close" type="button" aria-label="Close image preview">✕</button>
      <img id="lightboxImage" class="lightbox-image" src="" alt="Expanded vehicle image" />
    </div>
  `;

  bindGalleryInteractions();
}

async function init() {
  if (!vehicleId) {
    renderNotFound();
    return;
  }

  try {
    const vehicles = await window.InventoryService.getVehicles();
    const vehicle = vehicles.find((item) => item.id === vehicleId);

    if (!vehicle || vehicle.isDisplayed === false) {
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
