import { useEffect, useState } from 'react';
import { useBrandLogos } from '@/hooks/useBrandLogos';

interface MobileWelcomeScreenProps {
  onComplete: () => void;
}

const MobileWelcomeScreen = ({ onComplete }: MobileWelcomeScreenProps) => {
  const { logos, loading: logosLoading, insertDefaultLogo } = useBrandLogos();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  
  // Use logo from brand_logos table or fallback
  const logoUrl = logos.length > 0 ? logos[0].image_url : '/lovable-uploads/cb6eca2d-a768-478b-af7f-1c3fba8f1b6c.png';
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000); // Changed to 2 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Generate particles animation
  useEffect(() => {
    const generateParticles = () => {
      const particleArray = [];
      for (let i = 0; i < 30; i++) {
        particleArray.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          delay: Math.random() * 3
        });
      }
      setParticles(particleArray);
    };

    generateParticles();
  }, []);

  // Auto-insert default logo if none exists
  useEffect(() => {
    if (!logosLoading && logos.length === 0) {
      console.log('No brand logos found, inserting default logo...');
      insertDefaultLogo();
    }
  }, [logosLoading, logos.length, insertDefaultLogo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Particles Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      {/* Floating particles with movement */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.slice(0, 15).map((particle) => (
          <div
            key={`floating-${particle.id}`}
            className="absolute bg-accent/20 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size * 2}px`,
              height: `${particle.size * 2}px`,
              animation: `float ${3 + particle.delay}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      <div className="text-center space-y-6 animate-fade-in relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-3 shadow-lg animate-scale-in">
            <img 
              src={logoUrl} 
              alt="QMAZ Holdings Logo" 
              className="w-full h-full object-contain" 
              onError={(e) => {
                console.log('Logo failed to load:', e.currentTarget.src);
              }} 
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Welcome to
          </h1>
          <h2 className="text-2xl font-semibold text-primary animate-fade-in" style={{ animationDelay: '0.4s' }}>
            QMAZ HELP DESK INC.
          </h2>
          <h3 className="text-xl font-medium text-primary animate-fade-in" style={{ animationDelay: '0.6s' }}>
            SYSTEM
          </h3>
        </div>
        
        <p className="text-lg text-muted-foreground font-medium px-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          Your gateway to technical support
        </p>
        
        <div className="flex justify-center pt-8 animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-primary/30"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileWelcomeScreen;