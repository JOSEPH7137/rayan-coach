// js/auth.js - Authentication functions with Remember Me

// ==================== AUTHENTICATION FUNCTIONS ====================

// Register user (Sign Up)
async function registerUser(email, password, name, phone) {
    try {
        // Show loading state
        const signupBtn = document.getElementById('signupBtn');
        if (signupBtn) {
            signupBtn.disabled = true;
            signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        }
        
        // Create user in Supabase Auth
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
        
        // Show success message
        showToast('Account created successfully! Please check your email to verify.', 'success');
        
        // Reset form
        if (signupBtn) {
            signupBtn.disabled = false;
            signupBtn.innerHTML = 'Create Account';
        }
        
        // Clear form fields
        document.getElementById('signupFname').value = '';
        document.getElementById('signupLname').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPhone').value = '';
        document.getElementById('signupPassword').value = '';
        document.getElementById('signupConfirmPassword').value = '';
        
        // Switch to login tab after 2 seconds
        setTimeout(() => {
            switchTab('login');
            showToast('Account created! Please sign in.', 'info');
        }, 2000);
        
        return { success: true, user: data.user };
    } catch (error) {
        showToast(error.message, 'error');
        if (signupBtn) {
            signupBtn.disabled = false;
            signupBtn.innerHTML = 'Create Account';
        }
        return { success: false, error: error.message };
    }
}

// Login user with Remember Me
async function loginUser(email, password, rememberMe = false) {
    try {
        // Show loading state
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        }
        
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error:', profileError);
        }
        
        // Handle Remember Me - Store session
        if (rememberMe) {
            // Store session in localStorage for persistence
            localStorage.setItem('supabase_session', JSON.stringify({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
                user_id: data.user.id
            }));
            
            // Also store user email for auto-fill
            localStorage.setItem('remembered_email', email);
        } else {
            // Clear any existing remembered data
            localStorage.removeItem('remembered_email');
            // Session will be stored in cookies by Supabase
        }
        
        showToast(`Welcome back, ${profile?.name || email}!`, 'success');
        
        // Reset button
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Sign In';
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
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Sign In';
        }
        return { success: false, error: error.message };
    }
}

// Auto-login if session exists (for Remember Me)
async function checkAutoLogin() {
    try {
        // Check if we have a stored session
        const storedSession = localStorage.getItem('supabase_session');
        
        if (storedSession) {
            const session = JSON.parse(storedSession);
            
            // Check if session is still valid
            if (session.expires_at * 1000 > Date.now()) {
                // Set the session in Supabase
                const { data, error } = await supabase.auth.setSession({
                    access_token: session.access_token,
                    refresh_token: session.refresh_token
                });
                
                if (!error && data.session) {
                    // Get user profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .single();
                    
                    // Redirect based on role
                    if (profile?.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else if (profile?.role === 'driver') {
                        window.location.href = 'driver-dashboard.html';
                    } else {
                        window.location.href = 'user-dashboard.html';
                    }
                    return true;
                } else {
                    // Session expired, clear it
                    localStorage.removeItem('supabase_session');
                }
            } else {
                // Session expired, clear it
                localStorage.removeItem('supabase_session');
            }
        }
        
        // Also check if Supabase has an active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (profile?.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else if (profile?.role === 'driver') {
                window.location.href = 'driver-dashboard.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Auto-login error:', error);
        return false;
    }
}

// Load remembered email on login page
function loadRememberedEmail() {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
        const emailInput = document.getElementById('loginEmail');
        const rememberCheckbox = document.getElementById('rememberMe');
        if (emailInput) emailInput.value = rememberedEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

// Logout user and clear remembered data
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

// Update user profile
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

// Make functions globally available
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.isUserLoggedIn = isUserLoggedIn;
window.resetPassword = resetPassword;
window.updateUserProfile = updateUserProfile;
window.checkAutoLogin = checkAutoLogin;
window.loadRememberedEmail = loadRememberedEmail;