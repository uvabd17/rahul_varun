const computeBalances = (expenses) => {
  const paid  = Object.fromEntries(MEMBERS.map(m => [m, 0]));
  const share = Object.fromEntries(MEMBERS.map(m => [m, 0]));

  expenses.forEach(e => {
    paid[e.paidBy] += Number(e.amount);
    const s = Number(e.amount) / e.sharedBy.length;
    e.sharedBy.forEach(m => { share[m] += s; });
  });

  return MEMBERS.map(m => ({
    member: m,
    paid:    paid[m],
    share:   share[m],
    balance: paid[m] - share[m]
  }));
};

// net out reciprocal debts: if A owes B ₹100 and B owes A ₹40, show A → B ₹60
const computeDebts = (expenses) => {
  const owes = {};
  MEMBERS.forEach(a => {
    owes[a] = {};
    MEMBERS.forEach(b => { owes[a][b] = 0; });
  });

  expenses.forEach(e => {
    const share = Number(e.amount) / e.sharedBy.length;
    e.sharedBy.forEach(m => {
      if (m !== e.paidBy) owes[m][e.paidBy] += share;
    });
  });

  const debts = [];
  for (let i = 0; i < MEMBERS.length; i++) {
    for (let j = i + 1; j < MEMBERS.length; j++) {
      const a = MEMBERS[i], b = MEMBERS[j];
      const diff = owes[a][b] - owes[b][a];
      if      (diff >  0.005) debts.push({ from: a, to: b, amount: diff });
      else if (diff < -0.005) debts.push({ from: b, to: a, amount: -diff });
    }
  }
  return debts;
};

const initBalancePage = () => {
  const balancesDiv = document.getElementById('balances');
  const debtsDiv    = document.getElementById('debts');
  if (!balancesDiv || !debtsDiv) return;

  const render = () => {
    const expenses = loadExpenses();

    if (expenses.length === 0) {
      balancesDiv.innerHTML = `
        <div class="empty-state">
          <span class="icon">⚖️</span>
          <h3>No balances yet</h3>
          <p>Balances will appear once you add expenses.</p>
          <a class="btn" href="add-expense.html">Add Expense</a>
        </div>`;
      debtsDiv.innerHTML = `<p class="empty">No debts to settle.</p>`;
      return;
    }

    const balances = computeBalances(expenses);
    const rows = balances.map(b => {
      let cls = 'muted', sign = '';
      if      (b.balance >  0.005) { cls = 'positive'; sign = '+'; }
      else if (b.balance < -0.005) { cls = 'negative'; sign = '-'; }
      return `
        <tr>
          <td data-label="Member">${escapeHtml(b.member)}</td>
          <td data-label="Paid">${formatMoney(b.paid)}</td>
          <td data-label="Share">${formatMoney(b.share)}</td>
          <td data-label="Balance" class="${cls}">${sign}${formatMoney(Math.abs(b.balance))}</td>
        </tr>
      `;
    }).join('');

    balancesDiv.innerHTML = `
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr><th>Member</th><th>Total Paid</th><th>Total Share</th><th>Net Balance</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    const debts = computeDebts(expenses);
    if (debts.length === 0) {
      debtsDiv.innerHTML = `<p class="empty">Everyone is settled up.</p>`;
    } else {
      debtsDiv.innerHTML = `
        <ul class="debt-list">
          ${debts.map(d => `
            <li>
              <span class="debt-from">${escapeHtml(d.from)}</span>
              <span class="arrow">→</span>
              <span class="debt-to">${escapeHtml(d.to)}</span>
              <span class="debt-amount">${formatMoney(d.amount)}</span>
            </li>
          `).join('')}
        </ul>
      `;
    }
  };

  window.addEventListener('expenses-updated', render);
  render();
};

document.addEventListener('DOMContentLoaded', initBalancePage);
