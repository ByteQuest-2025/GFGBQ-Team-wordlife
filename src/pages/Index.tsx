import { useState } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Bell, 
  MessageSquare, 
  Rocket,
  Download,
  RefreshCw,
  IndianRupee,
  ShieldCheck,
  Languages
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTaxStore } from '@/hooks/useTaxStore';
import { Dashboard } from '@/components/Dashboard';
import { TransactionForm } from '@/components/TransactionForm';
import { Reminders } from '@/components/Reminders';
import { TaxChat } from '@/components/TaxChat';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    totalSales,
    gstPayable,
    requiresGST,
    getComplianceScore,
    exportToCSV,
    resetData,
    language,
    setLanguage,
  } = useTaxStore();

  const complianceScore = getComplianceScore();

  const t = {
    en: {
      title: 'Real-Time Tax Copilot',
      subtitle: 'For Micro-Businesses',
      dashboard: 'Dashboard',
      addTransaction: 'Add Transaction',
      reminders: 'Reminders',
      taxChat: 'Tax Chat',
      totalSales: 'Total Sales',
      estGstDue: 'Est. GST Due',
      compliance: 'Compliance',
      exportCsv: 'Export CSV',
      resetDemo: 'Reset Data',
      demoHint: 'Add sales → see live GST + reminders',
      belowThreshold: 'Below threshold',
    },
    hi: {
      title: 'रियल-टाइम टैक्स कोपायलट',
      subtitle: 'सूक्ष्म व्यवसायों के लिए',
      dashboard: 'डैशबोर्ड',
      addTransaction: 'लेनदेन जोड़ें',
      reminders: 'अनुस्मारक',
      taxChat: 'टैक्स चैट',
      totalSales: 'कुल बिक्री',
      estGstDue: 'अनु. GST देय',
      compliance: 'अनुपालन',
      exportCsv: 'CSV निर्यात',
      resetDemo: 'डेटा रीसेट',
      demoHint: 'बिक्री जोड़ें → लाइव GST + अनुस्मारक देखें',
      belowThreshold: 'सीमा से नीचे',
    },
  };

  const text = t[language];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b">
        <div className="container py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 rounded-xl gradient-primary">
                <Rocket className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-display font-bold">{text.title}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{text.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="text-xs"
              >
                <Languages className="h-4 w-4 mr-1" />
                {language === 'en' ? 'हिंदी' : 'EN'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-4 md:py-6">
        <div className="grid lg:grid-cols-[280px_1fr] gap-4 md:gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block space-y-4">
            <Card className="gradient-primary text-primary-foreground">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <IndianRupee className="h-8 w-8" />
                  <div>
                    <p className="text-sm opacity-80">{text.totalSales}</p>
                    <p className="text-2xl font-bold font-display">{formatCurrency(totalSales)}</p>
                  </div>
                </div>
                
                <div className="h-px bg-primary-foreground/20" />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">{text.estGstDue}</span>
                    <span className="font-semibold">
                      {requiresGST ? formatCurrency(gstPayable) : text.belowThreshold}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">{text.compliance}</span>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="font-semibold">{complianceScore}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={exportToCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                {text.exportCsv}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={resetData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {text.resetDemo}
              </Button>
            </div>

            <Card className="bg-secondary/50 border-dashed">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground text-center">
                  💡 {text.demoHint}
                </p>
              </CardContent>
            </Card>
          </aside>

          {/* Mobile Stats Bar */}
          <div className="lg:hidden grid grid-cols-3 gap-2">
            <Card className="gradient-primary text-primary-foreground">
              <CardContent className="p-3 text-center">
                <p className="text-xs opacity-80">{text.totalSales}</p>
                <p className="font-bold font-display text-sm">{formatCurrency(totalSales)}</p>
              </CardContent>
            </Card>
            <Card className="bg-warning/10 border-warning/30">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">{text.estGstDue}</p>
                <p className="font-bold font-display text-sm text-warning">
                  {requiresGST ? formatCurrency(gstPayable) : '—'}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-success/10 border-success/30">
              <CardContent className="p-3 text-center">
                <p className="text-xs text-muted-foreground">{text.compliance}</p>
                <p className="font-bold font-display text-sm text-success">{complianceScore}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 w-full bg-secondary/50">
                <TabsTrigger value="dashboard" className="text-xs md:text-sm">
                  <LayoutDashboard className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{text.dashboard}</span>
                </TabsTrigger>
                <TabsTrigger value="transaction" className="text-xs md:text-sm">
                  <PlusCircle className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{text.addTransaction}</span>
                </TabsTrigger>
                <TabsTrigger value="reminders" className="text-xs md:text-sm">
                  <Bell className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{text.reminders}</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-xs md:text-sm">
                  <MessageSquare className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{text.taxChat}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-4">
                <Dashboard />
              </TabsContent>
              
              <TabsContent value="transaction" className="mt-4">
                <TransactionForm />
              </TabsContent>
              
              <TabsContent value="reminders" className="mt-4">
                <Reminders />
              </TabsContent>
              
              <TabsContent value="chat" className="mt-4">
                <TaxChat />
              </TabsContent>
            </Tabs>

            {/* Mobile Actions */}
            <div className="lg:hidden flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1" 
                onClick={exportToCSV}
              >
                <Download className="h-4 w-4 mr-2" />
                {text.exportCsv}
              </Button>
              <Button 
                variant="outline"
                size="sm" 
                className="flex-1"
                onClick={resetData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {text.resetDemo}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
