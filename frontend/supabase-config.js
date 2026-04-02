// supabase-config.js
const SUPABASE_URL = "https://puaxpnphkmscskzliyev.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1YXhwbnBoa21zY3NremxpeWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODYxOTQsImV4cCI6MjA5MDQ2MjE5NH0.kc3LU0bRyYf44eWsE6A91KfQSDdwlvwqHm69BreaGes";

// Check if supabase is already defined globally
if (typeof window.supabase === 'undefined') {
    // Initialize Supabase client with custom storage
    window.supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            storage: {
                getItem: (key) => {
                    return sessionStorage.getItem(key) || localStorage.getItem(key);
                },
                setItem: (key, value) => {
                    sessionStorage.setItem(key, value);
                    localStorage.setItem(key, value);
                },
                removeItem: (key) => {
                    sessionStorage.removeItem(key);
                    localStorage.removeItem(key);
                }
            },
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
}

console.log('Supabase initialized with isolated session storage');