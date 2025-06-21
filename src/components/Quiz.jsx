import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
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

    // Remove any code block markers or markdown formatting
    raw = raw.replace(/```json|```/g, '').trim();

    // Find and extract the first valid JSON array in the response
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

    if (current.type === "MCQ") {
      updatedAnswers[currentIndex] = {
        question: current.question,
        type: current.type,
        selected: current.options[selectedOption],
        correct: current.answer,
        isCorrect: current.options[selectedOption]?.toLowerCase().trim() === current.answer.toLowerCase().trim()
      };
    } else if (current.type === "FIB") {
      const userAns = fibAnswer.trim();
      updatedAnswers[currentIndex] = {
        question: current.question,
        type: current.type,
        selected: userAns,
        correct: current.answer,
        isCorrect: userAns.toLowerCase() === current.answer.toLowerCase()
      };
    }

    setUserAnswers(updatedAnswers);
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
    if (selectedOption !== null || fibAnswer !== '') handleSaveAnswer();
    const finalScore = userAnswers.filter(ans => ans?.isCorrect).length;
    navigate('/results', {
      state: {
        name,
        score: finalScore,
        total: questions.length,
        answers: userAnswers,
        questions
      }
    });
  };

  if (loading)
    return <h2 style={{ textAlign: 'center' }}>🧠 Generating your quiz...</h2>;
  if (questions.length === 0)
    return <h2>No questions generated.</h2>;

  const current = questions[currentIndex];

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#fff' }}> 
      <h2>Welcome, {name}</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>Jump to Question: </label>
        <select value={currentIndex} onChange={handleJumpTo}>
          {questions.map((_, idx) => (
            <option key={idx} value={idx}>Q{idx + 1}</option>
          ))}
        </select>
      </div>

      <h3>Question {currentIndex + 1} / {questions.length}</h3>
      <p style={{ marginBottom: '1rem' }}>{current.question}</p>

      {current.type === 'MCQ' && current.options.map((opt, idx) => (
        <div key={idx} style={{ margin: '0.5rem 0' }}>
          <label>
            <input
              type="radio"
              name="option"
              checked={selectedOption === idx}
              onChange={() => setSelectedOption(idx)}
            />
            {" "}
            {String.fromCharCode(65 + idx)}. {opt}
          </label>
        </div>
      ))}

      {current.type === 'FIB' && (
        <div style={{ margin: '1rem 0' }}>
          <input
            type="text"
            placeholder="Type your answer here..."
            value={fibAnswer}
            onChange={(e) => setFibAnswer(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
          />
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <button onClick={handlePrevious} disabled={currentIndex === 0} style={btnStyle}>
          ⬅️ Previous
        </button>
        {!isLastQuestion && (
          <button onClick={handleNext} disabled={selectedOption === null && current.type === "MCQ"} style={btnStyle}>
            Next ➡️
          </button>
        )}
        {isLastQuestion && (
          <button onClick={handleSubmit} style={btnStyle}>
            ✅ Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

const btnStyle = {
  marginRight: '1rem',
  padding: '0.6rem 1.2rem',
  fontSize: '1rem',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  background: '#3B82F6',
  color: '#fff'
};

export default Quiz;