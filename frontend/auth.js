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

// Register user - FIXED
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
            showToast(error.message, 'error');
            return { success: false, error: error.message };
        }
        
        console.log('Signup successful!');
        showToast(`✅ Account created successfully! Please sign in.`, 'success');
        
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Unexpected error:', error);
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Login driver with email and driver code
async function loginDriver(email, driverCode) {
    try {
        console.log('Driver login attempt for:', email);
        
        if (!window.supabase) {
            showToast('Database connection error. Please refresh the page.', 'error');
            return;
        }
        
        const { data: driver, error: findError } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .eq('role', 'driver')
            .single();
        
        if (findError || !driver) {
            showToast('Driver not found with this email', 'error');
            return;
        }
        
        if (driver.driver_code !== driverCode.toUpperCase()) {
            showToast('Invalid driver code', 'error');
            return;
        }
        
        if (!driver.is_approved) {
            showToast('Your account is pending approval', 'error');
            return;
        }
        
        const userData = {
            id: driver.id,
            email: driver.email,
            role: 'driver',
            name: driver.name,
            driver_code: driver.driver_code,
            login_time: Date.now()
        };
        
        localStorage.setItem('rayan_user', JSON.stringify(userData));
        
        showToast(`✅ Welcome back, Driver ${driver.name}!`, 'success');
        window.location.href = 'driver-dashboard.html';
        
    } catch (error) {
        console.error('Driver login error:', error);
        showToast('Login failed. Please check your email and driver code.', 'error');
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

// Get current user
async function getCurrentUser() {
    try {
        const storedUser = localStorage.getItem('rayan_user');
        if (!storedUser) return null;
        
        const userData = JSON.parse(storedUser);
        
        if (userData.login_time && (Date.now() - userData.login_time) > 7 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem('rayan_user');
            return null;
        }
        
        return userData;
    } catch (error) {
        return null;
    }
}

// Make all functions global
window.loginUser = loginUser;
window.registerUser = registerUser;
window.loginDriver = loginDriver;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;