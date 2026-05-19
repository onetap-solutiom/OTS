/**
 * api.js — Shared data layer for OneTap Solution
 * Reads from the same localStorage store the Admin panel writes to.
 * This means any change an admin makes is instantly visible to customers.
 */

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;


export async function getProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects/`);
    const result = await res.json();
    if (result.success && result.data) {
      return result.data.map(p => ({
        id: p.id,
        title: p.name || p.title,
        category: p.category || 'Web Development',
        desc: p.desc || p.description || '',
        image: p.image || p.img || '',
        url: p.url || p.demo_link || '#',
        github_link: p.github_link || p.github || '',
        deadline: p.deadline || '',
        progress: p.progress || 0,
        client: p.client || ''
      }));
    }
  } catch (e) {
    console.error('api.js: failed to fetch projects', e);
  }
  return [];
}

export async function getServices() {
  try {
    const res = await fetch(`${API_BASE}/services/`);
    const result = await res.json();
    if (result.success && result.data) {
      return result.data.filter(s => s.status !== 'Inactive');
    }
  } catch (e) {
    console.error('api.js: failed to fetch services', e);
  }
  return [];
}

export async function getTestimonials() {
  try {
    const res = await fetch(`${API_BASE}/testimonials/`);
    const result = await res.json();
    if (result.success && result.data) {
      return result.data;
    }
  } catch (e) {
    console.error('api.js: failed to fetch testimonials', e);
  }
  return [];
}

export async function getTeam() {
  try {
    const res = await fetch(`${API_BASE}/team/`);
    const result = await res.json();
    if (result.success && result.data) {
      return result.data;
    }
  } catch (e) {
    console.error('api.js: failed to fetch team', e);
  }
  return [];
}

export async function getStats() {
  try {
    const res = await fetch(`${API_BASE}/stats/public`);
    const result = await res.json();
    if (result.success && result.data) {
      return result.data;
    }
  } catch (e) {
    console.error('api.js: failed to fetch stats', e);
  }
  return { projects: 1, clients: 20, services: 7, satisfaction: 3 };
}

export async function getNews() {
  try {
    const res = await fetch(`${API_BASE}/news/`);
    const result = await res.json();
    if (result.success && result.data) {
      return result.data.filter(n => n.status === 'Published');
    }
  } catch (e) {
    console.error('api.js: failed to fetch news', e);
  }
  return [];
}

/**
 * Submit a contact message directly to MySQL backend
 */
export async function submitContactMessage({ name, email, subject, message }) {
  try {
    const response = await fetch(`${API_BASE}/contact/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, subject, message })
    });
    const result = await response.json();
    return { success: response.ok && result.success, message: result.message };
  } catch (e) {
    console.error('api.js: failed to save message', e);
    return { success: false, message: 'Server connection failed' };
  }
}

/**
 * Subscribe to the newsletter directly in MySQL
 */
export async function subscribeNewsletter(email) {
  try {
    const response = await fetch(`${API_BASE}/newsletter/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await response.json();
    return { success: response.ok && result.success, message: result.message };
  } catch (e) {
    console.error('api.js: failed to subscribe to newsletter', e);
    return { success: false, message: 'Server connection failed' };
  }
}

/**
 * Fetch global site settings from MySQL database
 */
export async function getSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings/`);
    const result = await res.json();
    if (result.success && result.data) {
      return result.data;
    }
  } catch (e) {
    console.error('api.js: failed to fetch settings', e);
  }
  // Fallback defaults
  return {
    company_email: 'info@onetapsolution.com',
    contact_phone: '+252 61 9586339',
    office_location: 'Mogadishu, Somalia'
  };
}
