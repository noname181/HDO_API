export const transformDate = (dateInput = ''): number => {
  const date = new Date(dateInput);

  return !isNaN(date.getTime()) ? date.getTime() : 0;
};
