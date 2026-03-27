// ==================== REACT SETUP ====================
// At the VERY TOP of app.js
const { useState, useEffect, createContext, useContext } = React;
const { createRoot } = ReactDOM;
const { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } = ReactRouterDOM;
// API Base URL - Change this to your backend URL when deploying
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://rayan-coach-backend.onrender.com/api';

// ==================== AUTH CONTEXT ====================
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, role) => {
    try {
      const endpoint = role === 'admin' ? `${API_URL}/auth/admin/login` : `${API_URL}/auth/login`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return React.createElement(AuthContext.Provider, { value: { user, login, register, logout, loading } }, children);
};

// ==================== PROTECTED ROUTE ====================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return React.createElement('div', { className: "flex items-center justify-center h-screen" }, "Loading...");
  }

  if (!user) {
    return React.createElement(Navigate, { to: "/", state: { from: location }, replace: true });
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return React.createElement(Navigate, { to: `/${user.role}/dashboard`, replace: true });
  }

  return children;
};

// ==================== WELCOME PAGE ====================
const WelcomePage = ({ navigate }) => {
  const roles = [
    { id: 'user', icon: '👤', title: 'Traveller', description: 'Book trips, track buses & send parcels', color: '#3B82F6', path: '/user/login' },
    { id: 'driver', icon: '🚛', title: 'Driver', description: 'Manage trips, track earnings & navigate', color: '#10B981', path: '/driver/login' },
    { id: 'admin', icon: '⚙️', title: 'Admin', description: 'Control fleet, drivers & analytics', color: '#F59E0B', path: '/admin/login' }
  ];

  return React.createElement('div', { className: "min-h-screen bg-black" },
    React.createElement('div', { className: "relative overflow-hidden py-20 px-4" },
      React.createElement('div', { className: "absolute inset-0 bg-gradient-to-r from-orange-600/20 to-black/40" }),
      React.createElement('div', { className: "relative max-w-6xl mx-auto text-center" },
        React.createElement('div', { className: "flex justify-center mb-6" },
          React.createElement('div', { className: "w-24 h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-3xl font-bold" }, "RC")
        ),
        React.createElement('h1', { className: "text-5xl md:text-6xl font-extrabold mb-4 syne" }, "Welcome to Rayan Coach"),
        React.createElement('p', { className: "text-xl text-gray-400" }, "Comfortable, Safe & Reliable Travel Across Kenya")
      )
    ),
    React.createElement('div', { className: "max-w-6xl mx-auto py-16 px-4" },
      React.createElement('div', { className: "grid md:grid-cols-3 gap-8" },
        roles.map(role => 
          React.createElement('div', { 
            key: role.id, 
            className: "role-card rounded-2xl p-8 text-center", 
            style: { background: 'var(--rc-card)', border: '1px solid var(--rc-border)' }, 
            onClick: () => navigate(role.path) 
          },
            React.createElement('div', { className: "text-5xl mb-4" }, role.icon),
            React.createElement('h3', { className: "text-2xl font-bold mb-3 syne" }, role.title),
            React.createElement('p', { className: "text-gray-400 mb-6", style: { color: 'var(--rc-muted)' } }, role.description),
            React.createElement('button', { className: "btn-amber w-full" }, "Sign In →")
          )
        )
      )
    ),
    React.createElement('div', { className: "text-center py-8 px-4 border-t", style: { borderColor: 'var(--rc-border)' } },
      React.createElement('div', { className: "max-w-6xl mx-auto grid md:grid-cols-3 gap-6" },
        React.createElement('div', {}, "📍 Second St, Nairobi, Kenya"),
        React.createElement('div', {}, "📞 +254 745 129233"),
        React.createElement('div', {}, "✉️ info@rayan.co.ke")
      )
    )
  );
};

