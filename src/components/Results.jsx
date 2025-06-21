import React from 'react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';

const Results = () => {
  const { state } = useLocation();
  const { name, score, total, answers = [], questions = [], topic } = state || {};

  // Fill in unanswered questions
  const completeAnswers = questions.map((q, i) => {
    return answers[i] || {
      question: q.question,
      selected: "Skipped",
      correct: q.answer,
      isCorrect: false,
      type: q.type
    };
  });

  const downloadResults = () => {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(14);
    doc.text(`Quiz Results for ${name || "Unknown"}`, 10, y); y += 10;
    doc.text(`Topic: ${topic || "Unknown Topic"}`, 10, y); y += 10;
    doc.text(`Score: ${score ?? 0} / ${total ?? 0}`, 10, y); y += 10;

    y += 10;
    doc.setFontSize(12);
    completeAnswers.forEach((ans, i) => {
      const lines = [
        `Q${i + 1}: ${ans.question || "Missing question"}`,
        `Your Answer: ${ans.selected || "Skipped"}`,
        `Correct Answer: ${ans.correct || "Not available"}`,
        `Status: ${ans.isCorrect ? "✅ Correct" : "❌ Incorrect"}`
      ];

      lines.forEach(line => {
        if (y > 280) {
          doc.addPage();
          y = 10;
        }
        doc.text(line, 10, y);
        y += 8;
      });

      y += 5; // space after each question
    });

    doc.save(`${name || 'quiz'}_results.pdf`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h2>🎉 Quiz Completed!</h2>
      <h3>{name ? `${name}, your score is:` : "Your quiz results"}</h3>
      <h1>{score ?? 0} / {total ?? 0}</h1>

      <button onClick={downloadResults} style={{
        padding: '0.7rem 1.5rem',
        fontSize: '1rem',
        backgroundColor: '#10B981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      }}>
        📄 Download PDF Results
      </button>

      <div style={{ marginTop: '2rem' }}>
        <h3>Review Answers</h3>
        {completeAnswers.length === 0 ? (
          <p>No answers were recorded.</p>
        ) : (
          completeAnswers.map((ans, i) => (
            <div key={i} style={{
              marginBottom: '1rem',
              borderBottom: '1px solid #ccc',
              paddingBottom: '0.5rem'
            }}>
              <strong>Q{i + 1}:</strong> {ans.question || "Missing question"}<br />
              <strong>Your Answer:</strong> {ans.selected || <span style={{ color: 'orange' }}>Skipped</span>} <br />
              <strong>Correct Answer:</strong> {ans.correct || "Not available"} <br />
              <strong>Status:</strong> {ans.isCorrect ? '✅ Correct' : '❌ Incorrect'}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Results;
