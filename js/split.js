const initSplitPage = () => {
  const wrap = document.getElementById('split-wrap');
  if (!wrap) return;

  const render = () => {
    const expenses = loadExpenses();
    const totalEl = document.getElementById('overall-total');

    if (expenses.length === 0) {
      wrap.innerHTML = `
        <div class="panel">
          <div class="empty-state">
            <span class="icon">🧮</span>
            <h3>Nothing to split</h3>
            <p>Add an expense first and it'll show up here grouped by category.</p>
            <a class="btn" href="add-expense.html">Add Expense</a>
          </div>
        </div>`;
      totalEl.textContent = formatMoney(0);
      return;
    }

    const grouped = {};
    expenses.forEach(e => {
      if (!grouped[e.category]) grouped[e.category] = [];
      grouped[e.category].push(e);
    });

    let overall = 0;

    const html = CATEGORIES.map(cat => {
      const list = grouped[cat.name];
      if (!list || list.length === 0) return '';

      const catTotal = list.reduce((s, e) => s + Number(e.amount), 0);
      overall += catTotal;

      const expenseCards = list.map(e => {
        const share = Number(e.amount) / e.sharedBy.length;
        const debts = e.sharedBy
          .filter(m => m !== e.paidBy)
          .map(m => `<li><strong>${escapeHtml(m)}</strong> → <strong>${escapeHtml(e.paidBy)}</strong> : <span class="pay-amt">${formatMoney(share)}</span></li>`)
          .join('');

        return `
          <article class="expense-card" style="border-left-color:${cat.color}">
            <h4>${escapeHtml(e.expense)}</h4>
            <dl class="expense-meta">
              <div><dt>Amount</dt><dd>${formatMoney(e.amount)}</dd></div>
              <div><dt>Paid By</dt><dd>${escapeHtml(e.paidBy)}</dd></div>
              <div><dt>Date</dt><dd>${formatDate(e.date)}</dd></div>
            </dl>
            <div class="members-row">
              <span class="label">Members:</span>
              ${e.sharedBy.map(m => `<span class="chip">${escapeHtml(m)}</span>`).join('')}
            </div>
            <div class="share-box" style="background:${cat.color}15;color:${cat.color}">
              <span>Share Per Person</span>
              <strong>${formatMoney(share)}</strong>
            </div>
            ${debts ? `
              <div class="owes-block">
                <h5>Who Owes Whom</h5>
                <ul>${debts}</ul>
              </div>
            ` : `<p class="muted small">${escapeHtml(e.paidBy)} covered their own share — nobody owes anyone.</p>`}
          </article>
        `;
      }).join('');

      return `
        <details class="category-card" open style="--cat-color:${cat.color}">
          <summary>
            <span class="cat-title">
              <span class="cat-icon" style="background:${cat.color}22">${cat.icon}</span>
              ${cat.name}
              <span class="count">(${list.length})</span>
            </span>
            <span class="cat-total">${formatMoney(catTotal)}</span>
          </summary>
          <div class="category-body">
            ${expenseCards}
            <div class="cat-total-row">${cat.name} Total <strong>${formatMoney(catTotal)}</strong></div>
          </div>
        </details>
      `;
    }).join('');

    wrap.innerHTML = html || `<div class="panel"><p class="empty">No expenses match.</p></div>`;
    totalEl.textContent = formatMoney(overall);
  };

  window.addEventListener('expenses-updated', render);
  render();
};

document.addEventListener('DOMContentLoaded', initSplitPage);
