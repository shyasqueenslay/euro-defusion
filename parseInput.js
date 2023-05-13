const fs = require('fs');
const {isNewTestCase} = require('./helpers');

const parseInput = () => {
  // read test cases input from file
  const input = fs.readFileSync('./input.txt',
      {encoding: 'utf8', flag: 'r'});
    // we split our input from files to array of strings where each element is new line
  const data = input.split('\n');

  // Array of test cases
  const cases = [];

  // temp var that is used to determine how many lines we should parse before expecting next "number" line
  // where "number" is the first line of each individual test case that represents number of cities in it.
  let numberOfCountries = 0;

  // temp var to store each individual test case where countries is array of country object
  // and countriesNames is array of countries names represented in individual test case we will need it later on
  let tempCase = {countries: [], countriesNames: []};

  // iterating through input array
  for (const element of data) {
    // IsNaN checks if input is number
    // if numberOfCountries === 0 it means that line on this iteration is expected to be a start of a new test case
    if (isNewTestCase(numberOfCountries, element)) {
      // update temp var with number that represents how many countries this test case has
      // so we know how many next lines should be parsed as "country info lines"
      numberOfCountries = Number(element);

      // reset temp case
      tempCase = {countries: [], countriesNames: []};

      // break the loop after we parsed a line with that represents number of countries
      continue;
    }

    // The country description has the format: name xl yl xh yh
    // where name is a single word with at most 25 characters; xl, yl are the lower left city
    // coordinates of that country (most southwestward city ) and xh, yh are the upper right city
    // coordinates of that country (most northeastward city).

    // transform input line to array of strings by splitting it by space (' ')
    const countryData = element.split(' ');

    // expected format for country data string is -- | name xl yl xh yh |
    // so we know how we should validate array that we got in previous step

    // Country string validation
    if (typeof countryData[0] !== 'string' || countryData[0].length > 25) throw Error('Wrong input: country name');
    if (Number.isNaN(Number(countryData[1]))) throw Error('Wrong input: country coordinates');
    if (Number.isNaN(Number(countryData[2]))) throw Error('Wrong input: country coordinates');
    if (Number.isNaN(Number(countryData[3]))) throw Error('Wrong input: country coordinates');
    if (Number.isNaN(Number(countryData[4]))) throw Error('Wrong input: country coordinates');

    // add country object to temp case var
    tempCase.countries.push({
        name: countryData[0],
        lowerX: Number(countryData[1]),
        lowerY: Number(countryData[2]),
        upperX: Number(countryData[3]),
        upperY: Number(countryData[4]),
        completionDay: -1, 
        cities: []
    });

    // save country name
    tempCase.countriesNames.push(countryData[0]);

    // decrease number that represents how many country data string left to parse in this test case
    numberOfCountries--;

    // after we parsed X ( X = numberOfCountries) lines we save a case to the list
    if (numberOfCountries === 0) cases.push(tempCase);
  }

  return cases;
};

module.exports = parseInput;
