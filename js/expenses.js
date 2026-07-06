/* -------- Add / Edit Form -------- */

const initAddExpensePage = () => {
  const form = document.getElementById('expense-form');
  if (!form) return;

  const paidBySelect   = document.getElementById('paidBy');
  const categorySelect = document.getElementById('category');
  const membersDiv     = document.getElementById('members');
  const dateInput      = document.getElementById('date');
  const nameInput      = document.getElementById('name');
  const amountInput    = document.getElementById('amount');
  const formTitle      = document.getElementById('form-title');
  const submitBtn      = document.getElementById('submit-btn');

  MEMBERS.forEach(m => {
    paidBySelect.insertAdjacentHTML('beforeend', `<option value="${m}">${m}</option>`);
    membersDiv.insertAdjacentHTML('beforeend', `
      <label class="checkbox-chip">
        <input type="checkbox" name="shared" value="${m}"> ${m}
      </label>
    `);
  });

  CATEGORIES.forEach(c => {
    categorySelect.insertAdjacentHTML('beforeend',
      `<option value="${c.name}">${c.icon} ${c.name}</option>`);
  });

  dateInput.value = todayISO();

  // ?edit=<id> prefills the form and switches to update mode
  const editIdRaw = getQueryParam('edit');
  const editId = editIdRaw ? Number(editIdRaw) : null;
  const editing = editId ? getExpenseById(editId) : null;

  if (editing) {
    formTitle.textContent = 'Edit Expense';
    submitBtn.textContent = 'Save Changes';
    nameInput.value       = editing.expense;
    amountInput.value     = editing.amount;
    paidBySelect.value    = editing.paidBy;
    categorySelect.value  = editing.category;
    dateInput.value       = editing.date;
    editing.sharedBy.forEach(m => {
      const cb = membersDiv.querySelector(`input[value="${m}"]`);
      if (cb) cb.checked = true;
    });
  }

  // payer should always be part of sharedBy — auto-tick their checkbox
  paidBySelect.addEventListener('change', () => {
    const cb = membersDiv.querySelector(`input[value="${paidBySelect.value}"]`);
    if (cb) cb.checked = true;
    clearError('paidBy');
    clearError('shared');
  });

  ['name', 'amount', 'category', 'date'].forEach(field => {
    document.getElementById(field).addEventListener('input', () => clearError(field));
  });
  membersDiv.addEventListener('change', () => clearError('shared'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name        = nameInput.value.trim();
    const amount      = parseFloat(amountInput.value);
    const paidBy      = paidBySelect.value;
    const category    = categorySelect.value;
    const date        = dateInput.value;
    const sharedBy    = [...document.querySelectorAll('input[name="shared"]:checked')]
                          .map(el => el.value);

    let ok = true;
    if (!name)                       { showError('name', 'Expense name is required.'); ok = false; }
    if (!amount || amount <= 0)      { showError('amount', 'Amount must be greater than zero.'); ok = false; }
    if (!paidBy)                     { showError('paidBy', 'Please select who paid.'); ok = false; }
    if (!category)                   { showError('category', 'Please select a category.'); ok = false; }
    if (!date)                       { showError('date', 'Please pick a date.'); ok = false; }
    if (sharedBy.length === 0)       { showError('shared', 'Select at least one member.'); ok = false; }
    if (paidBy && !sharedBy.includes(paidBy)) {
      showError('shared', 'The payer must also be one of the selected members.');
      ok = false;
    }
    if (!ok) return;

    const payload = { expense: name, amount, paidBy, category, sharedBy, date };

    if (editing) {
      updateExpense(editing.id, payload);
      window.location.href = 'display-expenses.html';
    } else {
      addExpense(payload);
      form.reset();
      dateInput.value = todayISO();
      showToast('Expense added successfully.');
    }
  });

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    setTimeout(() => {
      dateInput.value = todayISO();
      clearAllErrors();
    }, 0);
  });

  document.getElementById('sample-btn')?.addEventListener('click', () => {
    if (confirm('Load 6 sample expenses into your dashboard?')) {
      loadSampleData();
      showToast('Sample data loaded.');
    }
  });

  document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
    window.location.href = 'display-expenses.html';
  });

  if (editing) {
    document.getElementById('cancel-edit-btn').style.display = 'inline-flex';
    document.getElementById('sample-btn').style.display = 'none';
  }
};

/* -------- Display Expenses -------- */