// ==================== LOGIN PAGE ====================
const LoginPage = ({ role, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const configs = {
    user: { title: 'Traveller Login', icon: '👤' },
    driver: { title: 'Driver Login', icon: '🚛' },
    admin: { title: 'Admin Login', icon: '⚙️' }
  };
  const cfg = configs[role];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    let result;
    if (isSignup && role !== 'admin') {
      result = await onLogin.register(name, email, phone, password);
    } else {
      result = await onLogin.login(email, password, role);
    }
    
    if (result.success) {
      navigate(`/${role}/dashboard`);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return React.createElement('div', { className: "min-h-screen flex items-center justify-center bg-black" },
    React.createElement('div', { className: "rounded-2xl p-8 w-full max-w-md", style: { background: 'var(--rc-card)', border: '1px solid var(--rc-border)' } },
      React.createElement('div', { className: "text-center mb-6" },
        React.createElement('div', { className: "text-5xl mb-3" }, cfg.icon),
        React.createElement('h2', { className: "text-2xl font-bold syne" }, isSignup ? `Create Account` : cfg.title),
        React.createElement('p', { className: "text-gray-400 mt-2", style: { color: 'var(--rc-muted)' } }, isSignup ? "Join Rayan Coach today" : "Welcome back to Rayan Coach")
      ),
      React.createElement('form', { onSubmit: handleSubmit },
        isSignup && React.createElement('input', { 
          type: "text", 
          placeholder: "Full Name", 
          className: "rc-input mb-4", 
          value: name, 
          onChange: e => setName(e.target.value), 
          required: true 
        }),
        React.createElement('input', { 
          type: "email", 
          placeholder: "Email Address", 
          className: "rc-input mb-4", 
          value: email, 
          onChange: e => setEmail(e.target.value), 
          required: true 
        }),
        isSignup && React.createElement('input', { 
          type: "tel", 
          placeholder: "Phone Number (+254...)", 
          className: "rc-input mb-4", 
          value: phone, 
          onChange: e => setPhone(e.target.value), 
          required: true 
        }),
        React.createElement('input', { 
          type: "password", 
          placeholder: "Password", 
          className: "rc-input mb-4", 
          value: password, 
          onChange: e => setPassword(e.target.value), 
          required: true 
        }),
        error && React.createElement('p', { className: "text-red-500 text-sm mb-4" }, error),
        React.createElement('button', { 
          type: "submit", 
          className: "btn-amber w-full", 
          disabled: loading 
        }, loading ? "Processing..." : (isSignup ? "Create Account →" : "Sign In →"))
      ),
      role !== 'admin' && React.createElement('div', { className: "text-center mt-4" },
        React.createElement('button', { 
          onClick: () => setIsSignup(!isSignup), 
          className: "text-orange-500 text-sm" 
        }, isSignup ? "Already have an account? Sign In" : "New user? Create an account")
      ),
      React.createElement('button', { 
        onClick: () => navigate('/'), 
        className: "text-center text-sm mt-4 w-full", 
        style: { color: 'var(--rc-amber)' } 
      }, "← Back to Role Selection")
    )
  );
};

// ==================== DASHBOARD SHELL ====================
const DashboardShell = ({ role, children, activeTab, setActiveTab, tabs }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const roleColors = { user: '#3B82F6', driver: '#10B981', admin: '#F59E0B' };

  return React.createElement('div', { className: "flex min-h-screen bg-black" },
    React.createElement('div', { 
      style: { width: sidebarOpen ? 240 : 60, background: 'var(--rc-deep)', borderRight: '1px solid var(--rc-border)', transition: 'width 0.3s ease' } 
    },
      React.createElement('div', { className: "p-4 flex justify-between items-center" },
        sidebarOpen ? 
          React.createElement('div', { className: "flex items-center gap-2" },
            React.createElement('div', { className: "w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold" }, "RC"),
            React.createElement('span', { className: "font-bold syne" }, "Rayan Coach")
          ) : 
          React.createElement('div', { className: "w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold" }, "RC"),
        React.createElement('button', { onClick: () => setSidebarOpen(!sidebarOpen), className: "btn-ghost p-2" }, sidebarOpen ? "←" : "→")
      ),
      React.createElement('nav', { className: "p-2" },
        tabs.map(tab => 
          React.createElement('div', { 
            key: tab.id, 
            className: `sidebar-link ${activeTab === tab.id ? 'active' : ''}`, 
            onClick: () => setActiveTab(tab.id) 
          },
            React.createElement('span', null, tab.icon),
            sidebarOpen && React.createElement('span', null, tab.label)
          )
        ),
        React.createElement('div', { onClick: handleLogout, className: "sidebar-link mt-4", style: { color: 'var(--rc-red)' } },
          React.createElement('span', null, "🚪"),
          sidebarOpen && React.createElement('span', null, "Logout")
        )
      )
    ),
    React.createElement('div', { className: "flex-1" },
      React.createElement('header', { 
        className: "h-16 flex items-center justify-between px-6", 
        style: { background: 'var(--rc-deep)', borderBottom: '1px solid var(--rc-border)' } 
      },
        React.createElement('div', null,
          React.createElement('span', { className: "font-bold syne" }, tabs.find(t => t.id === activeTab)?.label),
          React.createElement('span', { className: "text-sm ml-2", style: { color: 'var(--rc-muted)' } }, `· ${role} Portal`)
        ),
        React.createElement('div', { className: "flex items-center gap-3" },
          React.createElement('div', { 
            className: "flex items-center gap-2 px-3 py-2 rounded-lg", 
            style: { background: 'var(--rc-card)', border: '1px solid var(--rc-border)' } 
          },
            React.createElement('div', { 
              className: "w-8 h-8 rounded-full flex items-center justify-center text-black font-bold", 
              style: { background: roleColors[role] } 
            }, user?.name?.charAt(0)?.toUpperCase() || 'U'),
            React.createElement('span', { className: "text-sm" }, user?.name || user?.email || 'User')
          )
        )
      ),
      React.createElement('main', { className: "p-6" }, children)
    )
  );
};

// ==================== USER DASHBOARD ====================
const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/user/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', null,
    React.createElement('div', { 
      className: "p-6 rounded-2xl mb-8", 
      style: { background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))', border: '1px solid rgba(59,130,246,0.2)' } 
    },
      React.createElement('h2', { className: "text-2xl font-bold syne" }, `Good morning, ${user?.name || 'Traveller'}! 👋`),
      React.createElement('p', { className: "text-gray-400 mt-2", style: { color: 'var(--rc-muted)' } }, `You have ${bookings.length} upcoming trips this week`)
    ),
    React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" },
      React.createElement('div', { className: "stat-card" }, 
        React.createElement('div', { className: "text-3xl mb-2" }, "🚌"),
        React.createElement('div', { className: "text-2xl font-bold syne" }, bookings.length),
        React.createElement('div', { className: "text-sm", style: { color: 'var(--rc-muted)' } }, "Bookings")
      ),
      React.createElement('div', { className: "stat-card" }, 
        React.createElement('div', { className: "text-3xl mb-2" }, "⭐"),
        React.createElement('div', { className: "text-2xl font-bold syne" }, user?.rewardPoints || 0),
        React.createElement('div', { className: "text-sm", style: { color: 'var(--rc-muted)' } }, "Reward Points")
      ),
      React.createElement('div', { className: "stat-card" }, 
        React.createElement('div', { className: "text-3xl mb-2" }, "📦"),
        React.createElement('div', { className: "text-2xl font-bold syne" }, "0"),
        React.createElement('div', { className: "text-sm", style: { color: 'var(--rc-muted)' } }, "Active Parcels")
      )
    ),
    React.createElement('div', { className: "stat-card" },
      React.createElement('h3', { className: "font-bold mb-4 syne" }, "Recent Bookings"),
      loading ? React.createElement('p', null, "Loading...") : 
      bookings.length === 0 ? 
        React.createElement('p', { className: "text-gray-400" }, "No bookings yet. Book your first trip!") :
        bookings.map(booking => 
          React.createElement('div', { key: booking.tripId, className: "border-b py-3 flex justify-between", style: { borderColor: 'var(--rc-border)' } },
            React.createElement('div', null,
              React.createElement('p', { className: "font-semibold" }, booking.route),
              React.createElement('p', { className: "text-sm", style: { color: 'var(--rc-muted)' } }, new Date(booking.departureTime).toLocaleString())
            ),
            React.createElement('span', { className: "badge badge-green" }, booking.status)
          )
        )
    )
  );
};

