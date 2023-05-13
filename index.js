
const parseInput = require('./parseInput.js');
const updateCitiesBalance = require('./updateCitiesBalance.js');
const updateCitiesDayBalance = require('./updateCitiesDayBalance.js');
const updateCountriesAndCitiesCompletion = require('./updateCountriesAndCitiesCompletion');
const {MAP_WIDTH, MAP_HEIGHT, BASE_CITY_BALANCE} = require('./consts.js');

const main = () => {
  // Create 10x10 matrix for our new little world
  const map = Array(MAP_WIDTH).fill(undefined).map( (x) => Array(MAP_HEIGHT).fill(undefined));

  // number of days passed during simulation we need to save it as we need to sort countries by completion date after all the countries will be completed
  let daysPassed = 1;

  // parse input to test cases array where each test case is object containing countries property which is array where each element matches this interface
  // Country {
  //    name: string
  //    lowerX: number
  //    lowerY: number
  //    upperX: number
  //    upperY: number
  //    completionDay: number -- represents day when country became complete
  //    cities: Array[y: number, x: number] array of cities coordinates that belongs to the city ( are stored in (y, x) manner )
  // }
  //
  // and countriesNames which is array that contains all countries names represented in that test case
  const cases = parseInput();

  // empty array for future answers
  const answers = [];

  // iterate through cases
  for (const caseX of cases ) {
    // iterate through test case to fill in cities in our little new world
    for (const country of caseX.countries) {
      // we take lower left and upper right corners of country border
      // assuming it has rectangular shape and create cities inside of that rectangle
      // inside our world map matrix
      for (let i = country.lowerX - 1; i < country.upperX; i++) {
        for (let j = country.lowerY - 1; j < country.upperY; j++) {
          // This part might be not clear for those who are not in touch with JS so I will explain in human language what is going on here.
          // So balance of each city is represented by map object where keys are countries names and values are amount of coins that were produced in that country
          // Example:
          //
          // balance : {
          //     'France': 1000,
          //     'Germany': 10000,
          //     'Italy': 1232,
          //     'Spain': 1244,
          //     ...
          // }
          //
          // As we configure our start state for cities balance we want to have other countries coins at 0
          // and 1 000 000 coins of country which this city is a part of
          //
          // so we iterate through all countries and if country name from the list matches country which current city is part of we set its balance to 1 000 000
          // otherwise we set it to 0
          const cityBalance = caseX.countriesNames.reduce( (balance, countryName) => {
            if (countryName === country.name) return {...balance, [countryName]: BASE_CITY_BALANCE};
            else return {...balance, [countryName]: 0};
          }, {});

          const initDayBalance = caseX.countriesNames.reduce( (balance, countryName) =>
           ({
            ...balance,
            [countryName]: 0
           }),
           {});

          // save city object to appropriate place in our world map matrix where j is Y coordinate and i is X
          //
          // city object interface
          // City {
          //     country: string -- country name
          //     isComplete: boolean -- if true means this city has at least 1000 coins of each country represented in test case
          //     balance: Object -- check balance description in upper comments
          //     dayBalance: Object -- has the same type as balance, exists for saving transaction. Why it is needed will be explained later on.
          // }
          map[j][i] = {country: country.name, isComplete: false, balance: cityBalance, dayBalance: initDayBalance};

          // add city coordinates to country
          country.cities.push([j, i]);
        }
      }
    }

    // marker of test case completion
    let isCaseComplete = false;

    while (!isCaseComplete) {
      updateCitiesDayBalance(caseX, map);

      updateCitiesBalance(caseX, map);

      // Iterate through each country and each city within it and check if all motifs are complete.
      // Update completion state accordingly both for cities and countries.
      // It returns boolean: if true -- means all the cities from test case are completed and indicates that simulation is finished
      // if false -- continue iterations.
      isCaseComplete = updateCountriesAndCitiesCompletion(caseX, daysPassed, map);

      // increase days counter
      daysPassed++;
    }

    // save result to the answers array
    answers.push(caseX);

    // reset days counter
    daysPassed = 1;
  }

  const sortedAnswer = answers.map( (caseX) => {
    return caseX.countries.sort( (a, b) => b.completionDay - a.completionDay);
  });

  console.log(sortedAnswer);
};

main();
