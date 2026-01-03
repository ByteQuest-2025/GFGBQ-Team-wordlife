import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTaxStore } from '@/hooks/useTaxStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Chatbot responses database
const responses = {
  en: {
    greeting: [
      "Hello! I'm your Tax Copilot. How can I help you today?",
      "Hi there! Ask me anything about GST, ITR, or tax compliance.",
    ],
    gstr3b: "GSTR-3B must be filed by the **20th of every month**. It's a summary return where you declare your GST liability and pay tax.",
    gstr1: "GSTR-1 is due on the **10th of every month** (or quarterly for small businesses). It contains details of all outward supplies.",
    gstThreshold: "GST registration is mandatory if your annual turnover exceeds **₹20 Lakhs** (₹10 Lakhs for special category states).",
    gstRate: "GST rates vary by category:\n• **5%** - Essential goods\n• **12%** - Standard services\n• **18%** - Most goods & services\n• **28%** - Luxury items",
    itr: "ITR (Income Tax Return) deadline is **31st July** for individuals. Late filing attracts penalty up to ₹5,000.",
    inputTax: "Input Tax Credit (ITC) allows you to deduct GST paid on purchases from GST collected on sales. This reduces your net tax liability.",
    penalty: "Late GST filing attracts:\n• **Late fee**: ₹50/day (₹25 CGST + ₹25 SGST)\n• **Interest**: 18% per annum on tax due",
    default: "I'm not sure about that. Try asking about:\n• GSTR-3B filing date\n• GST threshold\n• GST rates\n• ITR deadline\n• Input tax credit",
  },
  hi: {
    greeting: [
      "नमस्ते! मैं आपका Tax Copilot हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
      "नमस्कार! GST, ITR या कर अनुपालन के बारे में कुछ भी पूछें।",
    ],
    gstr3b: "GSTR-3B **हर महीने की 20 तारीख** तक दाखिल करना होता है। यह एक सारांश रिटर्न है जहां आप अपनी GST देनदारी घोषित करते हैं।",
    gstr1: "GSTR-1 **हर महीने की 10 तारीख** को देय है। इसमें सभी आउटवर्ड सप्लाई का विवरण होता है।",
    gstThreshold: "GST पंजीकरण अनिवार्य है यदि वार्षिक टर्नओवर **₹20 लाख** से अधिक है (विशेष राज्यों के लिए ₹10 लाख)।",
    gstRate: "GST दरें श्रेणी के अनुसार:\n• **5%** - आवश्यक वस्तुएं\n• **12%** - मानक सेवाएं\n• **18%** - अधिकांश वस्तुएं\n• **28%** - लक्जरी आइटम",
    itr: "ITR की समय सीमा व्यक्तियों के लिए **31 जुलाई** है। देर से फाइलिंग पर ₹5,000 तक जुर्माना।",
    inputTax: "इनपुट टैक्स क्रेडिट (ITC) आपको खरीद पर भुगतान किए गए GST को बिक्री पर एकत्रित GST से घटाने की अनुमति देता है।",
    penalty: "देर से GST फाइलिंग पर:\n• **विलंब शुल्क**: ₹50/दिन\n• **ब्याज**: कर देय पर 18% वार्षिक",
    default: "इस बारे में मुझे जानकारी नहीं है। पूछें:\n• GSTR-3B फाइलिंग तिथि\n• GST सीमा\n• GST दरें\n• ITR समय सीमा",
  },
};

const getResponse = (input: string, lang: 'en' | 'hi'): string => {
  const text = input.toLowerCase();
  const r = responses[lang];
  
  if (text.includes('gstr3b') || text.includes('gstr-3b') || text.includes('3b')) {
    return r.gstr3b;
  }
  if (text.includes('gstr1') || text.includes('gstr-1') || text.includes('gstr 1')) {
    return r.gstr1;
  }
  if (text.includes('threshold') || text.includes('limit') || text.includes('registration') || text.includes('सीमा') || text.includes('पंजीकरण')) {
    return r.gstThreshold;
  }
  if (text.includes('rate') || text.includes('percentage') || text.includes('%') || text.includes('दर')) {
    return r.gstRate;
  }
  if (text.includes('itr') || text.includes('income tax') || text.includes('आयकर')) {
    return r.itr;
  }
  if (text.includes('input') || text.includes('itc') || text.includes('credit') || text.includes('क्रेडिट')) {
    return r.inputTax;
  }
  if (text.includes('penalty') || text.includes('late') || text.includes('fine') || text.includes('जुर्माना') || text.includes('देर')) {
    return r.penalty;
  }
  if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('नमस्ते')) {
    return r.greeting[Math.floor(Math.random() * r.greeting.length)];
  }
  
  return r.default;
};

export const TaxChat = () => {
  const { language } = useTaxStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: responses[language].greeting[0],
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = {
    en: {
      title: 'Tax Copilot Chat',
      subtitle: 'Ask me anything about GST & taxes',
      placeholder: 'Type your question...',
      suggestions: [
        'When to file GSTR-3B?',
        'What is GST threshold?',
        'GST rates for goods?',
      ],
    },
    hi: {
      title: 'टैक्स कोपायलट चैट',
      subtitle: 'GST और करों के बारे में कुछ भी पूछें',
      placeholder: 'अपना प्रश्न टाइप करें...',
      suggestions: [
        'GSTR-3B कब फाइल करें?',
        'GST सीमा क्या है?',
        'वस्तुओं पर GST दर?',
      ],
    },
  };

  const text = t[language];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getResponse(input, language),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="h-[calc(100vh-280px)] md:h-[500px] flex flex-col animate-fade-in">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg gradient-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-display">{text.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{text.subtitle}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="p-2 rounded-lg bg-primary/10 h-fit">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-secondary rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="p-2 rounded-lg bg-primary/10 h-fit">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t space-y-3">
          {/* Quick Suggestions */}
          <div className="flex gap-2 flex-wrap">
            {text.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleSuggestion(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
          
          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={text.placeholder}
              className="flex-1"
            />
            <Button onClick={handleSend} className="gradient-primary">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
