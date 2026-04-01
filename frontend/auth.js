// auth.js - Authentication functions

// Login user
async function loginUser(email, password) {
    try {
        console.log('Attempting login for:', email);
        
        if (!window.supabase) {
            showToast('Database connection error. Please refresh the page.', 'error');
            return { success: false, error: 'Supabase not initialized' };
        }
        
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('Login error:', error);
            showToast(error.message, 'error');
            return { success: false, error: error.message };
        }
        
        console.log('Login successful! User ID:', data.user.id);
        
        // Get user profile - if doesn't exist, create it
        let profile = null;
        let profileError = null;
        
        try {
            const result = await window.supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
            
            profile = result.data;
            profileError = result.error;
        } catch (err) {
            console.log('Profile fetch error, will create profile:', err);
        }
        
        // If profile doesn't exist, create one
        if (!profile && profileError?.code === 'PGRST116') {
            console.log('Creating profile for user...');
            const { data: newProfile, error: insertError } = await window.supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    name: data.user.user_metadata?.name || email,
                    email: email,
                    role: 'user'
                })
                .select()
                .single();
            
            if (!insertError) {
                profile = newProfile;
                console.log('Profile created successfully');
            }
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
        
        return { success: true };
    } catch (error) {
        console.error('Unexpected error:', error);
        showToast('Login failed. Please try again.', 'error');
        return { success: false, error: error.message };
    }
}

// Register user
async function registerUser(email, password, name, phone, role = 'user', driverLicense = null, avatarUrl = null) {
    try {
        console.log('Attempting signup for:', email);
        
        if (!window.supabase) {
            showToast('Database connection error. Please refresh the page.', 'error');
            return { success: false, error: 'Supabase not initialized' };
        }
        
        const { data, error } = await window.supabase.auth.signUp({
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
        
        if (error) {
            console.error('Signup error:', error);
            if (error.message.includes('User already registered')) {
                showToast('Email already registered. Please sign in instead.', 'error');
            } else {
                showToast(error.message, 'error');
            }
            return { success: false, error: error.message };
        }
        
        console.log('Signup successful! User ID:', data.user.id);
        
        // Create profile manually after signup
        const { error: insertError } = await window.supabase
            .from('profiles')
            .insert({
                id: data.user.id,
                name: name,
                email: email,
                phone: phone,
                role: role,
                driver_license: driverLicense,
                avatar_url: avatarUrl
            });
        
        if (insertError) {
            console.error('Profile creation error:', insertError);
        }
        
        showToast('Account created successfully! Logging you in...', 'success');
        
        // Auto login after signup
        setTimeout(async () => {
            const loginResult = await loginUser(email, password);
            if (!loginResult.success) {
                // If auto-login fails, redirect to login page
                window.location.href = 'auth.html?role=' + role;
            }
        }, 1500);
        
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
        await window.supabase.auth.signOut();
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
        const { data: { user }, error } = await window.supabase.auth.getUser();
        if (error) return null;
        return user;
    } catch (error) {
        return null;
    }
}

// Reset password
async function resetPassword(email) {
    try {
        const { error } = await window.supabase.auth.resetPasswordForEmail(email, {
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
window.resetPassword = resetPassword;