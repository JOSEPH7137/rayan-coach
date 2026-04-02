// auth.js - Authentication functions

// Login user for clients and admins
async function loginUser(email, password) {
    try {
        console.log('Attempting login for:', email);
        
        if (!window.supabase) {
            showToast('Database connection error. Please refresh the page.', 'error');
            return { success: false };
        }
        
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('Login error:', error);
            if (error.message === 'Invalid login credentials') {
                showToast('❌ Invalid email or password. Please try again.', 'error');
            } else if (error.message.includes('Email not confirmed')) {
                showToast('📧 Please verify your email address before logging in.', 'error');
            } else {
                showToast(error.message, 'error');
            }
            return { success: false, error: error.message };
        }
        
        console.log('Login successful for:', data.user.email);
        
        // Get user profile
        let profile = null;
        let userRole = 'client';
        
        try {
            const { data: profileData, error: profileError } = await window.supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
            
            if (!profileError && profileData) {
                profile = profileData;
                userRole = profileData.role || 'client';
            }
        } catch (err) {
            console.log('Profile not found, using default client role');
        }
        
        console.log('User role:', userRole);
        
        // Clear any existing session data first
        sessionStorage.clear();
        
        // Store user info in sessionStorage (persists until browser closes)
        sessionStorage.setItem('user_role', userRole);
        sessionStorage.setItem('user_id', data.user.id);
        sessionStorage.setItem('user_email', email);
        sessionStorage.setItem('logged_in', 'true');
        sessionStorage.setItem('login_time', Date.now().toString());
        
        const rememberMe = document.getElementById('rememberMe');
        if (rememberMe && rememberMe.checked) {
            localStorage.setItem('rayan_user', JSON.stringify({
                id: data.user.id,
                email: email,
                role: userRole,
                name: profile?.name,
                login_time: Date.now()
            }));
        }
        
        showToast(`✅ Welcome back, ${profile?.name || email}!`, 'success');
        
        // Redirect based on role
        if (userRole === 'admin') {
            window.location.replace('admin-dashboard.html');
        } else if (userRole === 'driver') {
            window.location.replace('driver-dashboard.html');
        } else {
            window.location.replace('user-dashboard.html');
        }
        
        return { success: true, user: data.user, profile: profile };
    } catch (error) {
        console.error('Unexpected error:', error);
        showToast('Login failed. Please try again.', 'error');
        return { success: false, error: error.message };
    }
}

// Register user - for clients
async function registerUser(email, password, name, phone, role = 'client') {
    try {
        console.log('Attempting signup for:', email);
        
        if (!window.supabase) {
            showToast('Database connection error. Please refresh the page.', 'error');
            return { success: false };
        }
        
        const { data, error } = await window.supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    phone: phone,
                    role: role
                }
            }
        });
        
        if (error) {
            console.error('Signup error:', error);
            if (error.message.includes('User already registered')) {
                showToast('❌ Email already registered. Please sign in instead.', 'error');
            } else {
                showToast(error.message, 'error');
            }
            return { success: false, error: error.message };
        }
        
        console.log('Signup successful!');
        showToast(`✅ Account created successfully! Please sign in.`, 'success');
        
        // Clear form and switch to login tab
        setTimeout(() => {
            const signupForm = document.getElementById('signupForm');
            const loginForm = document.getElementById('loginForm');
            const tabs = document.querySelectorAll('.auth-tab');
            
            if (signupForm) signupForm.style.display = 'none';
            if (loginForm) loginForm.style.display = 'block';
            if (tabs[0]) tabs[0].classList.add('active');
            if (tabs[1]) tabs[1].classList.remove('active');
        }, 2000);
        
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Unexpected error:', error);
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Logout user - clear all storage
async function logoutUser() {
    try {
        if (window.supabase) {
            await window.supabase.auth.signOut();
        }
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace('index.html');
        showToast('Logged out successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Get current user - check session
async function getCurrentUser() {
    try {
        // First check sessionStorage
        const loggedIn = sessionStorage.getItem('logged_in');
        const userId = sessionStorage.getItem('user_id');
        const userRole = sessionStorage.getItem('user_role');
        
        if (loggedIn === 'true' && userId) {
            return { 
                id: userId, 
                role: userRole,
                email: sessionStorage.getItem('user_email')
            };
        }
        
        // Check localStorage for remember me
        const storedUser = localStorage.getItem('rayan_user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            sessionStorage.setItem('logged_in', 'true');
            sessionStorage.setItem('user_id', userData.id);
            sessionStorage.setItem('user_role', userData.role);
            sessionStorage.setItem('user_email', userData.email);
            return userData;
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

// Make functions global
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;