// ==================== THEME TOGGLE ====================
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    if (themeIcon) themeIcon.className = 'fas fa-moon';
    if (themeText) themeText.textContent = 'Dark';
    localStorage.setItem('theme', 'dark');
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    if (themeIcon) themeIcon.className = 'fas fa-sun';
    if (themeText) themeText.textContent = 'Light';
    localStorage.setItem('theme', 'light');
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  
  if (savedTheme === 'dark') {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (themeIcon) themeIcon.className = 'fas fa-moon';
    if (themeText) themeText.textContent = 'Dark';
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (themeIcon) themeIcon.className = 'fas fa-sun';
    if (themeText) themeText.textContent = 'Light';
  }
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(msg, type = 'success', duration = 3000) {
  let toastContainer = document.getElementById('toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  const colors = {
    success: '#0FCF7D',
    error: '#F04545',
    info: '#E8A020',
    warning: '#E8A020'
  };
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-dot" style="background: ${colors[type]};"></div>
    <span style="flex: 1;">${msg}</span>
    <span style="cursor: pointer; margin-left: 10px;" onclick="this.parentElement.remove()">×</span>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, duration);
}

// Make functions global
window.toggleTheme = toggleTheme;
window.loadTheme = loadTheme;
window.showToast = showToast;

// Load theme immediately
loadTheme();