'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Award, Target, Minus, Plus, ArrowRightLeft } from 'lucide-react';
import { QuizQuestionSchema, QuestionType } from '@/ai/schemas/quiz-schema';
import { type z } from 'zod';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

interface InteractiveQuizProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  topic: string;
  questions: QuizQuestion[];
}

type AnswerStatus = 'unanswered' | 'correct' | 'incorrect';

// Helper to check if answer is correct for different question types
function checkAnswer(question: QuizQuestion, userAnswer: string): boolean {
  const correctAnswer = question.answer.trim().toLowerCase();
  const givenAnswer = userAnswer.trim().toLowerCase();
  
  switch (question.type) {
    case 'MCQ':
    case 'TRUE_FALSE':
      return givenAnswer === correctAnswer;
    case 'FILL_BLANK':
    case 'SHORT_ANSWER':
      // For fill-in-the-blank and short answer, do a flexible match
      // Check if the correct answer is contained in the user's answer or vice versa
      return givenAnswer.includes(correctAnswer) || correctAnswer.includes(givenAnswer);
    case 'MATCHING':
      // For matching, we'd need a more complex answer format
      // For now, treat as simple string match
      return givenAnswer === correctAnswer;
    default:
      return givenAnswer === correctAnswer;
  }
}

function renderQuestionInput(
  question: QuizQuestion,
  selectedAnswer: string | null,
  onAnswerChange: (answer: string) => void,
  answerStatus: AnswerStatus,
  disabled: boolean
) {
  switch (question.type) {
    case 'MCQ':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options?.map((option, index) => {
              const isCorrect = option === question.answer;
              const isSelected = option === selectedAnswer;

              let variant: 'default' | 'correct' | 'incorrect' = 'default';
              if (selectedAnswer) {
                  if (isCorrect) variant = 'correct';
                  else if (isSelected) variant = 'incorrect';
              }
              
              return (
                  <Button 
                      key={index}
                      variant="outline"
                      className={cn(
                          "h-auto min-h-16 whitespace-normal justify-start text-left",
                          variant === 'correct' && "bg-green-100 border-green-500 text-green-800 hover:bg-green-200",
                          variant === 'incorrect' && "bg-red-100 border-red-500 text-red-800 hover:bg-red-200"
                      )}
                      onClick={() => !disabled && onAnswerChange(option)}
                      disabled={disabled}
                  >
                      {option}
                      {selectedAnswer && isCorrect && <CheckCircle className="ml-auto h-5 w-5 text-green-600" />}
                      {isSelected && !isCorrect && <XCircle className="ml-auto h-5 w-5 text-red-600" />}
                  </Button>
              );
          })}
        </div>
      );

    case 'TRUE_FALSE':
      return (
        <div className="grid grid-cols-2 gap-4">
          {['True', 'False'].map((option) => (
            <Button
              key={option}
              variant="outline"
              className={cn(
                "h-auto min-h-16 whitespace-normal justify-start text-left",
                selectedAnswer && option === question.answer && "bg-green-100 border-green-500 text-green-800",
                selectedAnswer && option !== question.answer && option === selectedAnswer && "bg-red-100 border-red-500 text-red-800"
              )}
              onClick={() => !disabled && onAnswerChange(option)}
              disabled={disabled}
            >
              {option}
              {selectedAnswer && option === question.answer && <CheckCircle className="ml-auto h-5 w-5 text-green-600" />}
              {selectedAnswer && option !== question.answer && option === selectedAnswer && <XCircle className="ml-auto h-5 w-5 text-red-600" />}
            </Button>
          ))}
        </div>
      );

    case 'FILL_BLANK':
      return (
        <div className="w-full">
          <Label className="text-sm font-medium text-muted-foreground mb-2 block">
            Fill in the blank:
          </Label>
          <Input
            value={selectedAnswer || ''}
            onChange={(e) => !disabled && onAnswerChange(e.target.value)}
            disabled={disabled}
            placeholder="Type your answer here..."
            className={cn(
              selectedAnswer && answerStatus === 'correct' && 'border-green-500 bg-green-50',
              selectedAnswer && answerStatus === 'incorrect' && 'border-red-500 bg-red-50'
            )}
          />
          {selectedAnswer && answerStatus === 'incorrect' && (
            <p className="text-sm text-red-600 mt-1">The correct answer was: {question.answer}</p>
          )}
        </div>
      );

    case 'SHORT_ANSWER':
      return (
        <div className="w-full">
          <Label className="text-sm font-medium text-muted-foreground mb-2 block">
            Short answer:
          </Label>
          <Input
            value={selectedAnswer || ''}
            onChange={(e) => !disabled && onAnswerChange(e.target.value)}
            disabled={disabled}
            placeholder="Type your answer here..."
            className={cn(
              selectedAnswer && answerStatus === 'correct' && 'border-green-500 bg-green-50',
              selectedAnswer && answerStatus === 'incorrect' && 'border-red-500 bg-red-50'
            )}
          />
          {selectedAnswer && answerStatus === 'incorrect' && (
            <p className="text-sm text-red-600 mt-1">The correct answer was: {question.answer}</p>
          )}
        </div>
      );

    case 'MATCHING':
      // For matching questions, show the items to match with dropdowns
      // This is a simplified version - in a full implementation you'd want drag-and-drop
      if (!question.options || question.options.length === 0) {
        return <p className="text-muted-foreground">No matching items provided</p>;
      }
      const matchingOptions = question.options;
      return (
        <div className="space-y-3 w-full">
          <Label className="text-sm font-medium text-muted-foreground block">
            Match each item (select the correct pair):
          </Label>
          {matchingOptions.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="font-medium w-1/3">{item}</span>
              <Select
                value={selectedAnswer === item ? question.answer : ''}
                onValueChange={(value) => !disabled && onAnswerChange(`${item}::${value}`)}
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select match" />
                </SelectTrigger>
                <SelectContent>
                  {matchingOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="w-full">
          <Input
            value={selectedAnswer || ''}
            onChange={(e) => !disabled && onAnswerChange(e.target.value)}
            disabled={disabled}
            placeholder="Type your answer..."
          />
        </div>
      );
  }
}

