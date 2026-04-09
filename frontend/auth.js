
async function loginUser(email, password, selectedRole) {
  try {
    email = email.trim();
    password = password.trim();

    console.log("Login attempt:", email, "as", selectedRole);

    // 1️⃣ Authenticate user
    const { data: authData, error: authError } =
      await window.supabase.auth.signInWithPassword({
        email,
        password
      });

    if (authError || !authData.user) {
      return {
        success: false,
        error: "Invalid email or password"
      };
    }

    const user = authData.user;

    // 2️⃣ Get profile (SAFE version)
    const { data: profile, error: profileError } =
      await window.supabase
        .from('profiles')
        .select('role, name')
        .eq('id', user.id)
        .maybeSingle(); // ✅ IMPORTANT FIX

    if (profileError) {
      console.error("Profile error:", profileError);

      return {
        success: false,
        error: "Failed to load profile"
      };
    }

    if (!profile) {
      return {
        success: false,
        error: "Profile not found. Contact support."
      };
    }

    const actualRole = profile.role;
    const name = profile.name || email.split('@')[0];

    // 3️⃣ Role validation (NO FORCED LOGOUT)
    if (actualRole !== selectedRole) {
      return {
        success: false,
        error: `Access denied. You are registered as ${actualRole}`
      };
    }

    // 4️⃣ Save session
    const userData = {
      id: user.id,
      email,
      role: actualRole,
      name,
      login_time: Date.now()
    };

    localStorage.setItem("rayan_user", JSON.stringify(userData));
    sessionStorage.setItem("rayan_session", JSON.stringify(userData));

    console.log("✅ Login successful:", userData);

    return {
      success: true,
      user,
      profile: userData
    };

  } catch (err) {
    console.error("Login error:", err);

    return {
      success: false,
      error: "Something went wrong"
    };
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

        showToast('Logged out successfully', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);

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