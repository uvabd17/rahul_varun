const STORAGE_KEY = 'expenses';

const loadExpenses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveExpenses = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('expenses-updated'));
};

const getExpenseById = (id) => loadExpenses().find(e => e.id === id) || null;

const addExpense = (obj) => {
  const list = loadExpenses();
  const id = Date.now() + Math.floor(Math.random() * 1000);
  list.push({ id, ...obj });
  saveExpenses(list);
  return id;
};

const updateExpense = (id, updates) => {
  const list = loadExpenses().map(e => e.id === id ? { ...e, ...updates } : e);
  saveExpenses(list);
};

const deleteExpense = (id) => {
  const list = loadExpenses().filter(e => e.id !== id);
  saveExpenses(list);
};

const clearAllExpenses = () => saveExpenses([]);

const loadSampleData = () => {
  const today = todayISO();
  const samples = [
    { expense: 'Pizza',   amount: 900,  paidBy: 'Alice',   category: 'Food',          sharedBy: ['Alice', 'Bob', 'Charlie'],          date: today },
    { expense: 'Biryani', amount: 1200, paidBy: 'Bob',     category: 'Food',          sharedBy: ['Alice', 'Bob', 'Charlie', 'David'], date: today },
    { expense: 'Burger',  amount: 500,  paidBy: 'Charlie', category: 'Food',          sharedBy: ['Bob', 'Charlie'],                   date: today },
    { expense: 'Movie',   amount: 600,  paidBy: 'Bob',     category: 'Entertainment', sharedBy: ['Bob', 'Charlie'],                   date: today },
    { expense: 'Taxi',    amount: 400,  paidBy: 'David',   category: 'Travel',        sharedBy: ['David', 'Emma'],                    date: today },
    { expense: 'Bus',     amount: 300,  paidBy: 'Emma',    category: 'Travel',        sharedBy: ['David', 'Emma'],                    date: today }
  ];
  const list = loadExpenses();
  samples.forEach((s, i) => {
    list.push({ id: Date.now() + i, ...s });
  });
  saveExpenses(list);
};
