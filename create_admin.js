const { createClient } = require('@supabase/supabase-js');

// This script attempts to sign up the user. 
// If email confirmation is ON, the user will need to click a link.
// If it's OFF, the user is created immediately.
// Note: This uses the ANON key, so it can't set the role directly in auth.users.
// My trigger handle_new_user() will set role='cliente' by default.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createAdmin() {
    console.log('Intentando crear usuario: paula@novu360.com...');
    
    const { data, error } = await supabase.auth.signUp({
        email: 'paula@novu360.com',
        password: 'Novu360_Admin2026',
        options: {
            data: {
                full_name: 'Paula Admin'
            }
        }
    });

    if (error) {
        console.error('Error al crear usuario:', error.message);
    } else {
        console.log('Usuario creado (o pendiente de confirmación):', data.user.id);
        console.log('IMPORTANTE: Si la confirmación de email está activa, Paula debe revisar su correo.');
        console.log('Para convertirla en admin, ejecuta el SQL proporcionado en el reporte.');
    }
}

createAdmin();
