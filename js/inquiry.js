const inquiryForm = document.querySelector('#inquiryForm');
const inquiryMessage = document.querySelector('#inquiryMessage');

function setMessage(text, isError = false) {
  inquiryMessage.textContent = text;
  inquiryMessage.className = isError ? 'admin-message error' : 'admin-message';
}

async function handleInquirySubmit(event) {
  event.preventDefault();

  // The public GitHub Pages build is a UI-only portfolio demo. Do not collect visitor data.
  if (!window.InventoryService.isFirebaseEnabled()) {
    inquiryForm.reset();
    setMessage('Demo mode: this form is for UI demonstration only and does not send or store your information.');
    return;
  }

  const formData = new FormData(inquiryForm);
  const payload = {
    name: String(formData.get('name') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    comment: String(formData.get('comment') || '').trim()
  };

  try {
    await window.InventoryService.addInquiry(payload);
    inquiryForm.reset();
    alert('We will contact you soon!');
    setMessage('Inquiry submitted.');
  } catch (error) {
    console.error(error);
    setMessage(error.message || 'Unable to submit inquiry right now.', true);
  }
}

inquiryForm.addEventListener('submit', handleInquirySubmit);
