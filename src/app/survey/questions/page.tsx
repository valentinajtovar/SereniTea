//flujo de preguntas y análisis de las respuestas 
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/data/questions";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
//import { db, auth } from "@/firebase";
import { auth, db } from '@/lib/firebase-client';
import { doc, setDoc } from "firebase/firestore";

export default function SurveyQuestions() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const current = questions[index];
  const progress = ((index + 1) / questions.length) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      saveSurvey(newAnswers);
    }
  };

  const saveSurvey = async (answers: number[]) => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;

    const result = analyzeSurvey(answers);

    await setDoc(doc(db, "surveys", user.uid), {
      answers,
      result,
      createdAt: new Date(),
    });

    setLoading(false);
    //router.push(`/survey/result?type=${encodeURIComponent(result.type)}`);
    router.push('/login');

  };

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <Progress value={progress} className="mb-4" />
      <h2 className="text-xl font-semibold mb-2">{current.section}</h2>
      <p className="mb-6">{current.text}</p>
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5].map(num => (
          <Button key={num} onClick={() => handleAnswer(num)} disabled={loading}>
            {num}
          </Button>
        ))}
      </div>
      <p className="text-sm mt-4">
        Pregunta {index + 1} de {questions.length}
      </p>
    </div>
  );
}

// --- Lógica de análisis ---
function analyzeSurvey(answers: number[]) {
  const sections = {
    1: answers.slice(0, 8),
    2: answers.slice(8, 13),
    3: answers.slice(13, 17),
    4: answers.slice(17, 21),
    5: answers.slice(21, 26),
    6: answers.slice(26, 30),
  };

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const scores = Object.fromEntries(
    Object.entries(sections).map(([k, v]) => [k, avg(v)])
  );

  let type = "Sin patrón clínico claro";
  if (scores["1"] >= 4 && scores["4"] >= 4) type = "Anorexia Nerviosa";
  else if (scores["2"] >= 4 && scores["3"] >= 4 && scores["4"] >= 4)
    type = "Bulimia Nerviosa";
  else if (scores["2"] >= 4 && scores["3"] < 4)
    type = "Trastorno por Atracón (BED)";
  else if (scores["1"] >= 4 && scores["5"] >= 4) type = "ARFID";
  else if (scores["5"] >= 4) type = "Pica o Trastorno de Rumiación";

  return { type, scores };
}
