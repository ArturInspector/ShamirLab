export function createConfetti(container = document.body) {
  const confettiCount = 50;
  const colors = ['#60a5fa', '#a78bfa', '#22d3ee', '#34d399', '#f59e0b'];
  const confettiElements = [];
  
  for (let i = 0; i < confettiCount; i++) {
    const confettiPiece = document.createElement('div');
    confettiPiece.className = 'confetti-piece';
    confettiPiece.style.cssText = `
      position: fixed;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}vw;
      top: -10px;
      opacity: ${Math.random() * 0.7 + 0.3};
      border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
      z-index: 10000;
      pointer-events: none;
      animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
      transform: rotate(${Math.random() * 360}deg);
    `;
    
    container.appendChild(confettiPiece);
    confettiElements.push(confettiPiece);
  }
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confettiFall {
      to {
        transform: translateY(100vh) rotate(${Math.random() * 720}deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  setTimeout(() => {
    confettiElements.forEach(el => el.remove());
    style.remove();
  }, 5000);
}

export function createRipple(event, color = 'rgba(96, 165, 250, 0.5)') {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: ${color};
    left: ${x}px;
    top: ${y}px;
    transform: scale(0);
    pointer-events: none;
    z-index: 1;
  `;
  
  ripple.classList.add('ripple-effect');
  
  const style = document.createElement('style');
  style.textContent = `
    .ripple-effect {
      animation: rippleAnim 0.6s ease-out;
    }
    @keyframes rippleAnim {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  
  if (!document.getElementById('ripple-style')) {
    style.id = 'ripple-style';
    document.head.appendChild(style);
  }
  
  const rippleContainer = button.querySelector('.ripple-container') || button;
  rippleContainer.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard! ✓', 'success');
    return true;
  }).catch(() => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Copied! ✓', 'success');
      return true;
    } catch (err) {
      showToast('Failed to copy', 'error');
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  });
}

export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const colors = {
    success: '#34d399',
    error: '#ef4444',
    info: '#60a5fa',
    warning: '#f59e0b'
  };
  
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: rgba(10, 10, 10, 0.95);
    border: 2px solid ${colors[type] || colors.info};
    border-radius: 8px;
    color: ${colors[type] || colors.info};
    font-weight: 600;
    z-index: 10001;
    animation: toastSlide 0.3s ease-out;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
  `;
  
  toast.textContent = message;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastSlide {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  
  if (!document.getElementById('toast-style')) {
    style.id = 'toast-style';
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastSlide 0.3s ease-in reverse';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

export function smoothScrollTo(element, offset = 80) {
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

export function addKeyboardShortcuts(shortcuts) {
  const handler = (event) => {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;
    
    Object.entries(shortcuts).forEach(([combo, callback]) => {
      const parts = combo.toLowerCase().split('+');
      const shortcutKey = parts[parts.length - 1];
      const needsCtrl = parts.includes('ctrl') || parts.includes('cmd');
      const needsShift = parts.includes('shift');
      const needsAlt = parts.includes('alt');
      
      if (
        key === shortcutKey &&
        ctrl === needsCtrl &&
        shift === needsShift &&
        alt === needsAlt
      ) {
        event.preventDefault();
        callback(event);
      }
    });
  };
  
  document.addEventListener('keydown', handler);
  
  return () => document.removeEventListener('keydown', handler);
}
