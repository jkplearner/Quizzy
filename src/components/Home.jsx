import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  // Form state
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('Beginner');
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Starfield animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Create stars
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.2 + 0.5,
      speed: Math.random() * 0.5 + 0.2
    }));

    // Animation loop
    const animate = () => {
      // Clear canvas with dark background
      ctx.fillStyle = '#1C1C28';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update stars
      ctx.fillStyle = 'white';
      stars.forEach(star => {
        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Move star diagonally
        star.x -= star.speed;
        star.y += star.speed * 0.3;

        // Reset star if out of bounds
        if (star.x < 0 || star.y > canvas.height) {
          star.x = canvas.width;
          star.y = Math.random() * canvas.height / 2;
          star.size = Math.random() * 1.2 + 0.5; // Randomize size when reset
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle resize
    window.addEventListener('resize', resizeCanvas);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/quiz', {
      state: {
      name,
      topic,
      numQuestions,
      difficulty
      }
    });
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundColor: '#1C1C28'
    }}>
      {/* Starfield Canvas */}
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
          width: '100%',
          height: '100%'
        }}
      />

      {/* Quiz Form */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'rgba(46, 46, 62, 0.85)',
        padding: '2rem',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '500px',
        color: '#E5E7EB',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontSize: '2.2rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #6EE7B7, #3B82F6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Quizzy
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              fontSize: '0.95rem'
            }}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: '#3F3F51',
                color: '#FFFFFF',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Topic Field */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              fontSize: '0.95rem'
            }}>
              Quiz Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter quiz topic"
              required
              style={{
                width: '93.5%',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: '#3F3F51',
                color: '#FFFFFF',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Number of Questions */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              fontSize: '0.95rem'
            }}>
              Number of Questions
            </label>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: '#3F3F51',
                color: '#FFFFFF',
                fontSize: '1rem',
                appearance: 'none'
              }}
            >
              {[10, 15, 20, 25, 30].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Level */}
          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              fontSize: '0.95rem'
            }}>
              Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: '#3F3F51',
                color: '#FFFFFF',
                fontSize: '1rem',
                appearance: 'none'
              }}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #6EE7B7, #3B82F6)',
              border: 'none',
              borderRadius: '8px',
              color: '#1E293B',
              fontSize: '1.05rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(110, 231, 183, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Start Quiz
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;