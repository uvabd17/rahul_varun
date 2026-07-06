const MEMBERS = ['Alice', 'Bob', 'Charlie', 'David', 'Emma'];

const CATEGORIES = [
  { name: 'Food',          icon: '🍕', color: '#f97316' },
  { name: 'Travel',        icon: '🚖', color: '#3b82f6' },
  { name: 'Shopping',      icon: '🛍️', color: '#ec4899' },
  { name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
  { name: 'Bills',         icon: '💡', color: '#10b981' },
  { name: 'Others',        icon: '📦', color: '#6b7280' }
];

const CATEGORY_NAMES = CATEGORIES.map(c => c.name);

const getCategoryInfo = (name) =>
  CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1];

const getCategoryIcon  = (name) => getCategoryInfo(name).icon;
const getCategoryColor = (name) => getCategoryInfo(name).color;

const formatMoney = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const todayISO = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const escapeHtml = (s) => String(s ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const getQueryParam = (key) => new URLSearchParams(window.location.search).get(key);
