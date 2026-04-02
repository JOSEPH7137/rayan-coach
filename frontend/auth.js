// auth.js - Authentication functions

// Login user with driver code support
async function loginUser(emailOrCode, passwordOrCode, rememberMe = false, isDriverLogin = false) {
    try {
        console.log('Attempting login for:', emailOrCode);
        
        // Check if this is a driver login attempt
        if (isDriverLogin) {
            // Try driver login with code
            const { data: driver, error: driverError } = await supabase
                .from('profiles')
                .select('*')
                .eq('driver_code', emailOrCode.toUpperCase())
                .eq('role', 'driver')
                .single();
            
            if (!driverError && driver) {
                // Driver found, check if approved
                if (!driver.is_approved) {
                    showToast('Your account is pending approval. Please contact admin.', 'error');
                    return { success: false };
                }
                
                // Store driver session
                sessionStorage.setItem('user_role', 'driver');
                sessionStorage.setItem('user_id', driver.id);
                sessionStorage.setItem('user_email', driver.email);
                sessionStorage.setItem('driver_code', driver.driver_code);
                
                if (rememberMe) {
                    localStorage.setItem('rayan_user', JSON.stringify({
                        id: driver.id,
                        email: driver.email,
                        role: 'driver',
                        name: driver.name,
                        driver_code: driver.driver_code
                    }));
                }
                
                showToast(`Welcome back, Driver ${driver.name}!`, 'success');
                window.location.href = 'driver-dashboard.html';
                return { success: true, user: driver };
            } else {
                showToast('Invalid driver code. Please check and try again.', 'error');
                return { success: false, error: 'Invalid driver code' };
            }
        }
        
        // Regular email/password login for clients and admins
        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailOrCode,
            password: passwordOrCode
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
        sessionStorage.setItem('user_email', emailOrCode);
        
        if (rememberMe) {
            localStorage.setItem('rayan_user', JSON.stringify({
                id: data.user.id,
                email: emailOrCode,
                role: userRole,
                name: profile?.name
            }));
        }
        
        showToast(`Welcome back, ${profile?.name || emailOrCode}!`, 'success');
        
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

// Get current user with role
async function getCurrentUser() {
    try {
        // Check for driver session first
        const driverCode = sessionStorage.getItem('driver_code');
        if (driverCode) {
            const { data: driver } = await supabase
                .from('profiles')
                .select('*')
                .eq('driver_code', driverCode)
                .single();
            
            if (driver) {
                return { id: driver.id, email: driver.email, role: 'driver', name: driver.name };
            }
        }
        
        // Check session storage
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

// Register user - only for clients
async function registerUser(email, password, name, phone, role = 'client', driverLicense = null, avatarUrl = null) {
    try {
        console.log('Attempting signup for:', email, 'with role:', role);
        
        // Only clients can register themselves
        if (role !== 'client') {
            showToast('Only customer accounts can be created directly. Please contact admin for other roles.', 'error');
            return { success: false, error: 'Invalid registration' };
        }
        
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
                    role: role,
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
        showToast(`Account created successfully! Please sign in.`, 'success');
        
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Unexpected error:', error);
        showToast(error.message, 'error');
        return { success: false, error: error.message };
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

// Admin function to add a driver
async function addDriverByAdmin(name, email, phone, driverLicense) {
    try {
        const { data, error } = await supabase
            .rpc('add_driver', {
                driver_name: name,
                driver_email: email,
                driver_phone: phone,
                driver_license: driverLicense
            });
        
        if (error) throw error;
        
        showToast(`Driver added successfully! Driver Code: ${data}`, 'success');
        return { success: true, driverCode: data };
    } catch (error) {
        console.error('Error adding driver:', error);
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Make functions global
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.checkPageAccess = checkPageAccess;
window.addDriverByAdmin = addDriverByAdmin;