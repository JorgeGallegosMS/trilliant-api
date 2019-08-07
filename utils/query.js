module.exports.parseStartLimit = range => {
  const rangeStripped = String(range).replace(/[\[\]]/g, '');
  if (!rangeStripped) {
    return [0, API_LIST_REQUEST_DEFAULT_LIMIT];
  }

  const [start, end] = rangeStripped.split(',');

  const resultStart = parseInt(start, 10) || 0;

  return [resultStart, parseInt(end, 10) ? parseInt(end, 10) - resultStart + 1 : API_LIST_REQUEST_DEFAULT_LIMIT];
};