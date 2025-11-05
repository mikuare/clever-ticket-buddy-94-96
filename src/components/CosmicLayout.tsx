
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface CosmicLayoutProps {
  children: React.ReactNode;
}

const CosmicLayout = ({ children }: CosmicLayoutProps) => {
  const { theme } = useTheme();
  const [stars, setStars] = useState<Array<{ id: number; top: string; left: string; size: string; delay: string }>>([]);

  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const starArray = [];
      for (let i = 0; i < 100; i++) {
        starArray.push({
          id: i,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          size: Math.random() > 0.8 ? 'star-large' : Math.random() > 0.6 ? 'star-medium' : 'star-small',
          delay: `${Math.random() * 4}s`
        });
      }
      // Add some bright stars
      for (let i = 100; i < 110; i++) {
        starArray.push({
          id: i,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          size: 'star-bright',
          delay: `${Math.random() * 3}s`
        });
      }
      setStars(starArray);
    };

    generateStars();
  }, []);

  const getThemeGradient = () => {
    switch (theme) {
      case 'yellow':
        return 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0f3460 100%)';
      case 'blue':
        return 'radial-gradient(ellipse at center, #0f172a 0%, #1e293b 35%, #334155 100%)';
      case 'green':
        return 'radial-gradient(ellipse at center, #0a2e0a 0%, #1e4a1e 35%, #2d5a2d 100%)';
      case 'dimdark':
        return 'radial-gradient(ellipse at center, #000000 0%, #1a1a1a 35%, #2d2d2d 100%)';
      case 'maroon':
        return 'radial-gradient(ellipse at center, #4a0e0e 0%, #7a1414 35%, #a02020 100%)';
      case 'camo':
        return 'radial-gradient(ellipse at center, #2a2a2a 0%, #404040 35%, #606060 100%)';
      default:
        return 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0f3460 100%)';
    }
  };

  return (
    <div 
      className="cosmic-container theme-transition"
      style={{ background: getThemeGradient() }}
    >
      {/* Animated nebula clouds */}
      <div className="nebula nebula-1"></div>
      <div className="nebula nebula-2"></div>
      <div className="nebula nebula-3"></div>

      {/* Animated stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star ${star.size}`}
          style={{
            top: star.top,
            left: star.left,
            animationDelay: star.delay
          }}
        />
      ))}

      {/* Shooting stars */}
      <div className="shooting-star" style={{ top: '20%', animationDelay: '2s' }}></div>
      <div className="shooting-star" style={{ top: '40%', animationDelay: '8s' }}></div>
      <div className="shooting-star" style={{ top: '60%', animationDelay: '5s' }}></div>
      <div className="shooting-star" style={{ top: '80%', animationDelay: '12s' }}></div>

      {/* Content container */}
      <div className="content relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CosmicLayout;
