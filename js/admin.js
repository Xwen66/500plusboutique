const authNotice = document.querySelector('#authNotice');
const authSection = document.querySelector('#authSection');
const portalSection = document.querySelector('#portalSection');

const loginForm = document.querySelector('#loginForm');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const signOutButton = document.querySelector('#signOutBtn');

const vehicleForm = document.querySelector('#vehicleForm');
const inventoryTableBody = document.querySelector('#inventoryTableBody');
const inquiryTableBody = document.querySelector('#inquiryTableBody');
const adminMessage = document.querySelector('#adminMessage');

const editingVehicleIdInput = document.querySelector('#editingVehicleId');
const displayOrderInput = document.querySelector('#displayOrder');
const cancelEditBtn = document.querySelector('#cancelEditBtn');
const formTitle = document.querySelector('#formTitle');
const submitBtn = document.querySelector('#submitBtn');

const DEFAULT_IMAGE = 'assets/default-image.svg';
let vehicles = [];

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value || 0);

function orderValue(vehicle, fallback = Number.MAX_SAFE_INTEGER) {
  return Number.isFinite(Number(vehicle.displayOrder)) ? Number(vehicle.displayOrder) : fallback;
}

function sortVehiclesByOrder(list) {
  return [...list].sort((a, b) => {
    const diff = orderValue(a) - orderValue(b);
    if (diff !== 0) return diff;
    return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
  });
}

function setMessage(text, isError = false) {
  adminMessage.textContent = text;
  adminMessage.className = isError ? 'admin-message error' : 'admin-message';
}

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function toOptionalNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function clearFormToAddMode() {
  editingVehicleIdInput.value = '';
  formTitle.textContent = 'Add Vehicle';
  submitBtn.textContent = 'Add Vehicle';
  cancelEditBtn.classList.add('hidden');
  vehicleForm.reset();
}

function fillFormForEdit(vehicle) {
  editingVehicleIdInput.value = vehicle.id;
  formTitle.textContent = 'Edit Vehicle';
  submitBtn.textContent = 'Save Changes';
  cancelEditBtn.classList.remove('hidden');

  displayOrderInput.value = Number.isFinite(Number(vehicle.displayOrder)) ? Number(vehicle.displayOrder) : '';
  vehicleForm.make.value = vehicle.make || '';
  vehicleForm.model.value = vehicle.model || '';
  vehicleForm.year.value = vehicle.year || '';
  vehicleForm.price.value = vehicle.price || '';
  vehicleForm.mileage.value = vehicle.mileage || '';
  vehicleForm.bodyType.value = vehicle.bodyType || '';
  vehicleForm.fuelType.value = vehicle.fuelType || '';
  vehicleForm.transmission.value = vehicle.transmission || '';
  vehicleForm.status.value = vehicle.status || '';
  vehicleForm.vin.value = vehicle.vin || '';
  vehicleForm.historyReportUrl.value = vehicle.historyReportUrl || '';
  vehicleForm.videoUrl.value = vehicle.videoUrl || '';
  vehicleForm.features.value = Array.isArray(vehicle.features) ? vehicle.features.join(', ') : '';
  vehicleForm.engine.value = vehicle.specs?.engine || '';
  vehicleForm.horsepower.value = vehicle.specs?.horsepower || '';
  vehicleForm.drivetrain.value = vehicle.specs?.drivetrain || '';
  vehicleForm.mpg.value = vehicle.specs?.mpg || '';
}

function renderInventoryTable() {
  const ordered = sortVehiclesByOrder(vehicles).map((vehicle, index) => ({
    ...vehicle,
    effectiveOrder: orderValue(vehicle, index + 1)
  }));

  inventoryTableBody.innerHTML = ordered
    .map(
      (vehicle) => `
      <tr class="admin-row" data-id="${vehicle.id}">
        <td>${vehicle.effectiveOrder}</td>
        <td>${vehicle.year || '-'}</td>
        <td>${vehicle.make || '-'} ${vehicle.model || ''}</td>
        <td>${formatMoney(vehicle.price)}</td>
        <td>${vehicle.status || '-'}</td>
        <td class="admin-action-cell">
          <button class="btn btn-muted btn-small" data-action="edit" data-id="${vehicle.id}" type="button">Edit</button>
          <button class="btn btn-muted btn-small" data-action="up" data-id="${vehicle.id}" type="button">Up</button>
          <button class="btn btn-muted btn-small" data-action="down" data-id="${vehicle.id}" type="button">Down</button>
          <button class="btn btn-danger btn-small" data-action="remove" data-id="${vehicle.id}" type="button">Remove</button>
        </td>
      </tr>
    `
    )
    .join('');

  inventoryTableBody.querySelectorAll('tr.admin-row').forEach((row) => {
    row.addEventListener('click', (event) => {
      if (event.target.closest('button')) return;
      const vehicle = vehicles.find((item) => item.id === row.dataset.id);
      if (vehicle) fillFormForEdit(vehicle);
    });
  });

  inventoryTableBody.querySelectorAll('button[data-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      const action = button.dataset.action;

      if (action === 'edit') {
        const vehicle = vehicles.find((item) => item.id === id);
        if (vehicle) fillFormForEdit(vehicle);
        return;
      }

      if (action === 'remove') {
        try {
          await window.InventoryService.removeVehicle(id);
          setMessage('Vehicle removed.');
          if (editingVehicleIdInput.value === id) clearFormToAddMode();
          await loadInventory();
        } catch (error) {
          console.error(error);
          setMessage(error.message || 'Could not remove vehicle.', true);
        }
        return;
      }

      const orderedList = sortVehiclesByOrder(vehicles).map((item, index) => ({
        ...item,
        effectiveOrder: orderValue(item, index + 1)
      }));

      const currentIndex = orderedList.findIndex((item) => item.id === id);
      if (currentIndex < 0) return;
      const targetIndex = action === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= orderedList.length) return;

      const current = orderedList[currentIndex];
      const target = orderedList[targetIndex];

      try {
        await window.InventoryService.updateVehicle(current.id, { displayOrder: target.effectiveOrder });
        await window.InventoryService.updateVehicle(target.id, { displayOrder: current.effectiveOrder });
        setMessage('Listing order updated.');
        await loadInventory();
      } catch (error) {
        console.error(error);
        setMessage(error.message || 'Could not update listing order.', true);
      }
    });
  });
}

