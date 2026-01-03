import { useState, useEffect, useCallback } from 'react';

// Transaction interface
export interface Transaction {
  id: string;
  date: string;
  type: 'sale' | 'expense';
  amount: number;
  category: 'goods' | 'service';
  gstin?: string;
  gstAmount: number;
}

// GST rates based on category
const GST_RATES = {
  goods: 0.18, // 18%
  service: 0.12, // 12%
};

// GST registration threshold (₹20 Lakhs)
const GST_THRESHOLD = 2000000;

// Sample data for demo
const generateSampleData = (): Transaction[] => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return [
    {
      id: '1',
      date: new Date(currentYear, currentMonth - 2, 5).toISOString().split('T')[0],
      type: 'sale',
      amount: 150000,
      category: 'goods',
      gstAmount: 27000,
    },
    {
      id: '2',
      date: new Date(currentYear, currentMonth - 2, 12).toISOString().split('T')[0],
      type: 'expense',
      amount: 45000,
      category: 'goods',
      gstAmount: 8100,
    },
    {
      id: '3',
      date: new Date(currentYear, currentMonth - 1, 8).toISOString().split('T')[0],
      type: 'sale',
      amount: 280000,
      category: 'service',
      gstAmount: 33600,
    },
    {
      id: '4',
      date: new Date(currentYear, currentMonth - 1, 20).toISOString().split('T')[0],
      type: 'expense',
      amount: 32000,
      category: 'service',
      gstAmount: 3840,
    },
    {
      id: '5',
      date: new Date(currentYear, currentMonth, 3).toISOString().split('T')[0],
      type: 'sale',
      amount: 195000,
      category: 'goods',
      gstAmount: 35100,
    },
    {
      id: '6',
      date: new Date(currentYear, currentMonth, 10).toISOString().split('T')[0],
      type: 'expense',
      amount: 28000,
      category: 'goods',
      gstAmount: 5040,
    },
  ];
};

export const useTaxStore = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem('ps15_transactions');
    if (stored) {
      return JSON.parse(stored);
    }
    return generateSampleData();
  });

  const [language, setLanguage] = useState<'en' | 'hi'>(() => {
    const stored = localStorage.getItem('ps15_language');
    return (stored as 'en' | 'hi') || 'en';
  });

  // Persist transactions
  useEffect(() => {
    localStorage.setItem('ps15_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('ps15_language', language);
  }, [language]);

  // Add transaction
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'gstAmount'>) => {
    const gstRate = GST_RATES[transaction.category];
    const gstAmount = transaction.amount * gstRate;
    
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      gstAmount,
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    return newTransaction;
  }, []);

  // Delete transaction
  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // Calculate totals
  const totalSales = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = totalSales - totalExpenses;

  // GST calculations
  const outputGST = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.gstAmount, 0);

  const inputGST = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.gstAmount, 0);

  const gstPayable = Math.max(0, outputGST - inputGST);
  const requiresGST = totalSales > GST_THRESHOLD;

  // Monthly data for charts
  const getMonthlyData = () => {
    const months: Record<string, { income: number; expense: number; month: string }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('en-US', { month: 'short' });
      
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expense: 0, month: monthName };
      }
      
      if (t.type === 'sale') {
        months[monthKey].income += t.amount;
      } else {
        months[monthKey].expense += t.amount;
      }
    });
    
    return Object.values(months).slice(-6);
  };

  // Compliance score
  const getComplianceScore = () => {
    const now = new Date();
    const day = now.getDate();
    
    // Simple scoring: 90% if before due dates, decreases if past
    if (day <= 10) return 95;
    if (day <= 20) return 90;
    return 85;
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Category', 'GSTIN', 'GST Amount'];
    const rows = transactions.map(t => [
      t.date,
      t.type,
      t.amount.toString(),
      t.category,
      t.gstin || '',
      t.gstAmount.toString(),
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ps15_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset to sample data
  const resetData = () => {
    setTransactions(generateSampleData());
  };

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    totalSales,
    totalExpenses,
    totalIncome,
    outputGST,
    inputGST,
    gstPayable,
    requiresGST,
    gstThreshold: GST_THRESHOLD,
    getMonthlyData,
    getComplianceScore,
    exportToCSV,
    resetData,
    language,
    setLanguage,
  };
};
