// Login user with better error handling
async function loginUser(email, password, rememberMe = false) {
    try {
        console.log('Attempting login for:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            console.error('Login error:', error);
            if (error.message.includes('Invalid login credentials')) {
                showToast('Invalid email or password. Please check your credentials.', 'error');
            } else if (error.message.includes('Email not confirmed')) {
                showToast('Please verify your email address before logging in.', 'error');
            } else {
                showToast(error.message, 'error');
            }
            return { success: false, error: error.message };
        }
        
        console.log('Login successful for:', data.user.email);
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
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
        
        if (rememberMe) {
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
// Logout user - clear all local data
async function logoutUser() {
    try {
        await supabase.auth.signOut();
        // Clear all local storage
        localStorage.removeItem('rayan_user');
        localStorage.removeItem('supabase_session');
        localStorage.removeItem('remembered_email');
        sessionStorage.clear();
        window.location.href = 'index.html';
        showToast('Logged out successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Get current user - check session first
async function getCurrentUser() {
    try {
        // First check sessionStorage for current session
        const currentUserId = sessionStorage.getItem('current_user_id');
        
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            // Check if we have a stored user
            const storedUser = localStorage.getItem('rayan_user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                return { id: userData.id, email: userData.email };
            }
            return null;
        }
        
        // Verify this is the same user
        if (currentUserId && user.id !== currentUserId) {
            // Different user, clear session
            await supabase.auth.signOut();
            localStorage.removeItem('rayan_user');
            sessionStorage.clear();
            return null;
        }
        
        sessionStorage.setItem('current_user_id', user.id);
        return user;
    } catch (error) {
        return null;
    }
}

/// Register user - role is passed from the signup page
async function registerUser(email, password, name, phone, role = 'client', driverLicense = null, avatarUrl = null) {
    try {
        console.log('Attempting signup for:', email, 'with role:', role);
        
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email)
            .single();
        
        if (existingUser) {
            showToast('Email already registered. Please sign in instead.', 'error');
            return { success: false, error: 'Email already exists' };
        }
        
        // Create user with role in metadata
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    phone: phone,
                    role: role,  // This will be 'client', 'driver', or 'admin'
                    driver_license: driverLicense,
                    avatar_url: avatarUrl
                }
            }
        });
        
        if (error) {
            console.error('Signup error:', error);
            showToast(error.message, 'error');
            return { success: false, error: error.message };
        }
        
        console.log('Signup successful! Role assigned:', role);
        showToast(`Account created successfully as ${role.toUpperCase()}! Please sign in.`, 'success');
        
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Unexpected error:', error);
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Login user with role validation
async function loginUser(email, password, rememberMe = false) {
    try {
        console.log('Attempting login for:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        // Get user profile to check role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        if (profileError) {
            console.error('Profile fetch error:', profileError);
        }
        
        const userRole = profile?.role || 'client';
        
        // Store user info in session
        sessionStorage.setItem('user_role', userRole);
        sessionStorage.setItem('user_id', data.user.id);
        sessionStorage.setItem('user_email', email);
        
        if (rememberMe) {
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
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Get current user with role
async function getCurrentUser() {
    try {
        // First check session storage
        const storedUserId = sessionStorage.getItem('user_id');
        const storedRole = sessionStorage.getItem('user_role');
        
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            // Check localStorage for remember me
            const storedUser = localStorage.getItem('rayan_user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                sessionStorage.setItem('user_id', userData.id);
                sessionStorage.setItem('user_role', userData.role);
                sessionStorage.setItem('user_email', userData.email);
                return { id: userData.id, email: userData.email, role: userData.role };
            }
            return null;
        }
        
        // Get role from profile if not in session
        let role = storedRole;
        if (!role) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            role = profile?.role || 'client';
            sessionStorage.setItem('user_role', role);
        }
        
        sessionStorage.setItem('user_id', user.id);
        return { ...user, role: role };
    } catch (error) {
        return null;
    }
}

// Check if user has access to a specific page
async function checkPageAccess(allowedRoles = []) {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'role-selection.html';
        return false;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        showToast('You do not have access to this page', 'error');
        window.location.href = 'role-selection.html';
        return false;
    }
    
    return true;
}

// Make functions global
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.checkPageAccess = checkPageAccess;