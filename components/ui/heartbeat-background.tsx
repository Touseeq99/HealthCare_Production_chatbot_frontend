"use client"

export function HeartbeatBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Enhanced ECG Line Animation */}
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-primary/20 animate-pulse" />
          <svg
            className="absolute top-0 left-0 w-full h-8 -translate-y-1/2"
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
          >
            <path
              d="M0,20 L150,20 L170,5 L190,35 L210,20 L230,20 L250,10 L270,30 L290,20 L320,20 L340,15 L360,25 L380,20 L450,20 L470,8 L490,32 L510,20 L530,20 L550,12 L570,28 L590,20 L1200,20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-primary/40"
              style={{
                animation: "enhanced-heartbeat 4s ease-in-out infinite",
              }}
            />
            {/* Secondary ECG trace for depth */}
            <path
              d="M0,22 L180,22 L200,18 L220,26 L240,22 L280,22 L300,19 L320,25 L340,22 L400,22 L420,20 L440,24 L460,22 L1200,22"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
              className="text-primary/20"
              style={{
                animation: "enhanced-heartbeat 4s ease-in-out infinite 0.5s",
              }}
            />
          </svg>
        </div>
      </div>

      <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent">
        <svg
          className="absolute top-0 left-0 w-full h-6 -translate-y-1/2"
          viewBox="0 0 1200 24"
          preserveAspectRatio="none"
        >
          <path
            d="M0,12 L200,12 L215,8 L230,16 L245,12 L300,12 L315,10 L330,14 L345,12 L1200,12"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            className="text-secondary/30"
            style={{
              animation: "gentle-pulse 6s ease-in-out infinite 1s",
            }}
          />
        </svg>
      </div>

      {/* Enhanced Floating Medical Icons */}
      <div
        className="absolute top-1/3 right-1/4 w-6 h-6 text-primary/20"
        style={{
          animation: "float-bounce 4s ease-in-out infinite",
        }}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </div>

      <div
        className="absolute bottom-1/3 left-1/4 w-8 h-8 text-secondary/30"
        style={{
          animation: "float-bounce 5s ease-in-out infinite 2s",
        }}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div
        className="absolute top-1/2 right-1/6 w-7 h-7 text-primary/15"
        style={{
          animation: "gentle-rotate 8s ease-in-out infinite",
        }}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      </div>

      <div
        className="absolute top-2/3 right-1/3 w-5 h-5 text-accent/20"
        style={{
          animation: "pulse-glow 3s ease-in-out infinite 1.5s",
        }}
      >
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
        </svg>
      </div>

      <style jsx>{`
        @keyframes enhanced-heartbeat {
          0%, 100% { 
            opacity: 0.3; 
            transform: scaleX(1) scaleY(1);
            filter: blur(0px);
          }
          25% { 
            opacity: 0.6; 
            transform: scaleX(1.02) scaleY(1.1);
            filter: blur(0.5px);
          }
          50% { 
            opacity: 0.8; 
            transform: scaleX(1.05) scaleY(1.2);
            filter: blur(0px);
          }
          75% { 
            opacity: 0.6; 
            transform: scaleX(1.02) scaleY(1.1);
            filter: blur(0.5px);
          }
        }

        @keyframes float-bounce {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.2;
          }
          25% { 
            transform: translateY(-10px) rotate(2deg);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-15px) rotate(0deg);
            opacity: 0.4;
          }
          75% { 
            transform: translateY(-5px) rotate(-2deg);
            opacity: 0.3;
          }
        }

        @keyframes gentle-pulse {
          0%, 100% { 
            opacity: 0.2; 
            transform: scaleY(1);
          }
          50% { 
            opacity: 0.5; 
            transform: scaleY(1.1);
          }
        }

        @keyframes gentle-rotate {
          0%, 100% { 
            transform: rotate(0deg) scale(1);
            opacity: 0.15;
          }
          50% { 
            transform: rotate(5deg) scale(1.1);
            opacity: 0.25;
          }
        }

        @keyframes pulse-glow {
          0%, 100% { 
            opacity: 0.2;
            transform: scale(1);
            filter: brightness(1);
          }
          50% { 
            opacity: 0.4;
            transform: scale(1.1);
            filter: brightness(1.2);
          }
        }
      `}</style>
    </div>
  )
}
