// auth.js - Authentication functions

// Login user
async function loginUser(email, password) {
    try {
        console.log('Attempting login for:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('Login error:', error);
            showToast(error.message, 'error');
            return { success: false, error: error.message };
        }
        
        console.log('Login successful! User ID:', data.user.id);
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        if (profileError) {
            console.error('Profile error:', profileError);
        }
        
        const userName = profile?.name || email;
        showToast(`Welcome back, ${userName}!`, 'success');
        
        // Store session if remember me is checked
        const rememberMe = document.getElementById('rememberMe')?.checked;
        if (rememberMe) {
            localStorage.setItem('supabase_session', JSON.stringify(data.session));
        }
        
        // Redirect based on role
        const role = profile?.role || 'user';
        console.log('Redirecting to role:', role);
        
        if (role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (role === 'driver') {
            window.location.href = 'driver-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
        
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Unexpected error:', error);
        showToast('Login failed. Please try again.', 'error');
        return { success: false, error: error.message };
    }
}

// Register user
async function registerUser(email, password, name, phone, role = 'user', driverLicense = null) {
    try {
        console.log('Attempting signup for:', email);
        
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    phone: phone,
                    role: role,
                    driver_license: driverLicense
                }
            }
        });
        
        if (error) {
            console.error('Signup error:', error);
            showToast(error.message, 'error');
            return { success: false, error: error.message };
        }
        
        console.log('Signup successful!');
        showToast('Account created! Please sign in.', 'success');
        
        // Switch to login tab after 2 seconds
        setTimeout(() => {
            const loginTab = document.querySelector('.auth-tab:first-child');
            if (loginTab) loginTab.click();
        }, 2000);
        
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Unexpected error:', error);
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Logout user
async function logoutUser() {
    try {
        await supabase.auth.signOut();
        localStorage.removeItem('supabase_session');
        window.location.href = 'index.html';
        showToast('Logged out successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Get current user
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) return null;
        return user;
    } catch (error) {
        return null;
    }
}

// Check if user is logged in
async function isUserLoggedIn() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session !== null;
    } catch (error) {
        return false;
    }
}

// Reset password
async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html',
        });
        
        if (error) throw error;
        showToast('Password reset link sent to your email!', 'success');
        return { success: true };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Make functions global
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.isUserLoggedIn = isUserLoggedIn;
window.resetPassword = resetPassword;