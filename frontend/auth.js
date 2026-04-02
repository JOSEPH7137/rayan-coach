// auth.js - Authentication functions

// Login user for clients and admins
async function loginUser(email, password) {
    try {
        console.log('Attempting login for:', email);
        console.log('Supabase available:', typeof window.supabase !== 'undefined');
        
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
                showToast('Invalid email or password. Please try again.', 'error');
            } else {
                showToast(error.message, 'error');
            }
            return { success: false, error: error.message };
        }
        
        console.log('Login successful for:', data.user.email);
        
        // Get user profile
        const { data: profile, error: profileError } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        if (profileError) {
            console.error('Profile fetch error:', profileError);
        }
        
        const userRole = profile?.role || 'client';
        console.log('User role:', userRole);
        
        // Store user info
        sessionStorage.setItem('user_role', userRole);
        sessionStorage.setItem('user_id', data.user.id);
        sessionStorage.setItem('user_email', email);
        
        if (document.getElementById('rememberMe')?.checked) {
            localStorage.setItem('rayan_user', JSON.stringify({
                id: data.user.id,
                email: email,
                role: userRole,
                name: profile?.name
            }));
        }
        
        showToast(`Welcome back, ${profile?.name || email}!`, 'success');
        
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

// Register user - only for clients
async function registerUser(email, password, name, phone, role = 'client') {
    try {
        console.log('Attempting signup for:', email);
        
        if (!window.supabase) {
            showToast('Database connection error. Please refresh the page.', 'error');
            return { success: false };
        }
        
        // Check if user already exists
        const { data: existingUser } = await window.supabase
            .from('profiles')
            .select('email')
            .eq('email', email)
            .single();
        
        if (existingUser) {
            showToast('Email already registered. Please sign in instead.', 'error');
            return { success: false, error: 'Email already exists' };
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
        showToast(`Account created successfully! Please sign in.`, 'success');
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
        console.log('Driver login attempt:', email);
        
        if (!window.supabase) {
            showToast('Database connection error. Please refresh the page.', 'error');
            return;
        }
        
        // First find driver by email
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
        
        // Verify driver code
        if (driver.driver_code !== driverCode.toUpperCase()) {
            showToast('Invalid driver code', 'error');
            return;
        }
        
        // Check if approved
        if (!driver.is_approved) {
            showToast('Your account is pending approval', 'error');
            return;
        }
        
        // Store driver session
        sessionStorage.setItem('user_role', 'driver');
        sessionStorage.setItem('user_id', driver.id);
        sessionStorage.setItem('user_email', driver.email);
        sessionStorage.setItem('driver_code', driver.driver_code);
        
        showToast(`Welcome back, Driver ${driver.name}!`, 'success');
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
        localStorage.clear();
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
        if (!window.supabase) return null;
        
        // Check for driver session first
        const driverCode = sessionStorage.getItem('driver_code');
        if (driverCode) {
            const { data: driver } = await window.supabase
                .from('profiles')
                .select('*')
                .eq('driver_code', driverCode)
                .single();
            if (driver) {
                return { id: driver.id, email: driver.email, role: 'driver', name: driver.name };
            }
        }
        
        const { data: { user }, error } = await window.supabase.auth.getUser();
        if (error || !user) {
            // Check localStorage for remember me
            const storedUser = localStorage.getItem('rayan_user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                return { id: userData.id, email: userData.email, role: userData.role, name: userData.name };
            }
            return null;
        }
        
        // Get role from profile
        const { data: profile } = await window.supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        
        return { ...user, role: profile?.role || 'client' };
    } catch (error) {
        return null;
    }
}

// Reset password
async function resetPassword(email) {
    try {
        if (!window.supabase) {
            showToast('Database connection error', 'error');
            return;
        }
        
        const { error } = await window.supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html',
        });
        
        if (error) throw error;
        showToast('Password reset link sent to your email!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Make functions global
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.resetPassword = resetPassword;
window.loginDriver = loginDriver;