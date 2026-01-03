import { useState } from 'react';
import { Plus, Trash2, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaxStore, Transaction } from '@/hooks/useTaxStore';
import { toast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const TransactionForm = () => {
  const { transactions, addTransaction, deleteTransaction, language } = useTaxStore();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'sale' as 'sale' | 'expense',
    amount: '',
    category: 'goods' as 'goods' | 'service',
    gstin: '',
  });

  const t = {
    en: {
      addTransaction: 'Add Transaction',
      date: 'Date',
      type: 'Type',
      sale: 'Sale',
      expense: 'Expense',
      amount: 'Amount (₹)',
      category: 'Category',
      goods: 'Goods (18% GST)',
      service: 'Service (12% GST)',
      gstin: 'GSTIN (Optional)',
      gstinPlaceholder: 'Enter GSTIN',
      addButton: 'Add Transaction',
      recentTransactions: 'Recent Transactions',
      noTransactions: 'No transactions yet. Add your first one!',
      gst: 'GST',
      success: 'Transaction added successfully!',
      gstCalculated: 'GST calculated',
    },
    hi: {
      addTransaction: 'लेनदेन जोड़ें',
      date: 'तारीख',
      type: 'प्रकार',
      sale: 'बिक्री',
      expense: 'खर्च',
      amount: 'राशि (₹)',
      category: 'श्रेणी',
      goods: 'वस्तुएं (18% GST)',
      service: 'सेवा (12% GST)',
      gstin: 'GSTIN (वैकल्पिक)',
      gstinPlaceholder: 'GSTIN दर्ज करें',
      addButton: 'लेनदेन जोड़ें',
      recentTransactions: 'हाल के लेनदेन',
      noTransactions: 'अभी तक कोई लेनदेन नहीं। पहला जोड़ें!',
      gst: 'GST',
      success: 'लेनदेन सफलतापूर्वक जोड़ा गया!',
      gstCalculated: 'GST गणना',
    },
  };

  const text = t[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    const transaction = addTransaction({
      date: formData.date,
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      gstin: formData.gstin || undefined,
    });

    toast({
      title: text.success,
      description: `${text.gstCalculated}: ${formatCurrency(transaction.gstAmount)}`,
    });

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'sale',
      amount: '',
      category: 'goods',
      gstin: '',
    });
  };

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Add Transaction Form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            {text.addTransaction}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">{text.date}</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>{text.type}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'sale' | 'expense') => 
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">{text.sale}</SelectItem>
                    <SelectItem value="expense">{text.expense}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">{text.amount}</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>{text.category}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: 'goods' | 'service') => 
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goods">{text.goods}</SelectItem>
                    <SelectItem value="service">{text.service}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* GSTIN */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="gstin">{text.gstin}</Label>
                <Input
                  id="gstin"
                  placeholder={text.gstinPlaceholder}
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  maxLength={15}
                />
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              {text.addButton}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-display">{text.recentTransactions}</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTransactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{text.noTransactions}</p>
          ) : (
            <div className="space-y-3">
              {sortedTransactions.slice(0, 10).map((transaction) => (
                <TransactionItem 
                  key={transaction.id} 
                  transaction={transaction}
                  onDelete={() => deleteTransaction(transaction.id)}
                  text={text}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TransactionItem = ({
  transaction,
  onDelete,
  text,
}: {
  transaction: Transaction;
  onDelete: () => void;
  text: Record<string, string>;
}) => {
  const isSale = transaction.type === 'sale';
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isSale ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
          <IndianRupee className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-sm">
            {isSale ? text.sale : text.expense} - {transaction.category}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(transaction.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={`font-semibold ${isSale ? 'text-success' : 'text-destructive'}`}>
            {isSale ? '+' : '-'}{formatCurrency(transaction.amount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {text.gst}: {formatCurrency(transaction.gstAmount)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