// ==================== BOOKING PAGE ====================
const BookingPage = () => {
  const [from, setFrom] = useState('Nairobi');
  const [to, setTo] = useState('Mombasa');
  const [date, setDate] = useState('');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchTrips = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/trips?pickup=${from}&destination=${to}&date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTrips(data);
    } catch (error) {
      console.error('Error searching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookTrip = async (trip) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/user/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tripId: trip._id, seatNumber: 'A1', passengerClass: 'standard' })
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Booking confirmed! Ticket: ${data.ticketNumber}`);
        searchTrips();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Booking failed: ' + error.message);
    }
  };

  return React.createElement('div', { className: "max-w-4xl mx-auto" },
    React.createElement('div', { className: "stat-card" },
      React.createElement('h3', { className: "text-xl font-bold mb-6 syne" }, "Book a Trip"),
      React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" },
        React.createElement('select', { className: "rc-input", value: from, onChange: e => setFrom(e.target.value) },
          ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru'].map(c => React.createElement('option', { key: c }, c))
        ),
        React.createElement('select', { className: "rc-input", value: to, onChange: e => setTo(e.target.value) },
          ['Mombasa', 'Nairobi', 'Kisumu', 'Eldoret', 'Nakuru'].map(c => React.createElement('option', { key: c }, c))
        ),
        React.createElement('input', { type: "date", className: "rc-input", value: date, onChange: e => setDate(e.target.value) })
      ),
      React.createElement('button', { className: "btn-amber w-full", onClick: searchTrips, disabled: loading },
        loading ? "Searching..." : "Search Trips →"
      ),
      trips.length > 0 && React.createElement('div', { className: "mt-6" },
        React.createElement('h4', { className: "font-bold mb-4 syne" }, "Available Trips"),
        trips.map(trip => 
          React.createElement('div', { key: trip._id, className: "border rounded-lg p-4 mb-3 flex justify-between items-center", style: { borderColor: 'var(--rc-border)' } },
            React.createElement('div', null,
              React.createElement('p', { className: "font-semibold" }, `${trip.pickupLocation} → ${trip.destination}`),
              React.createElement('p', { className: "text-sm", style: { color: 'var(--rc-muted)' } }, new Date(trip.departureTime).toLocaleString()),
              React.createElement('p', { className: "text-sm" }, `Available Seats: ${trip.availableSeats}`)
            ),
            React.createElement('div', { className: "text-right" },
              React.createElement('p', { className: "text-xl font-bold", style: { color: 'var(--rc-amber)' } }, `KES ${trip.fare}`),
              React.createElement('button', { className: "btn-amber text-sm px-4 py-2 mt-2", onClick: () => bookTrip(trip) }, "Book Now")
            )
          )
        )
      )
    )
  );
};

// ==================== MAIN APP ====================
const App = () => {
  const [userTab, setUserTab] = useState('dashboard');
  const [driverTab, setDriverTab] = useState('dashboard');
  const [adminTab, setAdminTab] = useState('dashboard');
  const auth = useContext(AuthContext);

  const userTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'booking', label: 'Book Trip', icon: '🎫' },
    { id: 'tracking', label: 'Tracking', icon: '🗺️' },
    { id: 'parcel', label: 'Parcel', icon: '📦' }
  ];

  const driverTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'trips', label: 'Trips', icon: '🚌' },
    { id: 'earnings', label: 'Earnings', icon: '💰' }
  ];

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'drivers', label: 'Drivers', icon: '👥' },
    { id: 'vehicles', label: 'Vehicles', icon: '🚌' }
  ];

  return React.createElement(AuthProvider, null,
    React.createElement(BrowserRouter, null,
      React.createElement(Routes, null,
        React.createElement(Route, { path: "/", element: React.createElement(WelcomePage, { navigate: (path) => window.location.href = path }) }),
        React.createElement(Route, { path: "/user/login", element: React.createElement(LoginPage, { role: "user", onLogin: auth }) }),
        React.createElement(Route, { path: "/driver/login", element: React.createElement(LoginPage, { role: "driver", onLogin: auth }) }),
        React.createElement(Route, { path: "/admin/login", element: React.createElement(LoginPage, { role: "admin", onLogin: auth }) }),
        
        React.createElement(Route, { path: "/user/dashboard", element: React.createElement(ProtectedRoute, { allowedRoles: ['user'] },
          React.createElement(DashboardShell, { role: "user", activeTab: userTab, setActiveTab: setUserTab, tabs: userTabs },
            userTab === 'dashboard' && React.createElement(UserDashboard, null),
            userTab === 'booking' && React.createElement(BookingPage, null),
            userTab === 'tracking' && React.createElement('div', { className: "stat-card text-center" }, React.createElement('h3', null, "Live Tracking Coming Soon"), React.createElement('p', null, "Track your bus in real-time")),
            userTab === 'parcel' && React.createElement('div', { className: "stat-card text-center" }, React.createElement('h3', null, "Send a Parcel"), React.createElement('p', null, "Parcel delivery service coming soon"))
          )
        ) }),
        
        React.createElement(Route, { path: "/driver/dashboard", element: React.createElement(ProtectedRoute, { allowedRoles: ['driver'] },
          React.createElement(DashboardShell, { role: "driver", activeTab: driverTab, setActiveTab: setDriverTab, tabs: driverTabs },
            driverTab === 'dashboard' && React.createElement('div', { className: "stat-card" }, React.createElement('h3', { className: "font-bold syne" }, "Driver Dashboard"), React.createElement('p', null, "Welcome, Driver!")),
            driverTab === 'trips' && React.createElement('div', { className: "stat-card" }, React.createElement('h3', null, "Assigned Trips"), React.createElement('p', null, "No trips assigned yet")),
            driverTab === 'earnings' && React.createElement('div', { className: "stat-card" }, React.createElement('h3', null, "Earnings"), React.createElement('p', { className: "text-2xl font-bold text-green-500" }, "KES 0"))
          )
        ) }),
        
        React.createElement(Route, { path: "/admin/dashboard", element: React.createElement(ProtectedRoute, { allowedRoles: ['admin'] },
          React.createElement(DashboardShell, { role: "admin", activeTab: adminTab, setActiveTab: setAdminTab, tabs: adminTabs },
            adminTab === 'dashboard' && React.createElement('div', { className: "stat-card" }, React.createElement('h3', { className: "font-bold syne" }, "Admin Dashboard"), 
              React.createElement('div', { className: "grid grid-cols-3 gap-4 mt-4" },
                React.createElement('div', null, React.createElement('div', { className: "text-2xl font-bold" }, "0"), React.createElement('div', { className: "text-sm", style: { color: 'var(--rc-muted)' } }, "Active Trips")),
                React.createElement('div', null, React.createElement('div', { className: "text-2xl font-bold" }, "0"), React.createElement('div', { className: "text-sm", style: { color: 'var(--rc-muted)' } }, "Drivers")),
                React.createElement('div', null, React.createElement('div', { className: "text-2xl font-bold" }, "KES 0"), React.createElement('div', { className: "text-sm", style: { color: 'var(--rc-muted)' } }, "Revenue"))
              )
            ),
            adminTab === 'drivers' && React.createElement('div', { className: "stat-card" }, React.createElement('h3', null, "Driver Management"), React.createElement('p', null, "No drivers registered yet")),
            adminTab === 'vehicles' && React.createElement('div', { className: "stat-card" }, React.createElement('h3', null, "Fleet Management"), React.createElement('p', null, "No vehicles registered yet"))
          )
        ) })
      )
    )
  );
};

// ==================== RENDER APP ====================
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));