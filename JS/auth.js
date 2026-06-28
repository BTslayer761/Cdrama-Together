/**
 * js/auth.js
 * Auth helpers shared across all pages.
 * Depends on: config.js, supabase-client.js (db)
 */

async function signUpWithEmail(email, password) {
  return db.auth.signUp({ email, password });
}

async function signInWithEmail(email, password) {
  return db.auth.signInWithPassword({ email, password });
}

async function signInWithGoogle() {
  // redirectTo must be an allowed URL in your Supabase project → Auth → URL Configuration
  const redirectTo = window.location.href.includes('/pages/')
    ? window.location.href.replace(/\/pages\/.*/, '/index.html')
    : window.location.origin + '/index.html';

  return db.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
}

async function handleSignOut() {
  await db.auth.signOut();
  const atRoot = !window.location.pathname.includes('/pages/');
  window.location.href = atRoot ? 'index.html' : '../index.html';
}

async function getCurrentUser() {
  const { data: { user } } = await db.auth.getUser();
  return user;
}

// Updates the #nav-auth div to show avatar + sign-out when logged in.
async function updateNavAuth() {
  const user = await getCurrentUser();
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;

  if (user) {
    const raw   = user.user_metadata?.full_name || user.email || '';
    const parts = raw.trim().split(/\s+/);
    const initials = (parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : raw.slice(0, 2)
    ).toUpperCase();

    navAuth.innerHTML = `
      <a href="${window.location.pathname.includes('/pages/') ? '' : 'pages/'}my-list.html"
         class="btn btn-ghost">My List</a>
      <span class="nav-avatar" title="${user.email}">${initials}</span>
      <button class="btn btn-ghost" onclick="handleSignOut()">Sign out</button>
    `;
  }
}
