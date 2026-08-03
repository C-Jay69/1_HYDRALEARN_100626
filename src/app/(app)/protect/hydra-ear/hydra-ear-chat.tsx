'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  sentiment?: string;
  crisisAlert?: boolean;
};

interface HydraEarResponse {
  response: string;
  sentiment: string;
  crisisAlert: boolean;
}

export function HydraEarChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/hydra-ear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: [...history, { role: 'user', content: input }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data: HydraEarResponse = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        sentiment: data.sentiment,
        crisisAlert: data.crisisAlert,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setHistory((prev) => [...prev, { role: 'user', content: input }, { role: 'assistant', content: data.response }]);

      if (data.crisisAlert) {
        toast({
          variant: 'destructive',
          title: 'Crisis Alert',
          description: 'If you are in immediate danger, please contact emergency services or a crisis hotline right away.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const getSentinelColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'text-green-500';
      case 'NEUTRAL': return 'text-gray-500';
      case 'NEGATIVE': return 'text-yellow-500';
      case 'DISTRESSED': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center border-dashed rounded-lg">
            <div className="text-center text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Start a conversation. HydraEar is here to listen.</p>
              <p className="text-xs mt-2">Everything you share is anonymous and confidential.</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3 max-w-[80%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className={cn("space-y-1", msg.role === 'user' ? "text-right" : "")}>
                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                  <p>{msg.content}</p>
                </div>
                {msg.sentiment && msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className={getSentinelColor(msg.sentiment)}>●</span>
                    <span>Mood detected: {msg.sentiment}</span>
                  </div>
                )}
                {msg.crisisAlert && msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>Crisis alert triggered. Please reach out to a trusted adult or professional.</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <Textarea
          placeholder="Type your message here... (completely anonymous)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!isLoading && input.trim()) handleSend();
            }
          }}
          disabled={isLoading}
          className="resize-none"
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          size="icon"
          variant="default"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
