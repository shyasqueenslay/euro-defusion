const updateCitiesBalance = (caseX, map) => {
  // Iterate through all countries from the given case
  for (const countryIndex in caseX.countries) {
    // Iterate through all the cities in country
    for (const cityIndex in caseX.countries[countryIndex].cities) {
      // save city coordinates to variable for readability
      const cityCoordinates = caseX.countries[countryIndex].cities[cityIndex];

      // get city object from map by given coordinates
      const city = map[cityCoordinates[0]][cityCoordinates[1]];

      // updatedCityBalance is the same type as balance
      // what we do here is iterate through each country of test case and save updated balance of each motif
      // For example let's say we are on France right now, to calculate updated balance we do city.balance['France'] + city.dayBalance['France']
      // where city.balance['France'] is amount of French coins at the start of the day
      // and city.dayBalance['France'] is amount of French coins that this city acquire through the day
      const updatedCityBalance = caseX.countriesNames.reduce( (updatedBalance, countryName) => 
      ({...updatedBalance,
        [countryName]: city.balance[countryName] + city.dayBalance[countryName]
      }),
      {});

      // save updated balance
      map[cityCoordinates[0]][cityCoordinates[1]].balance = updatedCityBalance;

      // reset dayBalance map
      map[cityCoordinates[0]][cityCoordinates[1]].dayBalance = caseX.countriesNames.reduce( (dayBalance, countryName) => 
      ({
        ...dayBalance,
        [countryName]: 0
      }),
     {});
    }
  };
};

module.exports = updateCitiesBalance;