export function InteractiveQuiz({ isOpen, onOpenChange, topic, questions }: InteractiveQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('unanswered');
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Prevent changing answer

    setSelectedAnswer(answer);
    const isCorrect = checkAnswer(currentQuestion, answer);
    if (isCorrect) {
      setScore(score + 1);
      setAnswerStatus('correct');
    } else {
      setAnswerStatus('incorrect');
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setAnswerStatus('unanswered');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setAnswerStatus('unanswered');
    setIsFinished(false);
    onOpenChange(false);
  };
  
  if (!isOpen) return null;

  if (isFinished) {
    return (
        <AlertDialog open={isFinished} onOpenChange={onOpenChange}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-yellow-500" />
                    Challenge Complete!
                </AlertDialogTitle>
                <AlertDialogDescription>
                You've finished the quiz on "{topic}". Here's how you did:
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Your Score</p>
                <p className="text-6xl font-bold text-primary">
                    {Math.round((score / questions.length) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    You answered {score} out of {questions.length} questions correctly.
                </p>
            </div>
            <AlertDialogFooter>
                <AlertDialogAction onClick={handleRestart}>Done</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Challenge: {topic}
          </AlertDialogTitle>
          <div className="flex items-center gap-4 pt-2">
            <Progress value={progress} className="w-full" />
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
        </AlertDialogHeader>
        
        <Card className="border-0 shadow-none">
            <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">{currentQuestion.type}</span>
                  <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
              {renderQuestionInput(currentQuestion, selectedAnswer, handleAnswer, answerStatus, !!selectedAnswer)}
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 w-full">
                {answerStatus === 'correct' && (
                    <div className="flex items-center gap-2 text-green-600 w-full">
                        <CheckCircle className="h-5 w-5" />
                        <p className="font-semibold">Correct!</p>
                        {currentQuestion.explanation && (
                          <p className="text-sm text-muted-foreground ml-7">{currentQuestion.explanation}</p>
                        )}
                    </div>
                )}
                {answerStatus === 'incorrect' && (
                     <div className="flex items-center gap-2 text-red-600 w-full">
                        <XCircle className="h-5 w-5" />
                        <p className="font-semibold">Not quite.</p>
                        <p className="text-sm text-muted-foreground ml-7">The correct answer was: {currentQuestion.answer}</p>
                        {currentQuestion.explanation && (
                          <p className="text-sm text-muted-foreground ml-7">{currentQuestion.explanation}</p>
                        )}
                    </div>
                )}
                {selectedAnswer && (
                     <Button onClick={handleNext} className="w-full">
                        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                )}
            </CardFooter>
        </Card>

      </AlertDialogContent>
    </AlertDialog>
  );
}
