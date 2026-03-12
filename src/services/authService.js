/**
 * authService.js
 * Handles all authentication logic: registration, login, Google OAuth, email validation.
 * Uses localStorage as the database.
 */

const USERS_KEY = 'framelab_users';
const SESSION_KEY = 'framelab_session';

// ---------- Helpers ----------

const getUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getSession = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
};

export const saveSession = (user) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

// ---------- Email Validation ----------

export const validateEmailFormat = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Uses disify.com – free, no API key needed
export const validateEmailReal = async (email) => {
  if (!validateEmailFormat(email)) return false;

  const domain = email.split('@')[1].toLowerCase();
  const majorProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'me.com', 'live.com', 'msn.com'];
  
  // If it's a major provider, we trust it immediately
  if (majorProviders.includes(domain)) return true;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const res = await fetch(`https://disify.com/api/email/${encodeURIComponent(email)}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) return true; // If API is down, allow it
    
    const data = await res.json();
    // Only block if 'disposable' is explicitly true and it's NOT a major provider
    return data.disposable !== true;
  } catch (err) {
    // If API fails or times out, fall back to format check only
    console.warn('Email validation service unavailable, falling back to format check.');
    return true;
  }
};

// ---------- Get Avatar From Email (Gravatar) ----------

export const getGravatarUrl = (email) => {
  // We use ui-avatars as a fallback since Gravatar needs MD5
  const name = email.split('@')[0].replace(/[._-]/g, '+');
  return `https://ui-avatars.com/api/?name=${name}&background=1c1917&color=e3a659&bold=true&size=128`;
};

// ---------- Password Hashing (simple, client-side) ----------

export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'framelab_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// ---------- Register ----------

export const registerUser = async (name, email, password) => {
  const users = getUsers();

  // Check duplicate email
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('هذا البريد الإلكتروني مستخدم بالفعل. الرجاء استخدام بريد آخر.');
  }

  // Validate email is real
  const isReal = await validateEmailReal(email);
  if (!isReal) {
    throw new Error('البريد الإلكتروني غير صالح أو مؤقت. الرجاء استخدام بريد حقيقي.');
  }

  const hashedPassword = await hashPassword(password);

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    avatar: getGravatarUrl(email),
    provider: 'email',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Create session without password
  const session = { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar, provider: newUser.provider };
  saveSession(session);
  return session;
};

// ---------- Login ----------

export const loginUser = async (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) throw new Error('لم يتم العثور على حساب بهذا البريد الإلكتروني.');
  if (user.provider === 'google') throw new Error('هذا الحساب مسجل عبر Google. الرجاء تسجيل الدخول بـ Google.');

  const hashedPassword = await hashPassword(password);
  if (user.password !== hashedPassword) throw new Error('كلمة المرور غير صحيحة.');

  const session = { id: user.id, name: user.name, email: user.email, avatar: user.avatar, provider: user.provider };
  saveSession(session);
  return session;
};

// ---------- Google Sign In ----------

export const loginWithGoogle = (googleUser) => {
  /**
   * googleUser = decoded JWT payload from Google
   * Contains: sub, name, email, picture
   */
  const users = getUsers();
  const email = googleUser.email.toLowerCase();

  let user = users.find(u => u.email === email);

  if (!user) {
    // New user from Google – auto-register
    user = {
      id: `google_${googleUser.sub}`,
      name: googleUser.name,
      email,
      password: null,
      avatar: googleUser.picture, // Google profile picture
      provider: 'google',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
  } else {
    // Update avatar in case Google pic changed
    user.avatar = googleUser.picture;
    saveUsers(users);
  }

  const session = { id: user.id, name: user.name, email: user.email, avatar: user.avatar, provider: user.provider };
  saveSession(session);
  return session;
};
