function parseTimestamp(input) {
  const result = new Date(0);
  if (input) {
    const matches = input.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
    if (!matches || matches.length != 7) throw new Error('unexpected timestamp format sent from EasyPay');

    result.setFullYear(parseInt(matches[1]));
    result.setMonth(parseInt(matches[2]) - 1);
    result.setDate(parseInt(matches[3]));
    result.setHours(parseInt(matches[4]));
    result.setMinutes(parseInt(matches[5]));
    result.setSeconds(parseInt(matches[6]));
  }

  return result;
}

module.exports = { parseTimestamp };
