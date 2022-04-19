

export const calculateReadTimeOfText = (text: string): number => {
  const tokens = text.split(" ");
  const minutes = Math.floor(tokens.length / 200)
  return minutes;
}
