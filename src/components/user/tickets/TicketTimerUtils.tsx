
export const calculateTimeRemaining = (adminResolvedAt: string, autoCloseHours: number = 24) => {
  const resolvedTime = new Date(adminResolvedAt);
  const now = new Date();
  const autoCloseTime = new Date(resolvedTime.getTime() + autoCloseHours * 60 * 60 * 1000);
  const timeRemaining = autoCloseTime.getTime() - now.getTime();
  
  if (timeRemaining <= 0) return 0;
  return Math.ceil(timeRemaining / 1000);
};

export const formatTimeRemaining = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
