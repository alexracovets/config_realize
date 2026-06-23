const withListPunctuation = (item: string, isLast: boolean) => {
  const trimmed = item.replace(/[;.:]\s*$/, '').trimEnd();
  return `${trimmed}${isLast ? '.' : ';'}`;
};

export { withListPunctuation };
