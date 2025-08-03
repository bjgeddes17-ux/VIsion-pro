// script.js - VisionAI Sports AI Engine

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const getStartedBtn = document.getElementById('get-started');
  const watchDemoBtn = document.getElementById('watch-demo');
  const uploadButtons = document.querySelectorAll('.btn-upload');
  const videoInput = document.getElementById('videoInput');
  const videoPreview = document.getElementById('videoPreview');
  const outputCanvas = document.getElementById('outputCanvas');
  const feedbackScreen = document.getElementById('feedbackScreen');
  const feedbackText = document.getElementById('feedbackText');
  const playFeedbackBtn = document.getElementById('playFeedback');
  const userCanvas = document.getElementById('userCanvas');
  const proCanvas = document.getElementById('proCanvas');
  const userCtx = userCanvas.getContext('2d');
  const proCtx = proCanvas.getContext('2d');

  let pose;

  // Initialize MediaPipe Pose
  if (typeof Pose !== 'undefined') {
    pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.onResults(onResults);
  }

  // Button Event Listeners
  getStartedBtn.addEventListener('click', () => {
    alert('🎯 Welcome to VisionAI! Choose a sport to get started.');
  });

  watchDemoBtn.addEventListener('click', () => {
    alert('▶️ Demo video would play here. In full version: YouTube link.');
  });

  uploadButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      videoInput.click();
    });
  });

  videoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      videoPreview.src = url;
      videoPreview.style.display = 'block';
      outputCanvas.style.display = 'block';

      // Simulate analysis
      setTimeout(() => {
        if (pose) {
          pose.send({ image: videoPreview });
        }
      }, 1000);
    }
  });

  playFeedbackBtn.addEventListener('click', () => {
    const msg = new SpeechSynthesisUtterance(feedbackText.innerText);
    msg.lang = 'en-ZA';
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
  });

  // MediaPipe Results Handler
  function onResults(results) {
    // Hide main content, show feedback
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.classes').style.display = 'none';
    document.querySelector('.power-excello').style.display = 'none';
    document.querySelector('.testimonials').style.display = 'none';
    document.querySelector('.contact').style.display = 'none';
    feedbackScreen.style.display = 'block';

    // Draw user pose
    drawPose(userCtx, results.poseLandmarks, '#FF4D4D');

    // Draw pro pose (example)
    const proLandmarks = getProPose('lebron-backhand');
    drawPose(proCtx, proLandmarks, '#00FF00');

    // Generate feedback
    const feedback = generateFeedback(results);
    feedbackText.innerText = feedback;
  }

  // Draw pose on canvas
  function drawPose(ctx, landmarks, color) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    if (!landmarks) return;

    // Draw connections
    drawConnectors(ctx, landmarks, POSE_CONNECTIONS, { color, lineWidth: 4 });
    
    // Draw landmarks
    drawLandmarks(ctx, landmarks, { color, radius: 5 });
  }

  // Feedback Engine
  function generateFeedback(results) {
    const lm = results.poseLandmarks;
    if (!lm) return "Could not detect form. Try again with better lighting.";

    if (lm[11].y < lm[23].y - 0.05) {
      return "Your backhand is early. Try rotating later for more control.";
    }

    return "Great form! Keep training like a pro.";
  }

  // Pro pose data (simplified)
  function getProPose(key) {
    const proData = {
      'lebron-backhand': [
        { x: 0.45, y: 0.30, visibility: 1 },
        { x: 0.44, y: 0.32, visibility: 1 },
        { x: 0.46, y: 0.31, visibility: 1 },
        // ... full 33 points
      ]
    };
    return proData[key] || [];
  }

  // MediaPipe Helpers
  function drawConnectors(ctx, landmarks, connections, config = {}) {
    const color = config.color || '#000';
    const lineWidth = config.lineWidth || 1;
    for (const [i, j] of connections) {
      const a = landmarks[i];
      const b = landmarks[j];
      if (a && b && a.visibility > 0.5 && b.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(a.x * ctx.canvas.width, a.y * ctx.canvas.height);
        ctx.lineTo(b.x * ctx.canvas.width, b.y * ctx.canvas.height);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    }
  }

  function drawLandmarks(ctx, landmarks, config = {}) {
    const color = config.color || '#000';
    const radius = config.radius || 1;
    for (const landmark of landmarks) {
      if (landmark.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  }
});
