// NOVU 360 HUB - auth.js
// Handles Supabase authentication and role-based redirection

console.log('🚀 auth.js cargado correctamente.');

// The supabaseClient is already initialized in config.js
// Use window.supabaseClient throughout the script

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, buscando formulario de login...');
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        console.log('✅ Formulario #login-form encontrado.');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('📩 Evento submit capturado.');
            
            const email = loginForm.querySelector('#email').value;
            const password = loginForm.querySelector('#password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            console.log(`🔍 Intentando login para: ${email}`);
            
            // Show loading state
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">sync</span> Autenticando...';
            
            try {
                // 1. Authenticate with Supabase
                console.log('📡 Llamando a signInWithPassword...');
                let { data: authData, error: authError } = await window.supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });
                
                // 2. Automatic Registration if user doesn't exist
                if (authError && authError.message.includes('Invalid login credentials')) {
                    console.warn('⚠️ Usuario no encontrado o credenciales inválidas. Intentando registro automático...');
                    
                    const { data: signUpData, error: signUpError } = await window.supabaseClient.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                full_name: email.split('@')[0]
                            }
                        }
                    });
                    
                    if (signUpError) {
                        console.error('❌ Error en registro automático:', signUpError);
                        throw signUpError;
                    }
                    
                    console.log('✨ Usuario registrado exitosamente. Re-intentando login...');
                    // Retry sign in after sign up
                    const retry = await window.supabaseClient.auth.signInWithPassword({ email, password });
                    authData = retry.data;
                    authError = retry.error;
                }

                if (authError) {
                    console.error('❌ Error final de autenticación:', authError);
                    throw authError;
                }
                
                const user = authData.user;
                console.log('👤 Usuario autenticado:', user.id);
                
                // 3. Fetch profile to determine role (from usuario_roles table)
                console.log('📡 Buscando rol del usuario en usuario_roles...');
                const { data: roleRecord, error: roleError } = await window.supabaseClient
                    .from('usuario_roles')
                    .select('rol')
                    .eq('usuario_id', user.id)
                    .maybeSingle(); 
                
                if (roleError) {
                    console.error('❌ Error al obtener rol:', roleError);
                    throw roleError;
                }
                
                // 4. Determine redirect path based on role
                const rol = roleRecord?.rol || 'admin'; 
                console.log(`🎯 Rol detectado: ${rol}`);
                
                let redirectPath = 'dashboard.html'; 
                
                switch (rol) {
                    case 'admin':
                        redirectPath = 'dashboard.html';
                        break;
                    case 'ventas':
                        redirectPath = 'ventas.html';
                        break;
                    case 'ads':
                        redirectPath = 'ads.html';
                        break;
                    case 'community':
                        redirectPath = 'community.html';
                        break;
                    case 'seo':
                        redirectPath = 'seo.html';
                        break;
                    case 'web':
                        redirectPath = 'web.html';
                        break;
                    case 'account':
                        redirectPath = 'dashboard.html';
                        break;
                    case 'finanzas':
                        redirectPath = 'finanzas.html';
                        break;
                    default:
                        redirectPath = 'dashboard.html';
                }
                
                console.log(`🚀 Redirigiendo a ${redirectPath}...`);
                window.location.href = redirectPath;
                
            } catch (error) {
                console.error('💀 ERROR CRÍTICO:', error);
                
                // Show error state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                // Show error message
                alert(`Error: ${error.message || 'Error desconocido'}`);
            }
        });
    } else {
        console.error('❌ No se encontró el formulario #login-form en este documento.');
    }
});

// Helper function to check session on other pages
async function checkAuth() {
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session && !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
    }
    return session;
}

// Support Google OAuth if button exists
const googleBtn = document.querySelector('button:has(svg)');
if (googleBtn && googleBtn.innerText.includes('Google')) {
    googleBtn.addEventListener('click', async () => {
        console.log('🔵 Iniciando Google OAuth...');
        const { error } = await window.supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/dashboard.html'
            }
        });
        if (error) {
            console.error('❌ Error Google OAuth:', error);
            alert(`Error con Google: ${error.message}`);
        }
    });
}
