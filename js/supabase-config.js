// supabase-config.js
// Initialize Supabase client
const SUPABASE_URL = "https://puaxpnphkmscskzliyev.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1YXhwbnBoa21zY3NremxpeWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODYxOTQsImV4cCI6MjA5MDQ2MjE5NH0.kc3LU0bRyYf44eWsE6A91KfQSDdwlvwqHm69BreaGes";

const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
async function loginUser(email, password) {
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
        
        showToast(`Welcome back!`, 'success');
        
        // Redirect based on role
        if (profile?.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (profile?.role === 'driver') {
            window.location.href = 'driver-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
        
        return { success: true, user: data.user };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Logout
async function logoutUser() {
    try {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
        showToast('Logged out successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Get current user
async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// ==================== TRIP FUNCTIONS ====================

// Get available trips
async function getAvailableTrips() {
    try {
        const { data, error } = await supabase
            .from('trips')
            .select(`
                *,
                routes:route_id(*),
                buses:bus_id(*)
            `)
            .eq('status', 'scheduled')
            .gte('departure_time', new Date().toISOString())
            .order('departure_time');
        
        if (error) throw error;
        return { success: true, trips: data };
    } catch (error) {
        console.error('Error:', error);
        return { success: false, trips: [] };
    }
}

// Create booking
async function createBooking(tripId, seatNumbers, totalAmount) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            showToast('Please login to book', 'error');
            window.location.href = 'role-selection.html';
            return { success: false };
        }
        
        const { data, error } = await supabase
            .from('bookings')
            .insert({
                user_id: user.id,
                trip_id: tripId,
                seat_numbers: seatNumbers,
                total_amount: totalAmount,
                payment_status: 'pending'
            })
            .select()
            .single();
        
        if (error) throw error;
        
        showToast('Booking created! Complete payment to confirm.', 'success');
        return { success: true, booking: data };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false };
    }
}

// Get user bookings
async function getUserBookings() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, bookings: [] };
        
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                trips:trip_id(
                    *,
                    routes:route_id(*)
                )
            `)
            .eq('user_id', user.id)
            .order('booking_date', { ascending: false });
        
        if (error) throw error;
        return { success: true, bookings: data };
    } catch (error) {
        return { success: false, bookings: [] };
    }
}

// Create parcel
async function createParcel(parcelData) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            showToast('Please login to send parcels', 'error');
            return { success: false };
        }
        
        const trackingNumber = 'RC' + Date.now() + Math.floor(Math.random() * 1000);
        
        const { data, error } = await supabase
            .from('parcels')
            .insert({
                sender_id: user.id,
                receiver_name: parcelData.receiverName,
                receiver_phone: parcelData.receiverPhone,
                pickup_location: parcelData.pickupLocation,
                delivery_location: parcelData.deliveryLocation,
                weight_kg: parcelData.weight,
                description: parcelData.description,
                tracking_number: trackingNumber
            })
            .select()
            .single();
        
        if (error) throw error;
        
        showToast(`Parcel created! Tracking: ${trackingNumber}`, 'success');
        return { success: true, trackingNumber: trackingNumber };
    } catch (error) {
        showToast(error.message, 'error');
        return { success: false };
    }
}

// Get user parcels
async function getUserParcels() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, parcels: [] };
        
        const { data, error } = await supabase
            .from('parcels')
            .select('*')
            .eq('sender_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, parcels: data };
    } catch (error) {
        return { success: false, parcels: [] };
    }
}

// Get notifications
async function getUserNotifications() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, notifications: [] };
        
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (error) throw error;
        return { success: true, notifications: data };
    } catch (error) {
        return { success: false, notifications: [] };
    }
}

// Mark notification as read
async function markNotificationRead(notificationId) {
    try {
        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

// Export for global use
window.supabase = supabase;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.getAvailableTrips = getAvailableTrips;
window.createBooking = createBooking;
window.getUserBookings = getUserBookings;
window.createParcel = createParcel;
window.getUserParcels = getUserParcels;
window.getUserNotifications = getUserNotifications;
window.markNotificationRead = markNotificationRead;

console.log('Supabase initialized!');