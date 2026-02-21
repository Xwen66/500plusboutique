const inquiryForm = document.querySelector('#inquiryForm');
const inquiryMessage = document.querySelector('#inquiryMessage');

function setMessage(text, isError = false) {
  inquiryMessage.textContent = text;
  inquiryMessage.className = isError ? 'admin-message error' : 'admin-message';
}

async function handleInquirySubmit(event) {
  event.preventDefault();

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
    const modal = document.getElementById('inquiryModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
    const modalOkBtn = document.getElementById('modalOkBtn');
    if (modalOkBtn) {
      modalOkBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        window.location.href = 'inventory.html';
      });
    }
    setMessage('Inquiry submitted.');
  } catch (error) {
    console.error(error);
    setMessage(error.message || 'Unable to submit inquiry right now.', true);
  }
}

inquiryForm.addEventListener('submit', handleInquirySubmit);
