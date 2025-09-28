import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wuwaakidyyxpywbxjwmn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1d2Fha2lkeXl4cHl3Ynhqd21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Mzc0MTUsImV4cCI6MjA3NDQxMzQxNX0.aFVog2s_f9VOKdBWsvUXHY-eU8ZeNM3cPMGjQHHZNiI";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase