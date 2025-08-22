
import { BarChart3 } from 'lucide-react';
import { AnimatedText } from '@/components/ui/animated-text';

const AnalysisHeader = () => {
  return (
    <div className="flex items-center gap-3">
      <BarChart3 className="w-8 h-8 text-primary" />
      <div>
        <AnimatedText as="h1" variant="title" className="text-3xl font-bold">
          Admin Analysis Dashboard
        </AnimatedText>
        <AnimatedText variant="subtitle" className="text-muted-foreground">
          Real-time precision metrics powered by ticket progression data
        </AnimatedText>
      </div>
    </div>
  );
};

export default AnalysisHeader;
