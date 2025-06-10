/**
 * Generic ripple effect utility for buttons & links.
 * Call `addRippleListener(element)` on any clickable element.
 */
export function createRippleEffect(target, event) {
  const ownerDocument = target.ownerDocument;
  if (!ownerDocument) return;

  const ripple = ownerDocument.createElement('span');
  const rect = target.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.classList.add('ripple');

  target.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

export function addRippleListener(element) {
  if (!element) return;
  element.classList.add('needs-ripple');
  element.addEventListener('click', (event) => {
    // Prevent ripple if click originates from interactive child.
    if (
      event.target !== element &&
      ['INPUT', 'BUTTON', 'A'].includes(event.target.tagName)
    ) {
      if (
        event.target.classList.contains('needs-ripple') ||
        event.target.closest('.needs-ripple') !== element ||
        event.target.closest('.no-bubble-ripple')
      ) {
        return;
      }
    }
    createRippleEffect(element, event);
  });
} 