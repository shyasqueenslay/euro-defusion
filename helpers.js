
const isNewTestCase = (numberOfCountries, element) => {
  return numberOfCountries === 0 && !Number.isNaN(Number(element));
};

module.exports = {
  isNewTestCase,
};
