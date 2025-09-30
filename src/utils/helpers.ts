export const formatNumber = (num: number): string => {
  return num.toLocaleString('pl-PL');
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('pl-PL', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const getMaterialGroupColor = (materialGroup: string): string => {
  const groupPrefix = materialGroup.substring(0, 4);
  switch (groupPrefix) {
    case '1002': return 'bg-blue-100 text-blue-700';
    case '1004': return 'bg-green-100 text-green-700';
    default: return 'bg-purple-100 text-purple-700';
  }
};