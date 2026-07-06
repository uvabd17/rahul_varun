const NAV_ITEMS = [
  { key: 'add',     href: 'add-expense.html',       label: 'Add Expense', icon: '➕' },
  { key: 'display', href: 'display-expenses.html',  label: 'Expenses',    icon: '📋' },
  { key: 'split',   href: 'split-calculation.html', label: 'Split',       icon: '🧮' },
  { key: 'balance', href: 'balance-summary.html',   label: 'Balances',    icon: '⚖️' },
  { key: 'reports', href: 'reports.html',           label: 'Reports',     icon: '📊' }
];

const mountNav = (active) => {
  const header = document.createElement('header');
  header.className = 'topbar';
  header.innerHTML = `
    <div class="topbar-inner">
      <a class="brand" href="add-expense.html">
        <span class="brand-icon">💸</span>
        <span class="brand-text">Splitwise-ish</span>
      </a>
      <button class="nav-toggle" aria-label="Toggle menu">☰</button>
      <nav class="nav-menu">
        <ul>
          ${NAV_ITEMS.map(item => `
            <li>
              <a href="${item.href}" class="${active === item.key ? 'active' : ''}">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
              </a>
            </li>
          `).join('')}
        </ul>
      </nav>
    </div>
  `;
  document.body.prepend(header);

  const toggle = header.querySelector('.nav-toggle');
  const menu   = header.querySelector('.nav-menu');
  toggle.addEventListener('click', () => menu.classList.toggle('open'));

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
};

// forward cross-tab storage events into our in-page event
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    window.dispatchEvent(new CustomEvent('expenses-updated'));
  }
});
