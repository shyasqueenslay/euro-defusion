const {MAP_WIDTH, MAP_HEIGHT, REPRESENTATIVE_DIVIDER} = require('./consts.js');

// used caseX naming cause case is reserved by JavaScript
const updateCitiesDayBalance = (caseX, map) => {
  // Iterate through all countries from the given case
  for (const countryIndex in caseX.countries) {
    // Iterate through all the cities in country
    for (const cityIndex in caseX.countries[countryIndex].cities) {
      // save city coordinates to variable for readability
      const cityCoordinates = caseX.countries[countryIndex].cities[cityIndex];

      // get city object from map by given coordinates
      const city = map[cityCoordinates[0]][cityCoordinates[1]];

      // calculate all possible neighbors coordinates
      const cityNeighborsCoordinates = [
        [cityCoordinates[0] + 1, cityCoordinates[1]],
        [cityCoordinates[0] - 1, cityCoordinates[1]],
        [cityCoordinates[0], cityCoordinates[1] - 1],
        [cityCoordinates[0], cityCoordinates[1] + 1],
      ];

      // filter out invalid coordinates
      const validatedNeighborsCoordinates = cityNeighborsCoordinates.filter( ( coordinates ) => {
        // if X or Y is less than 0 -- we are out of map bounds remove from possible neighbors
        if (coordinates[0] < 0 || coordinates[1] < 0) return false;

        // if X or Y is more than 10 -- we are out of map bounds remove from possible neighbors
        if (coordinates[0] > MAP_WIDTH || coordinates[1] > MAP_HEIGHT) return false;

        // if it appears to be an empty space -- we are on "sea" tile also should be removed from valid neighbors list
        if (!map[coordinates[0]][coordinates[1]]) return false;

        // if it appeared to be inside out world borders and city exists by given coordinates save it to valid neighbors list
        return true;
      });

      // This line creates an object that has the same type as balance and represents how many coins of each motif this city will pass to neighbors today
      // As stated in task description amount of coins which should be passed to neighbors is calculated by this formula:
      // (amount of coins of each motif / 1000 ) rounded to flor
      // For example let's say city has 945 French coins it means that we are not passing it to neighbors
      // and if amount og French coins is 1232 -- we pass 1 coin
      // following the logic described we calculate how much coins of each motif should be passed
      const todayTransferMap = caseX.countriesNames.reduce( (balance, countryName) => 
      ({
        ...balance,
        [countryName]: Math.floor(city.balance[countryName] / REPRESENTATIVE_DIVIDER)
      }),
      {});

      // iterate through each valid neighbors coordinate
      validatedNeighborsCoordinates.forEach( (coordinates) => {
        // get neighbor city object by its coordinates
        const neighbor = map[coordinates[0]][coordinates[1]];

        // here is an interesting part, we are go city by city and don't want today's comings from neighbors to effect today's
        // payout calculations, so we store city income in separate object that will be added to city balance at the end of the day
        // NOTE: You should account for previous daily income of the city. If this neighbor already received coins from other city we
        // want to make sure we add up those incomes and not lose any data
        const updatedNeighborDayBalance = caseX.countriesNames.reduce( (dayBalance, countryName) => 
        ({
            ...dayBalance,
            [countryName]: dayBalance[countryName] + todayTransferMap[countryName]
        }), 
        neighbor.dayBalance);

        // save updated day income balance
        map[coordinates[0]][coordinates[1]].dayBalance = updatedNeighborDayBalance;
      });

      // calculate amount of coins for each motif that should be subtracted from city balance
      // to get it we need to take amount of coins that this city is passing to 1 neighbor and multiply it by number of valid neighbors
      const updatedCityBalance = caseX.countriesNames.reduce( (dayBalance, countryName) => 
      ({
        ...dayBalance, 
        [countryName]: city.balance[countryName] - validatedNeighborsCoordinates.length * todayTransferMap[countryName]
      }),
      city.balance);

      // save updated city balance
      map[cityCoordinates[0]][cityCoordinates[1]].balance = updatedCityBalance;
    }
  };
};

module.exports = updateCitiesDayBalance;
