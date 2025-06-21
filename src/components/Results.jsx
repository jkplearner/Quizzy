import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import './Results.css';

const Results = () => {
  const { state } = useLocation();
  const { name, score, total, answers = [], questions = [], topic } = state || {};
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const dpr = window.devicePixelRatio || 1;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset any existing transform
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();

    // Dynamic star density
    const starCount = Math.floor((window.innerWidth * window.innerHeight) / 10000)*3;
    const stars = Array.from({ length: starCount }, () => {
      const speed = Math.random() * 0.5 + 0.2;
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.2 + 0.5,
        speed: speed,
        originalSpeed: speed,
        opacity: Math.random() * 3 + 0.2,
        angle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.5 + 0.2
      };
    });

    let time = 0;

    const animate = () => {
      time += 0.01;

      // Motion blur background
      ctx.fillStyle = 'rgba(28, 28, 40, 0.7)';
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      stars.forEach(star => {
        const twinkle = Math.abs(Math.sin(time * star.twinkleSpeed));

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.fill();

        // Move star
        star.x -= star.speed;
        star.y += star.speed * 0.3 + Math.sin(time + star.angle) * 0.5;

        // Slight speed variation
        star.speed = star.originalSpeed * (0.9 + Math.sin(time * 0.5 + star.angle) * 0.1);

        // Reset if out of bounds
        if (star.x < -20 || star.y > window.innerHeight + 20) {
          star.x = window.innerWidth + Math.random() * 100;
          star.y = Math.random() * window.innerHeight / 2;
          star.size = Math.random() * 1.5 + 0.5;
          star.opacity = Math.random() * 0.8 + 0.2;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

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

      y += 5;
    });

    doc.save(`${name || 'quiz'}_results.pdf`);
  };

  return (
    <div className="results-container">
      <canvas ref={canvasRef} className="results-canvas" />
      <div className="results-content">
        <div className="results-header">
          <h2>🎉 Quiz Completed!</h2>
          <h3>{name ? `${name}, your score is:` : "Your quiz results"}</h3>
          <h1>{score ?? 0} / {total ?? 0}</h1>
        </div>

        <button onClick={downloadResults} className="download-btn">
          <span role="img" aria-label="download">📄</span> Download PDF Results
        </button>

        <div className="answers-section">
          <h3>Review Answers</h3>
          {completeAnswers.length === 0 ? (
            <p className="no-answers">No answers were recorded.</p>
          ) : (
            completeAnswers.map((ans, i) => (
              <div key={i} className="answer-item">
                <p><strong>Q{i + 1}:</strong> {ans.question || "Missing question"}</p>
                <p>
                  <strong>Your Answer:</strong> {ans.selected || 
                    <span className="skipped-status">Skipped</span>}
                </p>
                <p><strong>Correct Answer:</strong> {ans.correct || "Not available"}</p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`status-indicator ${ans.isCorrect ? 'correct-status' : 'incorrect-status'}`}>
                    {ans.isCorrect ? (
                      <>
                        <span role="img" aria-label="correct">✅</span> Correct
                      </>
                    ) : (
                      <>
                        <span role="img" aria-label="incorrect">❌</span> Incorrect
                      </>
                    )}
                  </span>
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
