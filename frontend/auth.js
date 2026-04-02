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
            showToast('Invalid email or password', 'error');
            return { success: false, error: error.message };
        }
        
        // Get user profile
        const { data: profile } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        const userRole = profile?.role || 'client';
        
        // Store user info
        sessionStorage.setItem('user_role', userRole);
        sessionStorage.setItem('user_id', data.user.id);
        sessionStorage.setItem('user_email', email);
        
        showToast(`Welcome back, ${profile?.name || email}!`, 'success');
        
        // Redirect based on role
        if (userRole === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (userRole === 'client') {
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
        
        if (error) throw error;
        
        showToast(`Account created successfully! Please sign in.`, 'success');
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Signup error:', error);
        showToast(error.message, 'error');
        return { success: false, error: error.message };
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
        if (error || !user) return null;
        
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
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.resetPassword = resetPassword;