const compareOptions = document.querySelector('#compareOptions');
const runCompareButton = document.querySelector('#runCompare');
const compareTableWrap = document.querySelector('#compareTableWrap');

const formatMoney = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value || 0);

let vehicles = [];

function renderOptions() {
  compareOptions.innerHTML = vehicles
    .map(
      (vehicle) => `
      <label class="compare-choice">
        <input type="checkbox" value="${vehicle.id}" />
        <span>${vehicle.year} ${vehicle.make} ${vehicle.model} (${formatMoney(vehicle.price)})</span>
      </label>
    `
    )
    .join('');
}

function selectedIds() {
  return [...compareOptions.querySelectorAll('input:checked')].map((input) => input.value);
}

function compareSelected() {
  const ids = selectedIds();

  if (ids.length < 2 || ids.length > 3) {
    compareTableWrap.innerHTML = '<p>Please select 2 or 3 vehicles for comparison.</p>';
    return;
  }

  const selectedVehicles = vehicles.filter((vehicle) => ids.includes(vehicle.id));

  const rows = [
    ['Vehicle', (v) => `${v.year} ${v.make} ${v.model}`],
    ['Price', (v) => formatMoney(v.price)],
    ['Mileage', (v) => `${Number(v.mileage || 0).toLocaleString()} KM`],
    ['Body Type', (v) => v.bodyType || '-'],
    ['Fuel Type', (v) => v.fuelType || '-'],
    ['Transmission', (v) => v.transmission || '-'],
    ['Status', (v) => v.status || '-'],
    ['Engine', (v) => v.specs?.engine || '-'],
    ['Horsepower', (v) => v.specs?.horsepower || '-'],
    ['Drivetrain', (v) => v.specs?.drivetrain || '-'],
    ['MPG/MPGe', (v) => v.specs?.mpg || '-'],
    ['VIN', (v) => v.vin || '-']
  ];

  const headerCells = selectedVehicles
    .map((vehicle) => `<th>${vehicle.year} ${vehicle.make} ${vehicle.model}</th>`)
    .join('');

  const bodyRows = rows
    .map(([label, getValue]) => {
      const cells = selectedVehicles.map((vehicle) => `<td>${getValue(vehicle)}</td>`).join('');
      return `<tr><th>${label}</th>${cells}</tr>`;
    })
    .join('');

  compareTableWrap.innerHTML = `
    <table class="compare-table">
      <thead>
        <tr>
          <th>Attribute</th>
          ${headerCells}
        </tr>
      </thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
  `;
}

async function init() {
  try {
    vehicles = await window.InventoryService.getVehicles();
    renderOptions();
    runCompareButton.addEventListener('click', compareSelected);
  } catch (error) {
    compareTableWrap.innerHTML = '<p>Unable to load vehicles for comparison.</p>';
    console.error(error);
  }
}

init();
