import React from 'react';
import { useLocation } from 'react-router-dom';

const Results = () => {
  const { state } = useLocation();
  const { name, score, total, answers } = state;

  const downloadResults = () => {
    const content = `
Quiz Results for ${name}
Topic: ${state.questions[0]?.question.substring(0, 20)}...
Score: ${score}/${total}
Details:

${answers.map((ans, i) => `
Q${i+1}: ${ans.question}
Your Answer: ${ans.selected}
Correct Answer: ${ans.correct}
Status: ${ans.isCorrect ? '✅ Correct' : '❌ Incorrect'}
`).join('\n')}
`.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}_quiz_results.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
      <h2>🎉 Quiz Completed!</h2>
      <h3>{name}, your score is:</h3>
      <h1>{score}/{total}</h1>

      <button onClick={downloadResults} style={{
        padding: '0.7rem 1.5rem',
        fontSize: '1rem',
        backgroundColor: '#10B981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      }}>
        📥 Download Results
      </button>

      <div style={{ marginTop: '2rem' }}>
        <h3>Review Answers</h3>
        {answers.map((ans, i) => (
          <div key={i} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
            <strong>Q{i+1}:</strong> {ans.question}<br />
            <strong>Your Answer:</strong> {ans.selected} <br />
            <strong>Correct Answer:</strong> {ans.correct} <br />
            <strong>Status:</strong> {ans.isCorrect ? '✅ Correct' : '❌ Incorrect'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;