import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, accessToken } = useAuthStore()

  const handleLogin = () => {
    // If already logged in, go straight to dashboard
    if (accessToken && user) {
      if (user.role === 'student') return navigate('/student/dashboard')
      if (user.role === 'faculty') return navigate('/faculty/dashboard')
      if (user.role === 'admin')   return navigate('/admin/dashboard')
    }
    navigate('/login')
  }

  const handleSignUp = () => {
    navigate('/register')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { overflow-x: hidden; }
        
        .landing-page {
          --green: #00ea64;
          --bg: #0a0a0a;
          --text: #ffffff;
          --muted: #888888;
          --border: rgba(255,255,255,0.08);
          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          position: relative;
        }

        .bg-glow {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,234,100,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 90% 60%, rgba(0,234,100,0.06) 0%, transparent 60%);
        }

        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          height: 72px;
          background: rgba(10,10,10,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 20px;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .logo-dot {
          width: 12px;
          height: 12px;
          background: var(--green);
          border-radius: 2px;
          box-shadow: 0 0 12px var(--green);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 36px;
          list-style: none;
        }

        .nav-links a {
          color: var(--muted);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
          cursor: pointer;
        }

        .nav-links a:hover { color: var(--text); }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-outline {
          background: none;
          border: 1px solid var(--border);
          cursor: pointer;
          color: var(--text);
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          padding: 8px 20px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.04);
        }

        .btn-green {
          background: var(--green);
          border: none;
          cursor: pointer;
          color: #000;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          padding: 9px 22px;
          border-radius: 8px;
          transition: all 0.2s;
          box-shadow: 0 0 20px rgba(0,234,100,0.3);
        }

        .btn-green:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 24px rgba(0,234,100,0.45);
        }

        .hero {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 24px 80px;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,234,100,0.08);
          border: 1px solid rgba(0,234,100,0.2);
          border-radius: 100px;
          padding: 6px 16px;
          margin-bottom: 48px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: var(--green);
          text-transform: uppercase;
        }

        .eyebrow-dot {
          width: 6px;
          height: 6px;
          background: var(--green);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--green);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .hero-heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 5vw, 80px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          max-width: 900px;
        }

        .line1, .line2 {
          color: rgba(255,255,255,0.2);
          display: block;
        }

        .line3 {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          color: var(--text);
        }

        .icon-human {
          width: 48px;
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .icon-ai {
          width: 48px;
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .star-inner {
          transform-origin: center;
          animation: star-spin 8s linear infinite;
        }

        @keyframes star-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hero-sub {
          margin-top: 36px;
          font-size: 16px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
          max-width: 440px;
        }

        .hero-cta {
          margin-top: 48px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-cta-outline {
          background: none;
          border: 1px solid rgba(255,255,255,0.2);
          color: var(--text);
          cursor: pointer;
          font-size: 15px;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          padding: 14px 32px;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .btn-cta-outline:hover {
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.04);
        }

        .trust-strip {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 48px;
        }

        .trust-label {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.1em;
          color: var(--muted);
          text-transform: uppercase;
          margin-bottom: 28px;
        }

        .trust-logos {
          display: flex;
          align-items: center;
          gap: 48px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .trust-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: rgba(255,255,255,0.25);
          letter-spacing: -0.02em;
          transition: color 0.3s;
        }

        .trust-logo:hover { color: rgba(255,255,255,0.6); }

        .features {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border);
          margin: 0 48px 80px;
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }

        .feature-card {
          background: var(--bg);
          padding: 40px 36px;
          transition: background 0.3s;
        }

        .feature-card:hover { background: rgba(0,234,100,0.03); }

        .feature-icon {
          width: 40px;
          height: 40px;
          background: rgba(0,234,100,0.15);
          border: 1px solid rgba(0,234,100,0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 18px;
        }

        .feature-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .feature-desc {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.7;
        }

        .stats-bar {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: center;
          gap: 80px;
          padding: 60px 48px;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 80px;
          flex-wrap: wrap;
        }

        .stat { text-align: center; }

        .stat-num {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 42px;
          letter-spacing: -0.03em;
          color: var(--text);
        }

        .stat-num span { color: var(--green); }

        .stat-label {
          font-size: 13px;
          color: var(--muted);
          margin-top: 6px;
        }

        .landing-footer {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 40px;
          border-top: 1px solid var(--border);
          font-size: 13px;
          color: rgba(255,255,255,0.2);
        }

        @media (max-width: 900px) {
          .landing-nav { padding: 0 20px; }
          .nav-links { display: none; }
          .features { grid-template-columns: 1fr; margin: 0 20px 60px; }
          .stats-bar { gap: 40px; }
          .trust-logos { gap: 28px; }
          .hero-heading { font-size: clamp(28px, 7vw, 56px); }
          .line3 { gap: 8px; }
        }
      `}</style>

      <div className="landing-page">
        <div className="bg-glow"></div>

        {/* NAV */}
        <nav className="landing-nav">
          <div className="logo">
            InternLearn
            <div className="logo-dot"></div>
          </div>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#stats">Stats</a></li>
            <li><a href="#about">About</a></li>
          </ul>
          <div className="nav-actions">
            <button className="btn-outline" onClick={handleLogin}>
              {accessToken ? 'Dashboard' : 'Login'}
            </button>
            <button className="btn-green" onClick={accessToken ? handleLogin : handleSignUp}>
              {accessToken ? 'Go to Dashboard' : 'Sign Up'}
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-eyebrow">
            <div className="eyebrow-dot"></div>
            Now in GenAI Era
          </div>
          <h1 className="hero-heading">
            <div className="line1">The future</div>
            <div className="line2">of learning</div>
            <div className="line3">
              is
              <span className="icon-human">
                <svg width="44" height="48" viewBox="0 0 180 200" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <clipPath id="fp-clip">
                      <ellipse cx="90" cy="100" rx="78" ry="88"/>
                    </clipPath>
                  </defs>
                  <style>{`.ridge { fill:none; stroke:#00e05a; stroke-linecap:round; stroke-linejoin:round; }`}</style>
                  <g clipPath="url(#fp-clip)">
                    <path className="ridge" strokeWidth="5" d="M 16,155 Q 12,110 20,72 Q 30,30 60,12 Q 90,-2 120,12 Q 150,30 160,72 Q 168,110 164,155"/>
                    <path className="ridge" strokeWidth="4.8" d="M 27,155 Q 24,112 31,76 Q 40,38 64,22 Q 90,8 116,22 Q 140,38 149,76 Q 156,112 153,155"/>
                    <path className="ridge" strokeWidth="4.6" d="M 38,155 Q 36,114 42,80 Q 50,46 70,32 Q 90,20 110,32 Q 130,46 138,80 Q 144,114 142,155"/>
                    <path className="ridge" strokeWidth="4.4" d="M 50,155 Q 48,116 53,84 Q 60,54 76,42 Q 90,33 104,42 Q 120,54 127,84 Q 132,116 130,155"/>
                    <path className="ridge" strokeWidth="4.2" d="M 62,155 Q 60,118 64,89 Q 70,64 82,53 Q 90,47 98,53 Q 110,64 116,89 Q 120,118 118,155"/>
                    <path className="ridge" strokeWidth="4" d="M 74,155 Q 72,120 75,95 Q 79,74 88,64 Q 92,60 102,64 Q 108,74 105,95 Q 106,120 106,155"/>
                    <path className="ridge" strokeWidth="3.8" d="M 85,155 Q 84,124 85,103 Q 86,88 90,82 Q 94,88 95,103 Q 96,124 95,155"/>
                  </g>
                  <ellipse cx="90" cy="100" rx="78" ry="88" fill="none" stroke="#00e05a" strokeWidth="5"/>
                </svg>
              </span>
              human +
              <span className="icon-ai">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g className="star-inner">
                    <path d="M32 4 L34.5 28 L58 30 L34.5 32 L32 56 L29.5 32 L6 30 L29.5 28 Z" fill="url(#starGrad)" opacity="0.9"/>
                    <path d="M32 16 L33.4 27.6 L45 30 L33.4 32.4 L32 44 L30.6 32.4 L19 30 L30.6 27.6 Z" fill="url(#starGrad2)"/>
                  </g>
                  <defs>
                    <radialGradient id="starGrad" cx="50%" cy="30%" r="60%">
                      <stop offset="0%" stopColor="#00ea64"/>
                      <stop offset="100%" stopColor="#0066ff"/>
                    </radialGradient>
                    <radialGradient id="starGrad2" cx="50%" cy="30%" r="60%">
                      <stop offset="0%" stopColor="#ffffff"/>
                      <stop offset="100%" stopColor="#00ea64"/>
                    </radialGradient>
                  </defs>
                </svg>
              </span>
              AI
            </div>
          </h1>
          <p className="hero-sub">
            We help you map the skills you need, track the skills you have, and close your gaps to thrive in a GenAI world.
          </p>
          <div className="hero-cta">
            <button className="btn-green" style={{padding:'14px 36px',fontSize:'15px',borderRadius:'10px'}}
              onClick={accessToken ? handleLogin : handleSignUp}>
              {accessToken ? 'Go to Dashboard →' : 'Join The Community'}
            </button>
            <button className="btn-cta-outline" onClick={handleLogin}>
              {accessToken ? 'My Dashboard' : 'Login to Dashboard'}
            </button>
          </div>
        </section>

        {/* TRUST STRIP */}
        <div className="trust-strip">
          <div className="trust-label">Trusted by learners at</div>
          <div className="trust-logos">
            <span className="trust-logo">Google</span>
            <span className="trust-logo">Amazon</span>
            <span className="trust-logo">Microsoft</span>
            <span className="trust-logo">Meta</span>
            <span className="trust-logo">Stripe</span>
            <span className="trust-logo">Airbnb</span>
            <span className="trust-logo">LinkedIn</span>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-bar" id="stats">
          <div className="stat">
            <div className="stat-num">10<span>K+</span></div>
            <div className="stat-label">Active learners</div>
          </div>
          <div className="stat">
            <div className="stat-num">500<span>+</span></div>
            <div className="stat-label">Expert instructors</div>
          </div>
          <div className="stat">
            <div className="stat-num">100<span>+</span></div>
            <div className="stat-label">Course domains</div>
          </div>
          <div className="stat">
            <div className="stat-num">50<span>K+</span></div>
            <div className="stat-label">Certificates issued</div>
          </div>
        </div>

        {/* FEATURE CARDS */}
        <div className="features" id="features">
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <div className="feature-title">Skill Mapping</div>
            <div className="feature-desc">
              Understand exactly which skills you have today and what you need to close the gap for tomorrow's challenges.
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <div className="feature-title">Progress Tracking</div>
            <div className="feature-desc">
              Real-time dashboards that surface strengths, weaknesses, and growth trajectories across your learning journey.
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <div className="feature-title">GenAI Readiness</div>
            <div className="feature-desc">
              Assess and build GenAI fluency before the gap becomes a competitive disadvantage in your career.
            </div>
          </div>
        </div>

        <footer className="landing-footer">
          © 2026 InternLearn · Privacy · Terms · Sitemap
        </footer>
      </div>
    </>
  )
}
