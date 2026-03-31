// js/auth-ui.js - Auth page UI specific functions

let currentRole = 'user';

document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    if (role) {
        currentRole = role;
        updateAuthUI(role);
    }
    
    // Load remembered email if exists
    loadRememberedEmail();
    
    // Check if user is already logged in (auto-login)
    checkAutoLogin();
});

function updateAuthUI(role) {
    const icons = {user:'🧳', driver:'🚗', admin:'🛡️'};
    const titles = {user:'Traveller Sign In', driver:'Driver Sign In', admin:'Admin Login'};
    const subtitles = {user:'Book, track & manage your journeys', driver:'Manage your trips & earnings', admin:'Enterprise control panel'};
    
    const authRoleIcon = document.getElementById('authRoleIcon');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const signupTab = document.getElementById('signupTab');
    const adminNote = document.getElementById('adminNote');
    
    if (authRoleIcon) authRoleIcon.textContent = icons[role];
    if (authTitle) authTitle.textContent = titles[role];
    if (authSubtitle) authSubtitle.textContent = subtitles[role];
    
    if (role === 'admin') {
        if (signupTab) signupTab.style.display = 'none';
        if (adminNote) adminNote.style.display = 'flex';
    } else {
        if (signupTab) signupTab.style.display = 'flex';
        if (adminNote) adminNote.style.display = 'none';
    }
}

function switchTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    tabs.forEach(t => t.classList.remove('active'));
    if (tab === 'login') {
        event.target.classList.add('active');
        if (loginForm) loginForm.style.display = 'block';
        if (signupForm) signupForm.style.display = 'none';
    } else {
        event.target.classList.add('active');
        if (loginForm) loginForm.style.display = 'none';
        if (signupForm) signupForm.style.display = 'block';
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }
    
    await loginUser(email, password, rememberMe);
}

async function handleSignup() {
    const fname = document.getElementById('signupFname')?.value.trim();
    const lname = document.getElementById('signupLname')?.value.trim();
    const email = document.getElementById('signupEmail')?.value.trim();
    const phone = document.getElementById('signupPhone')?.value.trim();
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value;
    
    // Validation
    if (!fname || !lname || !email || !password) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Phone validation (optional but if provided, validate)
    if (phone && !/^[0-9]{10,12}$/.test(phone.replace(/[^0-9]/g, ''))) {
        showToast('Please enter a valid phone number', 'error');
        return;
    }
    
    // Password validation
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    const fullName = `${fname} ${lname}`;
    await registerUser(email, password, fullName, phone);
}

async function handleForgotPassword() {
    const email = document.getElementById('loginEmail')?.value.trim();
    
    if (!email) {
        showToast('Please enter your email address', 'error');
        return;
    }
    
    await resetPassword(email);
}

function togglePasswordField(id) {
    const input = document.getElementById(id);
    const button = input?.parentElement?.querySelector('.toggle-password');
    if (input) {
        if (input.type === 'password') {
            input.type = 'text';
            if (button) button.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            input.type = 'password';
            if (button) button.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }
}

// Make functions global for onclick handlers
window.switchTab = switchTab;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleForgotPassword = handleForgotPassword;
window.togglePasswordField = togglePasswordField;