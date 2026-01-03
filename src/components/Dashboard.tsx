import { TrendingUp, TrendingDown, Wallet, Receipt, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTaxStore } from '@/hooks/useTaxStore';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  variant = 'default',
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendLabel?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}) => {
  const variantStyles = {
    default: 'border-border',
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    destructive: 'border-destructive/30 bg-destructive/5',
  };

  const iconStyles = {
    default: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    destructive: 'text-destructive bg-destructive/10',
  };

  return (
    <Card className={`${variantStyles[variant]} transition-all hover:shadow-md`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-xl md:text-2xl font-bold font-display">{value}</p>
            {trendLabel && (
              <div className="flex items-center gap-1 text-xs">
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                )}
                <span className={trend === 'up' ? 'text-success' : 'text-destructive'}>
                  {trendLabel}
                </span>
              </div>
            )}
          </div>
          <div className={`p-2 md:p-3 rounded-xl ${iconStyles[variant]}`}>
            <Icon className="h-5 w-5 md:h-6 md:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard = () => {
  const {
    totalSales,
    totalExpenses,
    totalIncome,
    gstPayable,
    requiresGST,
    getMonthlyData,
    language,
  } = useTaxStore();

  const monthlyData = getMonthlyData();
  const nextDueDate = (() => {
    const now = new Date();
    const day = now.getDate();
    if (day < 10) return { date: '10th', type: 'GSTR-1', daysLeft: 10 - day };
    if (day < 20) return { date: '20th', type: 'GSTR-3B', daysLeft: 20 - day };
    return { date: '10th next month', type: 'GSTR-1', daysLeft: 40 - day };
  })();

  const t = {
    en: {
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      gstPayable: 'GST Payable',
      nextDue: 'Next Due',
      daysLeft: 'days left',
      incomeVsExpense: 'Income vs Expense Trend',
      income: 'Income',
      expense: 'Expense',
      noGstNeeded: 'Below threshold',
    },
    hi: {
      totalIncome: 'कुल आय',
      totalExpenses: 'कुल खर्च',
      gstPayable: 'GST देय',
      nextDue: 'अगली देय तिथि',
      daysLeft: 'दिन बाकी',
      incomeVsExpense: 'आय बनाम खर्च रुझान',
      income: 'आय',
      expense: 'खर्च',
      noGstNeeded: 'सीमा से नीचे',
    },
  };

  const text = t[language];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          title={text.totalIncome}
          value={formatCurrency(totalIncome)}
          icon={Wallet}
          variant={totalIncome > 0 ? 'success' : 'default'}
          trend={totalIncome > 0 ? 'up' : 'down'}
          trendLabel={totalIncome > 0 ? '+12%' : '-5%'}
        />
        <MetricCard
          title={text.totalExpenses}
          value={formatCurrency(totalExpenses)}
          icon={Receipt}
          variant="default"
        />
        <MetricCard
          title={text.gstPayable}
          value={requiresGST ? formatCurrency(gstPayable) : text.noGstNeeded}
          icon={TrendingUp}
          variant={gstPayable > 0 ? 'warning' : 'success'}
        />
        <MetricCard
          title={text.nextDue}
          value={`${nextDueDate.type} - ${nextDueDate.date}`}
          icon={AlertCircle}
          variant={nextDueDate.daysLeft < 5 ? 'destructive' : 'default'}
          trendLabel={`${nextDueDate.daysLeft} ${text.daysLeft}`}
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display">{text.incomeVsExpense}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar 
                  dataKey="income" 
                  name={text.income}
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="expense" 
                  name={text.expense}
                  fill="hsl(var(--chart-4))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
