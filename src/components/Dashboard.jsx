import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import ExpenseForm from './ExpenseForm';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axiosInstance.get('/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await axiosInstance.post('/expenses', expenseData);
      fetchExpenses();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding expense:', error);
      alert(error.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleUpdateExpense = async (expenseData) => {
    try {
      await axiosInstance.put(`/expenses/${editingExpense._id}`, expenseData);
      fetchExpenses();
      setShowForm(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
      alert(error.response?.data?.message || 'Failed to update expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    try {
      await axiosInstance.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert(error.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const filteredExpenses = filter === 'all' 
    ? expenses 
    : expenses.filter(exp => exp.category === filter);

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Expense Tracker</h1>
          <p>Welcome, {user?.name}!</p>
        </div>
        <button onClick={logout} className="btn-logout">
          Logout
        </button>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <p className="stat-amount">${totalAmount.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Count</h3>
          <p className="stat-amount">{filteredExpenses.length}</p>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="filter-section">
          <label>Filter by Category:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-add">
          + Add Expense
        </button>
      </div>

      <div className="expenses-list">
        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses found. Add your first expense!</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div key={expense._id} className="expense-card">
              <div className="expense-info">
                <h3>{expense.title}</h3>
                <p className="expense-category">{expense.category}</p>
                {expense.description && (
                  <p className="expense-description">{expense.description}</p>
                )}
                <p className="expense-date">
                  {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <div className="expense-actions">
                <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                <button
                  onClick={() => handleEdit(expense)}
                  className="btn-edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteExpense(expense._id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
          onCancel={handleFormClose}
        />
      )}
    </div>
  );
};

export default Dashboard;
