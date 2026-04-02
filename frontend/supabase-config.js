// supabase-config.js
const SUPABASE_URL = "https://puaxpnphkmscskzliyev.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1YXhwbnBoa21zY3NremxpeWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4ODYxOTQsImV4cCI6MjA5MDQ2MjE5NH0.kc3LU0bRyYf44eWsE6A91KfQSDdwlvwqHm69BreaGes";

// Check if supabase is already defined
if (typeof window.supabase === 'undefined') {
    // Create the client
    const supabaseClient = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabase = supabaseClient;
    console.log('Supabase initialized');
} else {
    console.log('Supabase already initialized');
}