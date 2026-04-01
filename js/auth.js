// ==================== AUTHENTICATION FUNCTIONS ====================

// Register user
async function registerUser(email, password, name, phone) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    phone: phone,
                    role: 'user'
                }
            }
        });
        
        if (error) throw error;
        
        showToast('Account created! Please check your email to verify.', 'success');
        return { success: true, user: data.user };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Login user
async function loginUser(email, password, rememberMe = false) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        showToast(`Welcome back, ${profile?.name || email}!`, 'success');
        
        if (rememberMe) {
            localStorage.setItem('supabase_session', JSON.stringify(data.session));
            localStorage.setItem('remembered_email', email);
        }
        
        // Redirect based on role
        if (profile?.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (profile?.role === 'driver') {
            window.location.href = 'driver-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
        
        return { success: true, user: data.user, profile: profile };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Logout user
async function logoutUser() {
    try {
        await supabase.auth.signOut();
        localStorage.removeItem('supabase_session');
        localStorage.removeItem('remembered_email');
        window.location.href = 'index.html';
        showToast('Logged out successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Get current user
async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
}

// Check if user is logged in
async function isUserLoggedIn() {
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
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
// ==================== AUTHENTICATION FUNCTIONS ====================

// Register user (with driver license and avatar support)
async function registerUser(email, password, name, phone, role = 'user', driverLicense = null, avatarUrl = null) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    phone: phone,
                    role: role,
                    driver_license: driverLicense,
                    avatar_url: avatarUrl
                }
            }
        });
        
        if (error) throw error;
        
        showToast('Account created! Please check your email to verify.', 'success');
        return { success: true, user: data.user };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Login user
async function loginUser(email, password, rememberMe = false) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        showToast(`Welcome back, ${profile?.name || email}!`, 'success');
        
        if (rememberMe) {
            localStorage.setItem('supabase_session', JSON.stringify(data.session));
            localStorage.setItem('remembered_email', email);
        }
        
        // Redirect based on role
        if (profile?.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (profile?.role === 'driver') {
            window.location.href = 'driver-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
        
        return { success: true, user: data.user, profile: profile };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Logout user
async function logoutUser() {
    try {
        await supabase.auth.signOut();
        localStorage.removeItem('supabase_session');
        localStorage.removeItem('remembered_email');
        window.location.href = 'index.html';
        showToast('Logged out successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Get current user
async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
}

// Check if user is logged in
async function isUserLoggedIn() {
    const { data: { session } } = await supabase.auth.getSession();
    return session !== null;
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

// Update user profile (including driver license)
async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);
        
        if (error) throw error;
        showToast('Profile updated successfully!', 'success');
        return { success: true, data: data };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Make functions global
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.isUserLoggedIn = isUserLoggedIn;
window.resetPassword = resetPassword;
window.updateUserProfile = updateUserProfile;
// Make functions global
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.isUserLoggedIn = isUserLoggedIn;
window.resetPassword = resetPassword;