const initDisplayExpensesPage = () => {
  const tableWrap = document.getElementById('expenses-table');
  if (!tableWrap) return;

  const searchInput = document.getElementById('search-input');
  const catFilter   = document.getElementById('cat-filter');
  const sortSelect  = document.getElementById('sort-select');

  CATEGORIES.forEach(c => {
    catFilter.insertAdjacentHTML('beforeend',
      `<option value="${c.name}">${c.icon} ${c.name}</option>`);
  });

  const state = { q: '', cat: '', sort: 'date-desc' };

  const applyFilters = (list) => {
    let out = [...list];
    if (state.q) {
      const q = state.q.toLowerCase();
      out = out.filter(e => e.expense.toLowerCase().includes(q));
    }
    if (state.cat) out = out.filter(e => e.category === state.cat);

    const cmp = {
      'date-desc':   (a, b) => (b.date || '').localeCompare(a.date || ''),
      'date-asc':    (a, b) => (a.date || '').localeCompare(b.date || ''),
      'amount-desc': (a, b) => Number(b.amount) - Number(a.amount),
      'amount-asc':  (a, b) => Number(a.amount) - Number(b.amount)
    }[state.sort];
    if (cmp) out.sort(cmp);
    return out;
  };

  const render = () => {
    const list = applyFilters(loadExpenses());

    if (list.length === 0) {
      const hasData = loadExpenses().length > 0;
      tableWrap.innerHTML = hasData
        ? `<p class="empty">No expenses match your filters.</p>`
        : `<div class="empty-state">
             <span class="icon">🧾</span>
             <h3>No expenses yet</h3>
             <p>Add your first shared expense to start tracking who owes whom.</p>
             <a class="btn" href="add-expense.html">Add Expense</a>
           </div>`;
      return;
    }

    const rows = list.map(e => {
      const share = Number(e.amount) / e.sharedBy.length;
      const info = getCategoryInfo(e.category);
      return `
        <tr>
          <td data-label="Expense">${escapeHtml(e.expense)}</td>
          <td data-label="Amount">${formatMoney(e.amount)}</td>
          <td data-label="Paid By">${escapeHtml(e.paidBy)}</td>
          <td data-label="Category">
            <span class="tag" style="background:${info.color}22;color:${info.color}">
              ${info.icon} ${info.name}
            </span>
          </td>
          <td data-label="Shared By">${e.sharedBy.map(escapeHtml).join(', ')}</td>
          <td data-label="Split">${formatMoney(share)} each</td>
          <td data-label="Date">${formatDate(e.date)}</td>
          <td data-label="Actions" class="actions-cell">
            <a class="btn-sm btn-edit" href="add-expense.html?edit=${e.id}">Edit</a>
            <button class="btn-sm btn-delete" data-id="${e.id}">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    tableWrap.innerHTML = `
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Expense</th><th>Amount</th><th>Paid By</th><th>Category</th>
              <th>Shared By</th><th>Split</th><th>Date</th><th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    tableWrap.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this expense? This cannot be undone.')) {
          deleteExpense(Number(btn.dataset.id));
        }
      });
    });
  };

  searchInput.addEventListener('input', () => { state.q   = searchInput.value.trim(); render(); });
  catFilter  .addEventListener('change', () => { state.cat = catFilter.value;         render(); });
  sortSelect .addEventListener('change', () => { state.sort = sortSelect.value;       render(); });

  document.getElementById('sample-btn')?.addEventListener('click', () => {
    if (confirm('Load 6 sample expenses into your dashboard?')) {
      loadSampleData();
    }
  });

  document.getElementById('clear-btn')?.addEventListener('click', () => {
    if (confirm('Delete ALL expenses? This cannot be undone.')) {
      clearAllExpenses();
    }
  });

  window.addEventListener('expenses-updated', render);
  render();
};

/* -------- error + toast helpers -------- */

const showError = (field, msg) => {
  const el = document.getElementById(`err-${field}`);
  if (el) { el.textContent = msg; el.hidden = false; }
};

const clearError = (field) => {
  const el = document.getElementById(`err-${field}`);
  if (el) { el.textContent = ''; el.hidden = true; }
};

const clearAllErrors = () =>
  document.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; el.hidden = true; });

const showToast = (msg) => {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
};

document.addEventListener('DOMContentLoaded', () => {
  initAddExpensePage();
  initDisplayExpensesPage();
});
