
import { AnimatedContainer } from '@/components/ui/animated-container';

const LoadingState = () => {
  return (
    <AnimatedContainer variant="content" className="space-y-6">
      <div className="text-center py-8">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading precision analytics...</p>
      </div>
    </AnimatedContainer>
  );
};

export default LoadingState;
