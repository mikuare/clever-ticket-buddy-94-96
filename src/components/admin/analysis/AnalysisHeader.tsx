
import { BarChart3 } from 'lucide-react';
import { AnimatedText } from '@/components/ui/animated-text';
import { useIsMobile } from '@/hooks/use-mobile';

const AnalysisHeader = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-3'}`}>
      <BarChart3 className={isMobile ? 'w-6 h-6 text-primary' : 'w-8 h-8 text-primary'} />
      <div className={isMobile ? 'space-y-1' : ''}>
        <AnimatedText
          as="h1"
          variant="title"
          className={isMobile ? 'text-xl font-bold' : 'text-3xl font-bold'}
        >
          Admin Analysis Dashboard
        </AnimatedText>
        <AnimatedText
          variant="subtitle"
          className={isMobile ? 'text-sm text-muted-foreground' : 'text-muted-foreground'}
        >
          Real-time precision metrics powered by ticket progression data
        </AnimatedText>
      </div>
    </div>
  );
};

export default AnalysisHeader;
