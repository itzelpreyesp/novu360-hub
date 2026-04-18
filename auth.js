// NOVU 360 HUB - auth.js
// Handles Supabase authentication and role-based redirection

console.log('auth.js loaded');

async function getSupabaseClient(maxWaitMs = 6000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (window.supabaseClient) return window.supabaseClient;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Supabase no esta listo. Revisa config.js o deploy.');
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = loginForm.querySelector('#email')?.value?.trim() || '';
      const password = loginForm.querySelector('#password')?.value || '';
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

      if (!email || !password) {
        alert('Completa correo y contrasena.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">sync</span> Autenticando...';
      }

      try {
        const client = await getSupabaseClient();

        let { data: authData, error: authError } = await client.auth.signInWithPassword({
          email,
          password
        });

        if (authError && String(authError.message || '').includes('Invalid login credentials')) {
          const { error: signUpError } = await client.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: email.split('@')[0] }
            }
          });

          if (signUpError) throw signUpError;

          const retry = await client.auth.signInWithPassword({ email, password });
          authData = retry.data;
          authError = retry.error;
        }

        if (authError) throw authError;

        const user = authData?.user;
        if (!user?.id) throw new Error('No se pudo recuperar el usuario autenticado.');

        const { data: roleRecord, error: roleError } = await client
          .from('usuario_roles')
          .select('rol')
          .eq('usuario_id', user.id)
          .maybeSingle();

        if (roleError) throw roleError;

        const rol = roleRecord?.rol || 'admin';

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

        window.location.href = redirectPath;
      } catch (error) {
        console.error('Auth error:', error);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
        alert('Error: ' + (error?.message || 'Error desconocido'));
      }
    });
  }

  const googleBtn = Array.from(document.querySelectorAll('button')).find(
    (btn) => (btn.innerText || '').includes('Google')
  );

  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        const client = await getSupabaseClient();
        const { error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/dashboard.html'
          }
        });

        if (error) throw error;
      } catch (err) {
        console.error('Google OAuth error:', err);
        alert('Error con Google: ' + (err?.message || 'No se pudo iniciar sesion.'));
      }
    });
  }
});

async function checkAuth() {
  try {
    const client = await getSupabaseClient();
    const { data: { session } } = await client.auth.getSession();
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';

    if (!session && !isLoginPage) {
      window.location.href = 'index.html';
    }

    return session;
  } catch (e) {
    console.error('checkAuth error:', e);
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    if (!isLoginPage) {
      window.location.href = 'index.html';
    }
    return null;
  }
}
