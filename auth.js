// NOVU 360 HUB - auth.js
// Handles Supabase authentication and role-based redirection

const supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = loginForm.querySelector('#email').value;
            const password = loginForm.querySelector('#password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            // Show loading state
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">sync</span> Autenticando...';
            
            try {
                // 1. Authenticate with Supabase
                const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (authError) throw authError;
                
                const user = authData.user;
                
                // 2. Fetch profile to determine role
                const { data: profile, error: profileError } = await supabase
                    .from('usuarios')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                
                if (profileError) throw profileError;
                
                // 3. Determine redirect path based on role
                let redirectPath = 'dashboard.html'; // Default
                const role = profile.role || 'cliente';
                
                switch (role) {
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
                    case 'cliente':
                        redirectPath = 'portal-cliente.html';
                        break;
                }
                
                // Show success toast or just redirect
                console.log(`✅ Autenticación exitosa. Rol: ${role}. Redirigiendo a ${redirectPath}...`);
                window.location.href = redirectPath;
                
            } catch (error) {
                console.error('❌ Error de autenticación:', error);
                
                // Show error state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                // Show error message (simple alert for now to avoid styling deps)
                alert(`Error al iniciar sesión: ${error.message || 'Verifica tus credenciales'}`);
            }
        });
    }
});

// Helper function to check session on other pages
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
    }
    return session;
}

// Support Google OAuth if button exists
const googleBtn = document.querySelector('button:has(svg)');
if (googleBtn && googleBtn.innerText.includes('Google')) {
    googleBtn.addEventListener('click', async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/dashboard.html'
            }
        });
        if (error) alert(`Error con Google: ${error.message}`);
    });
}
