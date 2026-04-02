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
                showToast('❌ Invalid email or password. Please check your credentials and try again.', 'error');
            } else if (error.message.includes('Email not confirmed')) {
                showToast('📧 Please verify your email address before logging in.', 'error');
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
            // Create profile if it doesn't exist
            if (profileError.code === 'PGRST116') {
                const { error: insertError } = await window.supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        name: data.user.email.split('@')[0],
                        email: data.user.email,
                        role: 'client',
                        is_approved: true
                    });
                if (insertError) console.error('Profile creation error:', insertError);
            }
        }
        
        const userRole = profile?.role || 'client';
        console.log('User role:', userRole);
        
        // Store user info in session (cleared when browser closes)
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
        
        // Small delay before redirect to ensure session is saved
        setTimeout(() => {
            // Redirect based on role
            if (userRole === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else if (userRole === 'driver') {
                window.location.href = 'driver-dashboard.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }
        }, 500);
        
        return { success: true, user: data.user, profile: profile };
    } catch (error) {
        console.error('Unexpected error:', error);
        showToast('Login failed. Please try again.', 'error');
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
        
        // First find driver by email
        const { data: driver, error: findError } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .eq('role', 'driver')
            .single();
        
        if (findError || !driver) {
            console.error('Driver not found:', findError);
            showToast('❌ Driver not found with this email', 'error');
            return;
        }
        
        console.log('Driver found:', driver.name);
        
        // Verify driver code
        if (driver.driver_code !== driverCode.toUpperCase()) {
            showToast('❌ Invalid driver code. Please check and try again.', 'error');
            return;
        }
        
        // Check if approved
        if (!driver.is_approved) {
            showToast('⏳ Your account is pending approval. Please contact admin.', 'error');
            return;
        }
        
        // Store driver session
        sessionStorage.setItem('user_role', 'driver');
        sessionStorage.setItem('user_id', driver.id);
        sessionStorage.setItem('user_email', driver.email);
        sessionStorage.setItem('driver_code', driver.driver_code);
        sessionStorage.setItem('logged_in', 'true');
        sessionStorage.setItem('login_time', Date.now().toString());
        
        showToast(`✅ Welcome back, Driver ${driver.name}!`, 'success');
        
        setTimeout(() => {
            window.location.href = 'driver-dashboard.html';
        }, 500);
        
    } catch (error) {
        console.error('Driver login error:', error);
        showToast('Login failed. Please check your email and driver code.', 'error');
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
            showToast('❌ Email already registered. Please sign in instead.', 'error');
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
            if (error.message.includes('User already registered')) {
                showToast('❌ Email already registered. Please sign in instead.', 'error');
            } else {
                showToast(error.message, 'error');
            }
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

// Get current user - check session validity
async function getCurrentUser() {
    try {
        // Check if session is still valid (not expired)
        const loginTime = sessionStorage.getItem('login_time');
        if (loginTime) {
            const timeSinceLogin = Date.now() - parseInt(loginTime);
            // Session expires after 24 hours
            if (timeSinceLogin > 24 * 60 * 60 * 1000) {
                console.log('Session expired');
                sessionStorage.clear();
                window.location.href = 'role-selection.html';
                return null;
            }
        }
        
        const loggedIn = sessionStorage.getItem('logged_in');
        if (!loggedIn) {
            return null;
        }
        
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
                // Check if stored session is still valid (within 7 days)
                if (userData.login_time && (Date.now() - userData.login_time) < 7 * 24 * 60 * 60 * 1000) {
                    return { id: userData.id, email: userData.email, role: userData.role, name: userData.name };
                }
            }
            sessionStorage.clear();
            return null;
        }
        
        // Get role from profile
        const { data: profile } = await window.supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        
        // Refresh session storage
        sessionStorage.setItem('logged_in', 'true');
        sessionStorage.setItem('login_time', Date.now().toString());
        
        return { ...user, role: profile?.role || 'client' };
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
        showToast('✅ Password reset link sent to your email!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Check if user is logged in (for page protection)
async function checkAuth() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'role-selection.html';
        return false;
    }
    return true;
}

// Make functions global
window.loginUser = loginUser;
window.loginDriver = loginDriver;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.resetPassword = resetPassword;
window.checkAuth = checkAuth;