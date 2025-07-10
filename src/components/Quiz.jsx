import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Quiz.css';

const Quiz = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { name, topic, numQuestions, difficulty } = state;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [fibAnswer, setFibAnswer] = useState('');

  const isLastQuestion = currentIndex === questions.length - 1;

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);

      const prompt = `
Generate ${numQuestions} ${difficulty}-level quiz questions about "${topic}".
Each question should be in this format:
{
  "type": "MCQ" or "FIB",
  "question": "...",
  "options": ["A", "B", "C", "D"], // for MCQ
  "answer": "..."
}
Only include FIB questions if level is Expert.
Return a valid JSON array. No explanations. No markdown.
      `;

      try {
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        const data = await response.json();
        let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        raw = raw.replace(/json|```/g, '').trim();
        const jsonStart = raw.indexOf('[');
        const jsonEnd = raw.lastIndexOf(']') + 1;
        const jsonText = raw.slice(jsonStart, jsonEnd);

        let parsed = [];
        try {
          parsed = JSON.parse(jsonText);
        } catch (e) {
          console.error("🚨 JSON parse error:\n", e);
          console.log("💬 Raw response:\n", raw);
          alert('Error parsing Gemini response. Try refreshing.');
          return;
        }

        const filtered = parsed.filter(q => q.type !== "FIB" || difficulty === "Expert");
        setQuestions(filtered);
        setUserAnswers(new Array(filtered.length).fill(null));
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        alert("Failed to load questions. Check API or connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [topic, difficulty, numQuestions]);

  const handleSaveAnswer = () => {
    const updatedAnswers = [...userAnswers];
    const current = questions[currentIndex];

    let selected = "Skipped";
    let isCorrect = false;

    if (current.type === "MCQ") {
      if (selectedOption !== null) {
        selected = current.options[selectedOption];
        isCorrect = selected.toLowerCase() === current.answer.toLowerCase();
      }
    } else if (current.type === "FIB") {
      if (fibAnswer.trim() !== '') {
        selected = fibAnswer.trim();
        isCorrect = selected.toLowerCase() === current.answer.toLowerCase();
      }
    }

    const savedAnswer = {
      question: current.question,
      type: current.type,
      selected,
      correct: current.answer,
      isCorrect
    };

    updatedAnswers[currentIndex] = savedAnswer;
    setUserAnswers(updatedAnswers);
    return { updatedAnswers, savedAnswer };
  };

  const handleNext = () => {
    if (selectedOption !== null || fibAnswer !== '') handleSaveAnswer();
    setSelectedOption(null);
    setFibAnswer('');
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };

  const handlePrevious = () => {
    if (selectedOption !== null || fibAnswer !== '') handleSaveAnswer();
    setSelectedOption(null);
    setFibAnswer('');
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleJumpTo = (e) => {
    if (selectedOption !== null || fibAnswer !== '') handleSaveAnswer();
    setSelectedOption(null);
    setFibAnswer('');
    setCurrentIndex(Number(e.target.value));
  };

  const handleSubmit = () => {
    const { updatedAnswers, savedAnswer } = handleSaveAnswer();

    console.log("🌟 Final saved answer for current question:", savedAnswer);

    const finalAnswers = updatedAnswers.map((ans, i) => {
      if (ans === null) {
        return {
          question: questions[i].question,
          selected: "Skipped",
          correct: questions[i].answer,
          isCorrect: false,
          type: questions[i].type
        };
      }
      return ans;
    });

    const finalScore = finalAnswers.filter(ans => ans.isCorrect).length;

    navigate('/results', {
      state: {
        name,
        topic,
        score: finalScore,
        total: questions.length,
        answers: finalAnswers,
        questions
      }
    });
  };

  if (loading)
    return <div className="loading-message">🧠 Generating your quiz...</div>;

  if (questions.length === 0)
    return <div className="error-message">No questions generated.</div>;

  const current = questions[currentIndex];

  // Function to clean option labels like "A) Forest" => "Forest"
  const cleanOption = (option) => {
    return option.replace(/^[A-D][\).:\-]\s*/, '').trim();
  };

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>Welcome, {name}</h2>
        <div className="question-nav">
          <label>Jump to Question: </label>
          <select className="question-select" value={currentIndex} onChange={handleJumpTo}>
            {questions.map((_, idx) => (
              <option key={idx} value={idx}>Q{idx + 1}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="question-content">
        <h3 className="question-counter">Question {currentIndex + 1} / {questions.length}</h3>
        <p className="question-text">{current.question}</p>

        {current.type === 'MCQ' && (
          <div className="options-container">
            {current.options.map((opt, idx) => (
              <label key={idx} className="option-label">
                <input
                  className="option-input"
                  type="radio"
                  name="option"
                  checked={selectedOption === idx}
                  onChange={() => setSelectedOption(idx)}
                />
                {String.fromCharCode(65 + idx)}. {cleanOption(opt)}
              </label>
            ))}
          </div>
        )}

        {current.type === 'FIB' && (
          <input
            type="text"
            className="fib-input"
            placeholder="Type your answer here..."
            value={fibAnswer}
            onChange={(e) => setFibAnswer(e.target.value)}
          />
        )}
      </div>

      <div className="button-container">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="btn btn-previous"
        >
          ⬅ Previous
        </button>
        {!isLastQuestion ? (
          <button
            onClick={handleNext}
            disabled={selectedOption === null && current.type === "MCQ"}
            className="btn btn-next"
          >
            Next ➡
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={current.type === "MCQ" && selectedOption === null}
            className="btn btn-submit"
          >
            ✅ Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
