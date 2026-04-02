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
            showToast('❌ Invalid email or password. Please try again.', 'error');
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
        
        // Store user info in localStorage (persists across page reloads)
        const userData = {
            id: data.user.id,
            email: email,
            role: userRole,
            name: profile?.name || email.split('@')[0],
            login_time: Date.now()
        };
        
        localStorage.setItem('rayan_user', JSON.stringify(userData));
        
        showToast(`✅ Welcome back, ${userData.name}!`, 'success');
        
        // Redirect based on role
        if (userRole === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (userRole === 'driver') {
            window.location.href = 'driver-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
        
        return { success: true, user: data.user, profile: profile };
    } catch (error) {
        console.error('Unexpected error:', error);
        showToast('Login failed. Please try again.', 'error');
        return { success: false, error: error.message };
    }
}

// Logout user
async function logoutUser() {
    try {
        if (window.supabase) {
            await window.supabase.auth.signOut();
        }
        localStorage.removeItem('rayan_user');
        sessionStorage.clear();
        window.location.href = 'index.html';
        showToast('Logged out successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Get current user from localStorage
async function getCurrentUser() {
    try {
        const storedUser = localStorage.getItem('rayan_user');
        if (!storedUser) return null;
        
        const userData = JSON.parse(storedUser);
        
        // Check if session is still valid (within 7 days)
        if (userData.login_time && (Date.now() - userData.login_time) > 7 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem('rayan_user');
            return null;
        }
        
        return userData;
    } catch (error) {
        return null;
    }
}

// Make functions global
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;