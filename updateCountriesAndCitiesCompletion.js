// used caseX naming cause case is reserved by JavaScript
const updateCountriesAndCitiesCompletion = (caseX, day, map) => {
  // indicates case completion state
  // Defaulted to true because if even 1 city is not complete it means test case is also not complete
  // so if we found city that is incomplete we just mark it false.
  let isCaseComplete = true;

  // Iterates through all the countries in test case
  for (const countryIndex in caseX.countries) {
    // Skip iteration step if country was already complete.
    if (caseX.countries[countryIndex].completionDay !== -1) continue;

    // Same as case completion but indicates country completion
    // follows the same logic: even if 1 city of country is not complete it means that country is also incomplete.
    let isCountryComplete = true;

    // Iterate through all the cities in country
    for (const cityIndex in caseX.countries[countryIndex].cities) {
      // save city coordinates to variable for readability
      const cityCoordinates = caseX.countries[countryIndex].cities[cityIndex];

      // Shares the same logic as isCaseComplete and isCountryComplete
      let isCityComplete = true;

      // skip iteration step if city was already complete.
      if (map[cityCoordinates[0]][cityCoordinates[1]].isComplete) continue;

      // iterate through all motifs of a given city
      // refer to City object description if u don't get it.
      for (const [_, value] of Object.entries(map[cityCoordinates[0]][cityCoordinates[1]].balance)) {
        // So we assume motif complete if amount of its coins is more then 0
        if (value === 0) {
          // Shares same logic with previous boolean values: even if 1 motif is incomplete it means that city is also incomplete
          isCityComplete = false;

          // break the loop because we already know that this city is incomplete
          break;
        };
      }

      // if city is complete we update its completion state in case object
      if (isCityComplete) map[cityCoordinates[0]][cityCoordinates[1]].isComplete = true;

      else {
        // if not mark country as incomplete cause even if 1 city of that country is incomplete it also is incomplete
        isCountryComplete = false;
        // break the loop because we already know that this country is incomplete
        break;
      }
    }

    // if country is complete we set a completion day that indicates completion ( default value is -1, so once it's changed we will always know whether country is complete or not )
    if (isCountryComplete) caseX.countries[countryIndex].completionDay = day;

    // if not set case as incomplete shares the same logic as in loops inside
    // but we don't break the big loop here cause we care about countries completion day,
    // that is why its important to check all the countries each time
    else isCaseComplete = false;
  };

  return isCaseComplete;
};

module.exports = updateCountriesAndCitiesCompletion;
