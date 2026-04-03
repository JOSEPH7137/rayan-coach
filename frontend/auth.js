// auth.js - Authentication functions

// Login user for clients and admins
async function loginUser(email, password, selectedRole) {
    try {
        email = email.trim();
        password = password.trim();

        console.log("Login attempt:", email, "as", selectedRole);

        // 1️⃣ Authenticate user
        const { data, error } = await window.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            showToast("❌ Wrong email or password", "error");
            return { success: false };
        }

        // 2️⃣ Get session
        const { data: sessionData } = await window.supabase.auth.getSession();
        if (!sessionData.session) {
            showToast("Session error. Try again.", "error");
            return { success: false };
        }

        const user = sessionData.session.user;

        // 3️⃣ Fetch user role
        const { data: profile, error: profileError } = await window.supabase
            .from('profiles')
            .select('role, name')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            await window.supabase.auth.signOut();
            showToast("❌ Account setup incomplete. Contact support.", "error");
            return { success: false };
        }

        const actualRole = profile.role;
        const name = profile.name || email.split('@')[0];

        console.log("Actual role:", actualRole);

        // 4️⃣ 🚨 STRICT ROLE CHECK (THIS IS THE FIX)
        if (actualRole !== selectedRole) {
            await window.supabase.auth.signOut(); // 🔥 FORCE LOGOUT

            showToast(
                `❌ Access denied. You are registered as "${actualRole}", not "${selectedRole}".`,
                "error"
            );

            return { success: false };
        }

        // 5️⃣ Store user (optional)
        const userData = {
            id: user.id,
            email,
            role: actualRole,
            name
        };

        localStorage.setItem("rayan_user", JSON.stringify(userData));

        showToast(`✅ Welcome ${name}`, "success");

        // 6️⃣ Redirect ONLY if role matches
        setTimeout(() => {
            if (actualRole === "admin") {
                window.location.href = "admin-dashboard.html";
            } else if (actualRole === "driver") {
                window.location.href = "driver-dashboard.html";
            } else {
                window.location.href = "user-dashboard.html";
            }
        }, 300);

        return { success: true };

    } catch (err) {
        console.error(err);
        showToast("Login failed", "error");
        return { success: false };
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