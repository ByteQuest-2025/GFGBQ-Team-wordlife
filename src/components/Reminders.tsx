import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTaxStore } from '@/hooks/useTaxStore';

interface Reminder {
  id: string;
  type: string;
  description: string;
  dueDate: string;
  day: number;
  frequency: 'monthly' | 'annual';
}

const reminders: Reminder[] = [
  {
    id: 'gstr1',
    type: 'GSTR-1',
    description: 'Monthly/Quarterly return for outward supplies',
    dueDate: '10th of every month',
    day: 10,
    frequency: 'monthly',
  },
  {
    id: 'gstr3b',
    type: 'GSTR-3B',
    description: 'Monthly summary return with tax payment',
    dueDate: '20th of every month',
    day: 20,
    frequency: 'monthly',
  },
  {
    id: 'gstr9',
    type: 'GSTR-9',
    description: 'Annual return for regular taxpayers',
    dueDate: '31st December',
    day: 31,
    frequency: 'annual',
  },
  {
    id: 'itr',
    type: 'ITR',
    description: 'Income Tax Return filing',
    dueDate: '31st July',
    day: 31,
    frequency: 'annual',
  },
];

const getStatus = (reminder: Reminder): 'completed' | 'upcoming' | 'due' | 'overdue' => {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  
  if (reminder.frequency === 'monthly') {
    if (currentDay < reminder.day - 5) return 'completed';
    if (currentDay < reminder.day) return 'upcoming';
    if (currentDay === reminder.day) return 'due';
    return 'overdue';
  }
  
  // Annual reminders
  if (reminder.id === 'itr') {
    if (currentMonth < 6) return 'upcoming'; // Before July
    if (currentMonth === 6 && currentDay <= 31) return 'due';
    return 'overdue';
  }
  
  if (reminder.id === 'gstr9') {
    if (currentMonth < 11) return 'upcoming'; // Before December
    if (currentMonth === 11 && currentDay <= 31) return 'due';
    return 'overdue';
  }
  
  return 'upcoming';
};

const getDaysLeft = (reminder: Reminder): number => {
  const now = new Date();
  const currentDay = now.getDate();
  
  if (reminder.frequency === 'monthly') {
    if (currentDay <= reminder.day) {
      return reminder.day - currentDay;
    }
    // Days until next month's due date
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return daysInMonth - currentDay + reminder.day;
  }
  
  return 0;
};

export const Reminders = () => {
  const { language, requiresGST } = useTaxStore();

  const t = {
    en: {
      title: 'Tax Reminders & Due Dates',
      subtitle: 'Stay compliant with upcoming deadlines',
      daysLeft: 'days left',
      dueToday: 'Due today!',
      overdue: 'Overdue!',
      completed: 'Filed',
      upcoming: 'Upcoming',
      due: 'Due Soon',
      notApplicable: 'Not applicable (below GST threshold)',
      monthly: 'Monthly',
      annual: 'Annual',
    },
    hi: {
      title: 'कर अनुस्मारक और देय तिथियां',
      subtitle: 'आगामी समय सीमा के साथ अनुपालन करें',
      daysLeft: 'दिन बाकी',
      dueToday: 'आज देय!',
      overdue: 'अतिदेय!',
      completed: 'दाखिल',
      upcoming: 'आगामी',
      due: 'जल्द देय',
      notApplicable: 'लागू नहीं (GST सीमा से नीचे)',
      monthly: 'मासिक',
      annual: 'वार्षिक',
    },
  };

  const text = t[language];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-xl font-display font-bold">{text.title}</h2>
        <p className="text-muted-foreground text-sm">{text.subtitle}</p>
      </div>

      <div className="grid gap-4">
        {reminders.map((reminder) => {
          const status = getStatus(reminder);
          const daysLeft = getDaysLeft(reminder);
          const isGSTReminder = reminder.id.startsWith('gstr');
          
          return (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              status={status}
              daysLeft={daysLeft}
              isApplicable={!isGSTReminder || requiresGST}
              text={text}
            />
          );
        })}
      </div>
    </div>
  );
};

const ReminderCard = ({
  reminder,
  status,
  daysLeft,
  isApplicable,
  text,
}: {
  reminder: Reminder;
  status: 'completed' | 'upcoming' | 'due' | 'overdue';
  daysLeft: number;
  isApplicable: boolean;
  text: Record<string, string>;
}) => {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10',
      border: 'border-success/30',
      label: text.completed,
    },
    upcoming: {
      icon: Clock,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/30',
      label: text.upcoming,
    },
    due: {
      icon: AlertTriangle,
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      label: text.due,
    },
    overdue: {
      icon: AlertTriangle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      label: text.overdue,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (!isApplicable) {
    return (
      <Card className="border-border/50 opacity-60">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">{reminder.type}</p>
                <p className="text-sm text-muted-foreground">{text.notApplicable}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border ${config.border} transition-all hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{reminder.type}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  {reminder.frequency === 'monthly' ? text.monthly : text.annual}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{reminder.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{reminder.dueDate}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-sm font-medium ${config.color}`}>
              {config.label}
            </span>
            {status === 'upcoming' && daysLeft > 0 && (
              <p className="text-xs text-muted-foreground">
                {daysLeft} {text.daysLeft}
              </p>
            )}
            {status === 'due' && (
              <p className="text-xs text-warning font-medium">
                {text.dueToday}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
