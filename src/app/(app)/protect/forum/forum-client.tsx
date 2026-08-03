'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, MessageCircle, Send, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ForumPost = {
  id: string;
  author: { name: string | null; email: string | null };
  content: string;
  parentId: string | null;
  isFlagged: boolean;
  createdAt: string;
};

export function ForumClient() {
  const [threads, setThreads] = useState<ForumPost[]>([]);
  const [selectedThread, setSelectedThread] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newReplyContent, setNewReplyContent] = useState('');
  const { toast } = useToast();

  const fetchThreads = async () => {
    try {
      const response = await fetch('/api/forum');
      if (response.ok) {
        const data = await response.json();
        setThreads(data);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReplies = async (parentId: string) => {
    try {
      const response = await fetch(`/api/forum/${parentId}?parentId=${parentId}`);
      if (response.ok) {
        const data = await response.json();
        setReplies(data);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    try {
      const response = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPostContent }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create post');
      }

      toast({ title: 'Post created!' });
      setNewPostContent('');
      setIsNewPostOpen(false);
      fetchThreads();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const handleCreateReply = async () => {
    if (!newReplyContent.trim() || !selectedThread) return;
    try {
      const response = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newReplyContent,
          parentId: selectedThread.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create reply');
      }

      toast({ title: 'Reply posted!' });
      setNewReplyContent('');
      fetchReplies(selectedThread.id);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const openThread = (thread: ForumPost) => {
    setSelectedThread(thread);
    fetchReplies(thread.id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Threads</h3>
          <Button
            size="sm"
            onClick={() => setIsNewPostOpen(true)}
            variant={isNewPostOpen ? 'default' : 'outline'}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {isNewPostOpen ? 'Cancel' : 'New Post'}
          </Button>
        </div>

        {isNewPostOpen && (
          <Card className="mb-4">
            <CardContent className="pt-4">
              <Textarea
                placeholder="Start a new discussion..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="mb-3"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                  Post
                </Button>
                <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <p className="text-muted-foreground">Loading threads...</p>
          ) : threads.length === 0 ? (
            <p className="text-muted-foreground">No threads yet. Be the first to start a discussion!</p>
          ) : (
            threads.map((thread) => (
              <Card
                key={thread.id}
                className={`cursor-pointer transition-colors ${
                  selectedThread?.id === thread.id ? 'border-primary' : ''
                }`}
                onClick={() => openThread(thread)}
              >
                <CardContent className="pt-3">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {thread.author.name?.[0] || thread.author.email?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm line-clamp-3">{thread.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {thread.author.name || thread.author.email || 'Anonymous'}
                        </span>
                        {thread.isFlagged && (
                          <Shield className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {selectedThread ? (
          <>
            <Card className="mb-4">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedThread.author.name?.[0] || selectedThread.author.email?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">
                        {selectedThread.author.name || selectedThread.author.email || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(selectedThread.createdAt).toLocaleString()}
                      </span>
                      {selectedThread.isFlagged && (
                        <Shield className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm">{selectedThread.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
              {replies.length === 0 ? (
                <p className="text-sm text-muted-foreground">No replies yet.</p>
              ) : (
                replies.map((reply) => (
                  <div key={reply.id} className="ml-6 pl-4 border-l">
                    <div className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {reply.author.name?.[0] || reply.author.email?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-xs">
                            {reply.author.name || reply.author.email || 'Anonymous'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Card>
              <CardContent className="pt-4">
                <Textarea
                  placeholder="Write a reply (AI-modated before posting)..."
                  value={newReplyContent}
                  onChange={(e) => setNewReplyContent(e.target.value)}
                  className="mb-3"
                />
                <Button onClick={handleCreateReply} disabled={!newReplyContent.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="h-[500px] flex items-center justify-center border-dashed">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2" />
              <p>Select a thread to view the discussion</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
