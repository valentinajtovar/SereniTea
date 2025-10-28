export type AssessmentAnswer = {
    questionId: string;
    value: number; // Likert 0-3
  };
  
  export type AssessmentResult = {
    userId: string;
    createdAt: number; // Date.now()
    instrument: 'EAT-26' | 'CUSTOM';
    answers: AssessmentAnswer[];
    totalScore: number;
  };
  