const initReportsPage = () => {
  const totalEl        = document.getElementById('total-group');
  const catGrid        = document.getElementById('category-grid');
  const memberGrid     = document.getElementById('member-grid');
  const catFilter      = document.getElementById('cat-filter');
  const memberFilter   = document.getElementById('member-filter');
  const fromInput      = document.getElementById('date-from');
  const toInput        = document.getElementById('date-to');
  const resetBtn       = document.getElementById('reset-filters');
  const pieCanvas      = document.getElementById('pie-chart');
  const barCanvas      = document.getElementById('bar-chart');

  if (!totalEl || !catGrid) return;

  CATEGORIES.forEach(c => {
    catFilter.insertAdjacentHTML('beforeend', `<option value="${c.name}">${c.icon} ${c.name}</option>`);
  });
  MEMBERS.forEach(m => {
    memberFilter.insertAdjacentHTML('beforeend', `<option value="${m}">${m}</option>`);
  });

  let pieChart = null;
  let barChart = null;

  const applyFilters = (list) => list.filter(e => {
    if (catFilter.value    && e.category !== catFilter.value)    return false;
    if (memberFilter.value && !(e.paidBy === memberFilter.value
                              || e.sharedBy.includes(memberFilter.value))) return false;
    if (fromInput.value    && e.date < fromInput.value)  return false;
    if (toInput.value      && e.date > toInput.value)    return false;
    return true;
  });

  const render = () => {
    const filtered = applyFilters(loadExpenses());

    const groupTotal = filtered.reduce((s, e) => s + Number(e.amount), 0);
    totalEl.textContent = formatMoney(groupTotal);

    const catAgg = Object.fromEntries(CATEGORIES.map(c => [c.name, { total: 0, count: 0 }]));
    filtered.forEach(e => {
      if (!catAgg[e.category]) catAgg[e.category] = { total: 0, count: 0 };
      catAgg[e.category].total += Number(e.amount);
      catAgg[e.category].count += 1;
    });

    catGrid.innerHTML = CATEGORIES.map(c => {
      const { total, count } = catAgg[c.name];
      return `
        <div class="report-card" style="--cat-color:${c.color}">
          <div class="card-head">
            <span class="cat-icon" style="background:${c.color}22">${c.icon}</span>
            <span class="card-title">${c.name}</span>
          </div>
          <div class="stat-row"><span>Total Expense</span><strong>${formatMoney(total)}</strong></div>
          <div class="stat-row"><span>Number of Expenses</span><strong>${count}</strong></div>
        </div>
      `;
    }).join('');

    // Member cards
    const memberAgg = Object.fromEntries(MEMBERS.map(m => [m, { paid: 0, count: 0, share: 0 }]));
    filtered.forEach(e => {
      memberAgg[e.paidBy].paid  += Number(e.amount);
      memberAgg[e.paidBy].count += 1;
      const s = Number(e.amount) / e.sharedBy.length;
      e.sharedBy.forEach(m => { memberAgg[m].share += s; });
    });

    memberGrid.innerHTML = MEMBERS.map(m => {
      const a = memberAgg[m];
      return `
        <div class="report-card member-card">
          <div class="card-head">
            <span class="avatar">${m[0]}</span>
            <span class="card-title">${m}</span>
          </div>
          <div class="stat-row"><span>Total Paid</span><strong>${formatMoney(a.paid)}</strong></div>
          <div class="stat-row"><span>Expenses Paid</span><strong>${a.count}</strong></div>
          <div class="stat-row"><span>Total Shared</span><strong>${formatMoney(a.share)}</strong></div>
        </div>
      `;
    }).join('');

    renderCharts(catAgg, memberAgg);
  };

  const renderCharts = (catAgg, memberAgg) => {
    if (typeof Chart === 'undefined') return; // Chart.js CDN blocked / offline

    const catLabels = CATEGORIES.map(c => c.name);
    const catData   = CATEGORIES.map(c => catAgg[c.name].total);
    const catColors = CATEGORIES.map(c => c.color);

    // Chart.js keeps prior instance in memory — destroy before re-creating
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels: catLabels,
        datasets: [{ data: catData, backgroundColor: catColors, borderWidth: 2, borderColor: '#fff' }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 12, font: { size: 12 } } },
          title:  { display: true, text: 'Expense by Category', font: { size: 14, weight: 'bold' } }
        }
      }
    });

    const barLabels = MEMBERS;
    const barData   = MEMBERS.map(m => memberAgg[m].paid);

    if (barChart) barChart.destroy();
    barChart = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: barLabels,
        datasets: [{
          label: 'Amount Paid (₹)',
          data: barData,
          backgroundColor: '#4f46e5',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title:  { display: true, text: 'Amount Paid by Member', font: { size: 14, weight: 'bold' } }
        },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => '₹' + v } } }
      }
    });
  };

  [catFilter, memberFilter, fromInput, toInput].forEach(el =>
    el.addEventListener('change', render));

  resetBtn.addEventListener('click', () => {
    catFilter.value    = '';
    memberFilter.value = '';
    fromInput.value    = '';
    toInput.value      = '';
    render();
  });

  window.addEventListener('expenses-updated', render);
  render();
};

document.addEventListener('DOMContentLoaded', initReportsPage);
