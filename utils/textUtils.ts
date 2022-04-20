
const AVG_READING_WPM = 200;

export const calculateReadTimeOfText = (text: string): number => {
  const tokens = text.split(" ");
  const minutes = Math.floor(tokens.length / AVG_READING_WPM)
  return minutes;
}
