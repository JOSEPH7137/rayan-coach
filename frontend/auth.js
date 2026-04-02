// auth.js - PRODUCTION READY (FIXED)

// ===============================
// LOGIN USER
// ===============================
async function loginUser(email, password) {
    try {
        console.log('Attempting login for:', email);

        const { data, error } = await window.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login error:', error.message);
            showToast('❌ Invalid email or password', 'error');
            return { success: false };
        }

        // ✅ VERY IMPORTANT: wait for session to be ready
        const { data: sessionData } = await window.supabase.auth.getSession();

        if (!sessionData.session) {
            showToast('Session error. Try again.', 'error');
            return { success: false };
        }

        const user = sessionData.session.user;

        // ===============================
        // FETCH ROLE FROM DATABASE
        // ===============================
        let role = 'client';
        let name = email.split('@')[0];

        const { data: profile, error: profileError } = await window.supabase
            .from('profiles')
            .select('role, name')
            .eq('id', user.id)
            .single();

        if (!profileError && profile) {
            role = profile.role || 'client';
            name = profile.name || name;
        } else {
            console.warn('No profile found, defaulting to client');
        }

        console.log('User role:', role);

        // ===============================
        // STORE USER LOCALLY (OPTIONAL CACHE)
        // ===============================
        const userData = {
            id: user.id,
            email: user.email,
            role,
            name
        };

        localStorage.setItem('rayan_user', JSON.stringify(userData));

        showToast(`✅ Welcome ${name}`, 'success');

        // ===============================
        // SAFE REDIRECT
        // ===============================
        setTimeout(() => {
            if (role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else if (role === 'driver') {
                window.location.href = 'driver-dashboard.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }
        }, 300);

        return { success: true };

    } catch (err) {
        console.error('Unexpected error:', err);
        showToast('Login failed', 'error');
        return { success: false };
    }
}


// ===============================
// REGISTER USER (FIXED)
// ===============================
async function registerUser(email, password, name, phone, role = 'client') {
    try {
        console.log('Signing up:', email);

        const { data, error } = await window.supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            console.error(error.message);
            showToast(error.message, 'error');
            return { success: false };
        }

        const user = data.user;

        // ✅ INSERT ROLE INTO PROFILES TABLE
        const { error: insertError } = await window.supabase
            .from('profiles')
            .insert([{
                id: user.id,
                email,
                name,
                phone,
                role
            }]);

        if (insertError) {
            console.error('Profile insert error:', insertError.message);
        }

        showToast('✅ Account created. Please login.', 'success');

        return { success: true };

    } catch (err) {
        console.error(err);
        showToast('Signup failed', 'error');
        return { success: false };
    }
}


// ===============================
// LOGOUT USER
// ===============================
async function logoutUser() {
    await window.supabase.auth.signOut();

    localStorage.removeItem('rayan_user');

    window.location.href = 'index.html';
}


// ===============================
// GET CURRENT USER (REAL SESSION)
// ===============================
async function getCurrentUser() {
    const { data } = await window.supabase.auth.getSession();

    if (!data.session) return null;

    return data.session.user;
}


// ===============================
// PROTECT PAGE (VERY IMPORTANT)
// ===============================
async function protectPage(requiredRole = null) {
    const { data } = await window.supabase.auth.getSession();

    if (!data.session) {
        window.location.href = 'login.html';
        return;
    }

    const user = data.session.user;

    // fetch role
    const { data: profile } = await window.supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = profile?.role || 'client';

    // role restriction
    if (requiredRole && role !== requiredRole) {
        showToast('Access denied', 'error');
        window.location.href = 'index.html';
    }
}


// ===============================
// AUTH STATE LISTENER (FIXED)
// ===============================
window.supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event);

    // ❌ DO NOT redirect on INITIAL null
    if (event === 'SIGNED_OUT') {
        window.location.href = 'login.html';
    }
});


// ===============================
window.loginUser = loginUser;
window.registerUser = registerUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.protectPage = protectPage;