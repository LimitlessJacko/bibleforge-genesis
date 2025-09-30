import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Clock, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  scripture: string[];
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
}

const triviaQuestions: Question[] = [
  {
    id: "q_001",
    question: "Who led the Israelites out of Egypt?",
    options: ["Abraham", "Moses", "Joshua", "David"],
    correctAnswer: 1,
    scripture: ["Exodus 3-14"],
    difficulty: "Easy"
  },
  {
    id: "q_002",
    question: "Which prophet was swallowed by a great fish?",
    options: ["Elijah", "Jonah", "Isaiah", "Ezekiel"],
    correctAnswer: 1,
    scripture: ["Jonah 1-4"],
    difficulty: "Easy"
  },
  {
    id: "q_003",
    question: "How many days and nights did Jesus fast in the wilderness?",
    options: ["30", "40", "50", "70"],
    correctAnswer: 1,
    scripture: ["Matthew 4:2", "Luke 4:2"],
    difficulty: "Medium"
  },
  {
    id: "q_004",
    question: "What was David's occupation before becoming king?",
    options: ["Soldier", "Priest", "Shepherd", "Merchant"],
    correctAnswer: 2,
    scripture: ["1 Samuel 16:11"],
    difficulty: "Easy"
  },
  {
    id: "q_005",
    question: "Who was the first king of Israel?",
    options: ["Saul", "David", "Solomon", "Samuel"],
    correctAnswer: 0,
    scripture: ["1 Samuel 10:24"],
    difficulty: "Medium"
  },
  {
    id: "q_006",
    question: "How many books are in the New Testament?",
    options: ["24", "25", "27", "29"],
    correctAnswer: 2,
    scripture: ["General Biblical Knowledge"],
    difficulty: "Medium"
  },
  {
    id: "q_007",
    question: "Who denied Jesus three times?",
    options: ["Judas", "Peter", "Thomas", "John"],
    correctAnswer: 1,
    scripture: ["Matthew 26:69-75"],
    difficulty: "Easy"
  },
  {
    id: "q_008",
    question: "How many plagues did God send on Egypt?",
    options: ["7", "10", "12", "15"],
    correctAnswer: 1,
    scripture: ["Exodus 7-12"],
    difficulty: "Medium"
  },
  {
    id: "q_009",
    question: "Who was the wisest king in the Bible?",
    options: ["David", "Saul", "Solomon", "Hezekiah"],
    correctAnswer: 2,
    scripture: ["1 Kings 3:12"],
    difficulty: "Easy"
  },
  {
    id: "q_010",
    question: "What was the name of the garden where Jesus prayed before his arrest?",
    options: ["Eden", "Gethsemane", "Bethany", "Olivet"],
    correctAnswer: 1,
    scripture: ["Matthew 26:36"],
    difficulty: "Hard"
  }
];

const ScriptureTrivia = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<"menu" | "playing" | "result">("menu");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(-1);
    }
  }, [timeLeft, gameState, showResult]);

  const startGame = () => {
    const shuffled = [...triviaQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
    setGameState("playing");
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      const basePoints = 10;
      const timeBonus = Math.floor(timeLeft * 0.5);
      const streakBonus = streak * 5;
      const totalPoints = basePoints + timeBonus + streakBonus;
      
      setScore(prev => prev + totalPoints);
      setStreak(prev => prev + 1);
      
      toast({
        title: "Correct! 🎉",
        description: `+${totalPoints} points (Base: ${basePoints} + Time: ${timeBonus} + Streak: ${streakBonus})`
      });
    } else {
      setStreak(0);
      toast({
        title: "Incorrect",
        description: `The correct answer was: ${currentQuestion.options[currentQuestion.correctAnswer]}`,
        variant: "destructive"
      });
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeLeft(30);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameState("result");
      }
    }, 2000);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-glow">
          Scripture Trivia
        </h1>

        {gameState === "menu" && (
          <Card className="max-w-2xl mx-auto p-8 text-center space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Test Your Biblical Knowledge</h2>
              <p className="text-muted-foreground">
                Answer questions correctly to earn points. Speed and streaks multiply your score!
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="font-semibold">Base Points</p>
                <p className="text-2xl font-bold">10</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="font-semibold">Time Bonus</p>
                <p className="text-2xl font-bold">×0.5</p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10">
                <p className="font-semibold">Streak Bonus</p>
                <p className="text-2xl font-bold">+5</p>
              </div>
            </div>

            <Button size="lg" onClick={startGame} className="text-lg px-8">
              <Sparkles className="mr-2 h-5 w-5" /> Start Quiz
            </Button>
          </Card>
        )}

        {gameState === "playing" && currentQuestion && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="text-xl font-bold">{score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <span className="text-lg">Streak: {streak}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className={`text-2xl font-bold ${timeLeft < 10 ? "text-destructive animate-pulse" : ""}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <Card className="p-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-4">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="font-semibold">{currentQuestion.difficulty}</span>
              </div>
              
              <Progress value={(currentQuestionIndex / questions.length) * 100} className="mb-6" />

              <h3 className="text-2xl font-bold mb-6">{currentQuestion.question}</h3>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={
                      showResult
                        ? index === currentQuestion.correctAnswer
                          ? "default"
                          : selectedAnswer === index
                          ? "destructive"
                          : "outline"
                        : "outline"
                    }
                    className="w-full justify-start text-left h-auto py-4 px-6"
                    onClick={() => !showResult && handleAnswer(index)}
                    disabled={showResult}
                  >
                    <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>

              {showResult && (
                <div className="mt-6 p-4 rounded-lg bg-muted">
                  <p className="text-sm font-semibold mb-1">Scripture Reference:</p>
                  <p className="text-sm text-muted-foreground">{currentQuestion.scripture.join(", ")}</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {gameState === "result" && (
          <Card className="max-w-2xl mx-auto p-8 text-center space-y-6">
            <h2 className="text-3xl font-bold">Quiz Complete!</h2>
            
            <div className="space-y-4">
              <div className="p-6 rounded-lg bg-primary/10">
                <p className="text-lg font-semibold mb-2">Final Score</p>
                <p className="text-5xl font-bold text-primary">{score}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-semibold">Questions Answered</p>
                  <p className="text-2xl font-bold">{questions.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-semibold">Best Streak</p>
                  <p className="text-2xl font-bold">{streak}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button size="lg" onClick={startGame}>
                Play Again
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/")}>
                Return Home
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ScriptureTrivia;
