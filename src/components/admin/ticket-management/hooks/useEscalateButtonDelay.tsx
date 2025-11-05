
import { useState, useEffect } from 'react';

export const useEscalateButtonDelay = (canEscalate: boolean) => {
  const [showEscalateButton, setShowEscalateButton] = useState(false);

  useEffect(() => {
    if (canEscalate) {
      const timer = setTimeout(() => {
        setShowEscalateButton(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [canEscalate]);

  return { showEscalateButton };
};
