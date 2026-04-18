// ─────────────────────────────────────────────────────────────────
//  SOWO.JS  –  shared app logic (Supabase client, auth, helpers)
//  Include AFTER config.js and the Supabase CDN script
// ─────────────────────────────────────────────────────────────────

/* ── Supabase client ─────────────────────────────────────────── */
const { createClient } = supabase;
const _sbConfigured = SOWO_CONFIG.supabase.url !== 'YOUR_SUPABASE_URL';

// Stub used when credentials are not yet set — keeps all pages functional
function _sbStubChain() {
  const notConfigured = { data: null, error: { message: 'Supabase not configured' } };
  const chain = {
    select:  () => chain,
    insert:  () => chain,
    upsert:  () => chain,
    update:  () => chain,
    delete:  () => chain,
    eq:      () => chain,
    neq:     () => chain,
    order:   () => chain,
    range:   () => chain,
    limit:   () => chain,
    single:  () => Promise.resolve(notConfigured),
    ilike:   () => chain,
    or:      () => chain,
    then:    (fn) => Promise.resolve({ data: [], error: null, count: 0 }).then(fn),
  };
  return chain;
}

const _sbStub = {
  auth: {
    getUser:               () => Promise.resolve({ data: { user: null } }),
    getSession:            () => Promise.resolve({ data: { session: null } }),
    signUp:                () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signInWithPassword:    () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signOut:               () => Promise.resolve({}),
    onAuthStateChange:     () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOAuth:       () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ error: null }),
    updateUser:            () => Promise.resolve({ error: null }),
  },
  from:    () => _sbStubChain(),
  storage: { from: () => ({ upload: () => Promise.resolve({ error: null }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
};

const sb = _sbConfigured
  ? createClient(SOWO_CONFIG.supabase.url, SOWO_CONFIG.supabase.anonKey)
  : _sbStub;

/* ── Auth helpers ────────────────────────────────────────────── */
const Auth = {

  async signUp(email, password, fullName) {
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    await sb.auth.signOut();
    window.location.href = '/';
  },

  async getUser() {
    const { data: { user } } = await sb.auth.getUser();
    return user;
  },

  async getSession() {
    const { data: { session } } = await sb.auth.getSession();
    return session;
  },

  onStateChange(cb) {
    return sb.auth.onAuthStateChange(cb);
  },

  async requireAuth() {
    const user = await Auth.getUser();
    if (!user) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return null;
    }
    return user;
  },
};

/* ── Profile helpers ─────────────────────────────────────────── */
const Profiles = {

  async get(userId) {
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async upsert(userId, fields) {
    const { data, error } = await sb
      .from('profiles')
      .upsert({ id: userId, ...fields, updated_at: new Date() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

/* ── Provider helpers ────────────────────────────────────────── */
const Providers = {

  async list({ category, query, limit = 20, offset = 0 } = {}) {
    let q = sb
      .from('providers')
      .select(`
        *,
        profiles ( id, full_name, avatar_url, location ),
        services ( id, name, price, duration_hours )
      `)
      .eq('available', true)
      .order('vouch_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') q = q.eq('category', category);
    if (query) q = q.or(`bio.ilike.%${query}%,category.ilike.%${query}%`);

    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },

  async get(providerId) {
    const { data, error } = await sb
      .from('providers')
      .select(`
        *,
        profiles ( id, full_name, avatar_url, location, phone ),
        services ( * ),
        vouches ( *, profiles ( full_name, avatar_url ) )
      `)
      .eq('id', providerId)
      .single();
    if (error) throw error;
    return data;
  },

  async create(userId, fields) {
    // Mark profile as provider
    await Profiles.upsert(userId, { is_provider: true });
    const { data, error } = await sb
      .from('providers')
      .upsert({ id: userId, ...fields })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async addService(providerId, service) {
    const { data, error } = await sb
      .from('services')
      .insert({ provider_id: providerId, ...service })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

/* ── Booking helpers ─────────────────────────────────────────── */
const Bookings = {

  async create({ consumerId, providerId, serviceId, date, time, message, totalAmount }) {
    const { data, error } = await sb
      .from('bookings')
      .insert({
        consumer_id:   consumerId,
        provider_id:   providerId,
        service_id:    serviceId,
        date, time, message,
        total_amount:  totalAmount,
        status:        'pending',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async listForConsumer(userId) {
    const { data, error } = await sb
      .from('bookings')
      .select(`
        *,
        providers ( *, profiles ( full_name, avatar_url ) ),
        services ( name, price )
      `)
      .eq('consumer_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async listForProvider(userId) {
    const { data, error } = await sb
      .from('bookings')
      .select(`
        *,
        profiles!bookings_consumer_id_fkey ( full_name, avatar_url ),
        services ( name, price )
      `)
      .eq('provider_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateStatus(bookingId, status) {
    const { data, error } = await sb
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

/* ── Vouch helpers ───────────────────────────────────────────── */
const Vouches = {

  async create({ authorId, providerId, bookingId, rating, text }) {
    const { data, error } = await sb
      .from('vouches')
      .insert({ author_id: authorId, provider_id: providerId, booking_id: bookingId, rating, text })
      .select()
      .single();
    if (error) throw error;

    // Update provider rating + count
    const { data: vList } = await sb
      .from('vouches')
      .select('rating')
      .eq('provider_id', providerId);
    if (vList) {
      const avg = (vList.reduce((s, v) => s + v.rating, 0) / vList.length).toFixed(1);
      await sb.from('providers').update({ rating: avg, vouch_count: vList.length }).eq('id', providerId);
    }
    return data;
  },

  async listForProvider(providerId, limit = 10) {
    const { data, error } = await sb
      .from('vouches')
      .select(`*, profiles!vouches_author_id_fkey ( full_name, avatar_url )`)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },
};

/* ── Storage helpers ─────────────────────────────────────────── */
const Storage = {
  async uploadAvatar(userId, file) {
    const ext  = file.name.split('.').pop();
    const path = `avatars/${userId}.${ext}`;
    const { error } = await sb.storage.from('media').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = sb.storage.from('media').getPublicUrl(path);
    return data.publicUrl;
  },
};

/* ── UI helpers ──────────────────────────────────────────────── */
const UI = {

  toast(msg, type = 'info') {
    const el = document.createElement('div');
    el.className = `sowo-toast sowo-toast--${type}`;
    el.textContent = msg;
    el.style.cssText = `
      position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);
      background:${type==='error'?'#c0392b':type==='success'?'#085041':'#0A0A0A'};
      color:#fff;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:500;
      z-index:9999;opacity:0;transition:all .3s cubic-bezier(.16,1,.3,1);
      box-shadow:0 8px 32px rgba(0,0,0,.35);max-width:90vw;text-align:center
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => el.remove(), 300);
    }, 3500);
  },

  setLoading(btn, loading) {
    if (loading) {
      btn._origText = btn.innerHTML;
      btn.innerHTML = '<span class="spin"></span>';
      btn.disabled  = true;
    } else {
      btn.innerHTML = btn._origText;
      btn.disabled  = false;
    }
  },

  formatPrice(pence) {
    return '£' + (pence / 100).toFixed(2);
  },

  formatDate(d) {
    return new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  },

  stars(n) {
    return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
  },

  initReveal() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.r').forEach(el => io.observe(el));
  },

  initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('up', window.scrollY > 10);
    }, { passive: true });

    const ham = document.querySelector('.ham');
    const mob = document.querySelector('.mob');
    if (ham && mob) {
      ham.addEventListener('click', () => {
        ham.classList.toggle('o');
        mob.classList.toggle('o');
      });
    }
  },

  async updateNavForAuth() {
    const user = await Auth.getUser();
    const navR = document.querySelector('.nav-r');
    if (!navR) return;
    if (user) {
      navR.innerHTML = `
        <a href="/dashboard" class="btn btn-sm b-amber">Dashboard</a>
        <button onclick="Auth.signOut()" class="btn btn-sm g-dark">Log out</button>
      `;
    }
  },
};

/* ── Categories ──────────────────────────────────────────────── */
const CATEGORIES = [
  'Beauty & Makeup','Nail Technician','Hairdresser','Barber','Private Chef',
  'Massage Therapist','Lash Technician','Skincare & Facials','Photographer','Personal Trainer',
];

/* ── Auto-init on DOMContentLoaded ──────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  UI.initNav();
  UI.initReveal();
  UI.updateNavForAuth();
});