function renderInquiryTable(inquiries) {
  if (!inquiries.length) {
    inquiryTableBody.innerHTML = '<tr><td colspan="5">No inquiries yet.</td></tr>';
    return;
  }

  inquiryTableBody.innerHTML = inquiries
    .map((inq) => {
      const created = inq.createdAt ? new Date(inq.createdAt).toLocaleString() : '-';
      return `
        <tr>
          <td>${created}</td>
          <td>${inq.name || '-'}</td>
          <td>${inq.phone || '-'}</td>
          <td>${inq.email || '-'}</td>
          <td>${inq.comment || '-'}</td>
        </tr>
      `;
    })
    .join('');
}

async function loadInquiries() {
  try {
    const inquiries = await window.InventoryService.getInquiries();
    renderInquiryTable(inquiries);
  } catch (error) {
    console.error(error);
    inquiryTableBody.innerHTML = '<tr><td colspan="5">Unable to load inquiries.</td></tr>';
  }
}

async function loadInventory() {
  vehicles = await window.InventoryService.getVehicles();
  renderInventoryTable();
}

async function handleAddOrUpdateVehicle(event) {
  event.preventDefault();

  const formData = new FormData(vehicleForm);
  const imageFiles = vehicleForm.querySelector('#images').files;
  const editingId = editingVehicleIdInput.value;
  const existingVehicle = vehicles.find((item) => item.id === editingId);

  try {
    let imageUrls = existingVehicle?.images || [];

    if (imageFiles && imageFiles.length) {
      setMessage('Uploading images...');
      imageUrls = await window.InventoryService.uploadImages(imageFiles);
    }

    if (!imageUrls.length) {
      imageUrls = [DEFAULT_IMAGE];
    }

    const enteredOrder = toNumber(formData.get('displayOrder'));
    const maxOrder = vehicles.reduce((max, item, idx) => Math.max(max, orderValue(item, idx + 1)), 0);

    const vehiclePayload = {
      make: formData.get('make') || '',
      model: formData.get('model') || '',
      year: toOptionalNumber(formData.get('year')),
      price: toOptionalNumber(formData.get('price')),
      mileage: toOptionalNumber(formData.get('mileage')),
      bodyType: formData.get('bodyType') || '',
      fuelType: formData.get('fuelType') || '',
      transmission: formData.get('transmission') || '',
      status: formData.get('status') || '',
      vin: formData.get('vin') || '',
      historyReportUrl: formData.get('historyReportUrl') || '',
      videoUrl: (formData.get('videoUrl') || '').trim(),
      images: imageUrls,
      features: parseCsv(formData.get('features')),
      specs: {
        engine: formData.get('engine') || '',
        horsepower: formData.get('horsepower') || '',
        drivetrain: formData.get('drivetrain') || '',
        mpg: formData.get('mpg') || ''
      },
      displayOrder: enteredOrder > 0 ? enteredOrder : (existingVehicle?.displayOrder || maxOrder + 1),
      dateAdded: existingVehicle?.dateAdded || new Date().toISOString().slice(0, 10)
    };

    if (editingId) {
      await window.InventoryService.updateVehicle(editingId, vehiclePayload);
      setMessage('Vehicle updated successfully.');
    } else {
      await window.InventoryService.addVehicle(vehiclePayload);
      setMessage('Vehicle added successfully.');
    }

    clearFormToAddMode();
    await loadInventory();
  } catch (error) {
    console.error(error);
    setMessage(error.message || 'Failed to save vehicle.', true);
  }
}

function setPortalAccess(user) {
  if (!window.InventoryService.isFirebaseEnabled()) {
    authNotice.textContent = 'Firebase is not configured. Update js/firebase-config.js, then refresh.';
    authSection.classList.add('hidden');
    portalSection.classList.add('hidden');
    return;
  }

  if (user) {
    authNotice.textContent = `Signed in as ${user.email}`;
    authSection.classList.add('hidden');
    portalSection.classList.remove('hidden');
    Promise.all([loadInventory(), loadInquiries()]).catch((error) => {
      console.error(error);
      setMessage('Could not load admin data.', true);
    });
  } else {
    authNotice.textContent = 'Sign in with admin credentials to manage inventory.';
    authSection.classList.remove('hidden');
    portalSection.classList.add('hidden');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  try {
    await window.InventoryService.signIn(emailInput.value.trim(), passwordInput.value);
    loginForm.reset();
    setMessage('Signed in successfully.');
  } catch (error) {
    console.error(error);
    setMessage('Login failed. Check Firebase Auth email/password account.', true);
  }
}

async function handleSignOut() {
  try {
    await window.InventoryService.signOut();
    clearFormToAddMode();
    setMessage('Signed out.');
  } catch (error) {
    console.error(error);
    setMessage('Sign out failed.', true);
  }
}

loginForm.addEventListener('submit', handleLogin);
vehicleForm.addEventListener('submit', handleAddOrUpdateVehicle);
signOutButton.addEventListener('click', handleSignOut);
cancelEditBtn.addEventListener('click', clearFormToAddMode);
window.InventoryService.onAuthStateChanged(setPortalAccess);
