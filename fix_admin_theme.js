const fs = require('fs');

// 1. firebase-service.js: Add removeInquiry
let fsCode = fs.readFileSync('js/firebase-service.js', 'utf8');
if (!fsCode.includes('async function removeInquiry')) {
  const insertIndex = fsCode.indexOf('async function getInquiries(');
  const removeInqCode = `  async function removeInquiry(id) {
    try {
      requireAuthForWrite();
      if (!firebaseEnabled || !db) return; // mock
      await db.collection('inquiries').doc(id).delete();
    } catch (error) {
      throw new Error(mapWriteError(error));
    }
  }

`;
  fsCode = fsCode.slice(0, insertIndex) + removeInqCode + fsCode.slice(insertIndex);
  fsCode = fsCode.replace('getInquiries,\n', 'getInquiries,\n    removeInquiry,\n');
  fs.writeFileSync('js/firebase-service.js', fsCode, 'utf8');
}

// 2. admin.html: Add Actions column to inquiries
let adminHtml = fs.readFileSync('admin.html', 'utf8');
if (!adminHtml.includes('<th>Actions</th>')) {
  adminHtml = adminHtml.replace('<th>Comment</th>\n              </tr>', '<th>Comment</th>\n                <th>Actions</th>\n              </tr>');
  fs.writeFileSync('admin.html', adminHtml, 'utf8');
}

// 3. admin.js: Add toggle visibility and delete inquiry logic
let adminJs = fs.readFileSync('js/admin.js', 'utf8');
// Inventory table
if (!adminJs.includes('data-action="toggle"')) {
  adminJs = adminJs.replace(
    '<button class="btn btn-danger btn-small" data-action="remove" data-id="${vehicle.id}" type="button">Remove</button>',
    `<button class="btn btn-muted btn-small" data-action="toggle" data-id="\${vehicle.id}" type="button">\${vehicle.isDisplayed !== false ? 'Hide' : 'Unhide'}</button>
          <button class="btn btn-danger btn-small" data-action="remove" data-id="\${vehicle.id}" type="button">Remove</button>`
  );
  
  // Action handling for toggle
  const actionHandlers = `if (action === 'remove') {`;
  const toggleHandler = `if (action === 'toggle') {
        try {
          const vehicle = vehicles.find((item) => item.id === id);
          if(vehicle) {
             const newDisplay = vehicle.isDisplayed === false ? true : false;
             await window.InventoryService.updateVehicle(id, { isDisplayed: newDisplay });
             setMessage('Visibility toggled.');
             await loadInventory();
          }
        } catch (error) {
           console.error(error);
           setMessage(error.message || 'Could not toggle visibility.', true);
        }
        return;
      }
      
      if (action === 'remove') {`;
  adminJs = adminJs.replace(actionHandlers, toggleHandler);
}

// Inquiry table
if (!adminJs.includes('remove-inquiry')) {
  adminJs = adminJs.replace(
    '<td>${inq.comment || \'-\'}</td>\n        </tr>',
    `<td>\${inq.comment || '-'}</td>\n          <td><button class="btn btn-danger btn-small" data-action="remove-inquiry" data-id="\${inq.id}">Delete</button></td>\n        </tr>`
  );
  
  // Actually attach listener to inquiryTableBody
  const inquiryRenderEnd = `    .join('');
}`;
  const inquiryAttach = `    .join('');

  inquiryTableBody.querySelectorAll('button[data-action="remove-inquiry"]').forEach((button) => {
    button.addEventListener('click', async () => {
      if(!confirm('Delete this inquiry?')) return;
      try {
        await window.InventoryService.removeInquiry(button.dataset.id);
        setMessage('Inquiry deleted.');
        await loadInquiries();
      } catch (err) {
        console.error(err);
        setMessage('Could not delete inquiry.', true);
      }
    });
  });
}`;
  adminJs = adminJs.replace(inquiryRenderEnd, inquiryAttach);
  fs.writeFileSync('js/admin.js', adminJs, 'utf8');
}

// 4. theme-dev.js: Add collapsibility and uncomment
let themeJs = fs.readFileSync('js/theme-dev.js', 'utf8');
themeJs = themeJs.replace(/\/\/ document\.body\.appendChild\(panel\); \/\/ Hidden for final production/g, 'document.body.appendChild(panel);');
if(!themeJs.includes('themeToggleIcon')) {
  themeJs = themeJs.replace(
    `  panel.className = 'dev-theme-panel';
  panel.innerHTML = \`
    <h3>Theme Dev</h3>
    <p>Color controls for rapid layout tuning.</p>
    <div class="dev-theme-controls"></div>
    <div class="dev-theme-actions">
      <button type="button" class="btn btn-muted" id="themeResetBtn">Reset</button>
    </div>
  \`;`,
    `  panel.className = 'dev-theme-panel';
  panel.innerHTML = \`
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
  \`;
  
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
  });`
  );
  fs.writeFileSync('js/theme-dev.js', themeJs, 'utf8');
}

console.log('Admin controls and theme dev panel updated successfully.');
