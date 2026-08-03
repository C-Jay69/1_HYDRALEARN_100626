'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smile, Frown, Meh, AlertCircle, Heart, Activity, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type MoodEntry = {
  id: string;
  mood: string;
  note: string | null;
  createdAt: string;
};

const moodOptions = [
  { value: 'Happy', label: 'Happy', icon: Smile, color: 'text-green-500' },
  { value: 'Excited', label: 'Excited', icon: Activity, color: 'text-blue-500' },
  { value: 'Okay', label: 'Okay', icon: Smile, color: 'text-yellow-500' },
  { value: 'Tired', label: 'Tired', icon: Meh, color: 'text-gray-500' },
  { value: 'Anxious', label: 'Anxious', icon: AlertCircle, color: 'text-orange-500' },
  { value: 'Stressed', label: 'Stressed', icon: Frown, color: 'text-red-500' },
  { value: 'Sad', label: 'Sad', icon: Frown, color: 'text-blue-700' },
  { value: 'Distressed', label: 'Distressed', icon: AlertCircle, color: 'text-red-700' },
];

export function WellnessTrackerClient() {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchMoodHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/wellness');
      if (response.ok) {
        const data = await response.json();
        setMoodHistory(data);
      }
    } catch (error) {
      console.error('Error fetching mood history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          note: note || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit check-in');
      }

      toast({
        title: 'Check-in recorded!',
        description: 'Your mood has been tracked. Thank you for checking in with yourself today.',
      });

      setSelectedMood('');
      setNote('');
      fetchMoodHistory();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodColor = (mood: string) => {
    const moodOption = moodOptions.find((m) => m.value === mood);
    if (moodOption) {
      const baseColor = moodOption.color.replace('text-', '');
      return baseColor;
    }
    return 'gray-500';
  };

  const chartData = moodHistory.slice(0, 14).reverse().map((entry) => ({
    day: new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    mood: entry.mood,
    color: getMoodColor(entry.mood),
  }));

  const moodCounts: Record<string, number> = {};
  moodHistory.forEach((entry) => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">How are you feeling today?</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {moodOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={selectedMood === option.value ? 'default' : 'outline'}
                className="flex flex-col items-center gap-1 h-auto py-3"
                onClick={() => setSelectedMood(option.value)}
              >
                <Icon className={`h-5 w-5 ${option.color}`} />
                <span className="text-xs">{option.label}</span>
              </Button>
            );
          })}
        </div>

        {selectedMood && (
          <div className="space-y-3">
            <Textarea
              placeholder="Add a note about how you're feeling (optional)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedMood}
              </Badge>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? 'Saving...' : 'Save Check-in'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {moodHistory.length > 0 && (
        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-lg font-semibold">Your Mood Journey</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(moodCounts).map(([mood, count]) => (
              <Card key={mood}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getMoodColor(mood).replace('text-', 'text-')}`}>
                      {count}
                    </span>
                    <span className="text-sm">{mood}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="pt-4 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length > 0) {
                        return (
                          <div className="text-xs bg-background border p-2 rounded">
                            {payload[0].value}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="mood" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
