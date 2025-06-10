let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-[100] space-y-2';
    document.body.appendChild(toastContainer);
  }
}

/**
 * Show toast notification.
 * @param {string} message
 * @param {'info'|'success'|'error'} [type='info']
 * @param {number} [duration=3000]
 */
export function showToast(message, type = 'info', duration = 3000) {
  ensureContainer();

  const toast = document.createElement('div');
  const toastMessage = document.createElement('span');
  toastMessage.textContent = message;

  toast.className =
    'toast-notification text-white py-3 px-6 rounded-lg shadow-lg opacity-0 transform translate-y-2 flex items-center space-x-2';

  let icon = 'info';
  let bg = 'bg-blue-500';
  if (type === 'success') {
    icon = 'check_circle';
    bg = 'bg-green-500';
  } else if (type === 'error') {
    icon = 'error';
    bg = 'bg-red-500';
  }

  toast.classList.add(bg);
  toast.innerHTML = `<span class="material-symbols-outlined">${icon}</span>`;
  toast.appendChild(toastMessage);
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('opacity-100', 'translate-y-0');
    toast.classList.remove('opacity-0', 'translate-y-2');
  });

  if (duration > 0) {
    setTimeout(() => {
      toast.classList.add('opacity-0');
      toast.classList.remove('opacity-100');
      setTimeout(() => toast.remove(), 500);
    }, duration);
  }
} 