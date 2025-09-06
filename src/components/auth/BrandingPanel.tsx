
import { useState, useEffect } from 'react';
import { useBrandingImages } from '@/hooks/useBrandingImages';
import { useBrandLogos } from '@/hooks/useBrandLogos';
import StaticDigitalizationTeam from './StaticDigitalizationTeam';

const BrandingPanel = () => {
  const {
    images,
    loading: imagesLoading,
    insertBrandingImages
  } = useBrandingImages();
  const {
    logos,
    loading: logosLoading,
    insertDefaultLogo
  } = useBrandLogos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showTeamSection, setShowTeamSection] = useState(true);

  // Use the filtered background images or fallback to hardcoded ones
  const backgroundImages = images.filter(img => img.image_type === 'background');
  const slideImages = backgroundImages.length > 0 ? backgroundImages.map(img => img.image_url) : ['/lovable-uploads/cceef45f-bf3d-4bc5-9651-70397108a146.png', '/lovable-uploads/bbcaed06-9a97-41a7-b55f-7e09c6b998df.png', '/lovable-uploads/3ebb3991-5797-49d3-bbbe-d35d0beb24b3.png', '/lovable-uploads/0268d849-61ca-43f1-a6ed-69265d9c5ae9.png'];
  
  // Use logo from brand_logos table or fallback
  const logoUrl = logos.length > 0 ? logos[0].image_url : '/lovable-uploads/cb6eca2d-a768-478b-af7f-1c3fba8f1b6c.png';
  
  const loading = imagesLoading || logosLoading;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % slideImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slideImages.length]);

  // Auto-insert images if none exist in database
  useEffect(() => {
    if (!imagesLoading && images.length === 0) {
      console.log('No branding images found, inserting default images...');
      insertBrandingImages();
    }
  }, [imagesLoading, images.length, insertBrandingImages]);

  // Auto-insert default logo if none exists
  useEffect(() => {
    if (!logosLoading && logos.length === 0) {
      console.log('No brand logos found, inserting default logo...');
      insertDefaultLogo();
    }
  }, [logosLoading, logos.length, insertDefaultLogo]);

  // Handle scroll to show team section
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.scrollTop > 300) {
        setShowTeamSection(true);
      } else {
        setShowTeamSection(false);
      }
    };

    const scrollContainer = document.querySelector('.branding-scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  if (loading) {
    return (
      <div className="hidden lg:flex lg:flex-1 relative p-12 flex-col justify-center items-center text-white overflow-hidden bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        <p className="mt-4 text-white">Loading branding images...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <div className="branding-scroll-container h-full overflow-y-auto overflow-x-hidden">
        {/* Main Branding Section */}
        <div className="min-h-screen relative p-8 xl:p-12 flex flex-col justify-center items-start text-white">
          {/* Background Images */}
          {slideImages.map((image, index) => (
            <div 
              key={index} 
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`} 
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }} 
            />
          ))}
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Content */}
          <div className="relative z-10 max-w-lg xl:max-w-2xl">
            <div className="mb-8">
              <div className="w-16 h-16 xl:w-20 xl:h-20 bg-white rounded-2xl flex items-center justify-center mb-6 p-2 shadow-lg">
                <img 
                  src={logoUrl} 
                  alt="QMAZ Holdings Logo" 
                  className="w-full h-full object-contain" 
                  onError={(e) => {
                    console.log('Logo failed to load:', e.currentTarget.src);
                  }} 
                />
              </div>
              <h1 className="text-4xl xl:text-6xl font-bold mb-2 text-red-500 drop-shadow-lg">QMAZ HOLDINGS INC.</h1>
              <div className="w-12 h-1 bg-white/80 mb-8"></div>
              <h2 className="text-xl xl:text-3xl font-semibold mb-3 text-white drop-shadow-md">HELP DESK SYSTEM</h2>
              <p className="text-white/90 text-base xl:text-xl drop-shadow-sm">"Your gateway to technical support"</p>
            </div>
          </div>
          
          {/* Decorative dots - Dynamic based on slideImages length */}
          <div className="absolute bottom-8 left-8 xl:left-12 flex space-x-2 z-10">
            {slideImages.map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/30'
                }`} 
              />
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="animate-bounce">
              <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Digitalization Team Section */}
        <div className={`relative min-h-screen flex flex-col justify-center items-center p-6 xl:p-12 transition-all duration-700 ${
          showTeamSection ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Background with different styling for team section */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/60 to-indigo-900/80"></div>
          <div className="absolute inset-0 bg-black/30"></div>
          
          {/* Team Content */}
          <div className="relative z-10 w-full max-w-6xl">
            <StaticDigitalizationTeam />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingPanel;
