import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Logs a verification attempt to the verification_logs table.
 *
 * @param {string} userId - The ID of the user attempting verification.
 * @param {boolean} success - Whether the verification attempt was successful.
 * @param {string} message - Additional message regarding the verification attempt.
 */
async function logVerificationAttempt(userId, success, message = '') {
    const { data, error } = await supabase
        .from('verification_logs')
        .insert([{ user_id: userId, success, message, created_at: new Date().toISOString() }]);

    if (error) {
        console.error('Error logging verification attempt:', error);
    } else {
        console.log('Verification attempt logged:', data);
    }
}

export default logVerificationAttempt;