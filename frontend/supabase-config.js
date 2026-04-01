// Supabase Configuration
const SUPABASE_URL = "https://puaxpnphkmscskzliyev.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1YXhwbnBoa21zY3NremxpeWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODYxOTQsImV4cCI6MjA5MDQ2MjE5NH0.kc3LU0bRyYf44eWsE6A91KfQSDdwlvwqHm69BreaGes";

// Initialize Supabase client
const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make available globally
window.supabase = supabase;

console.log('Supabase initialized');