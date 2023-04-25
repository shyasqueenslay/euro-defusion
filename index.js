const prompt = require('prompt-sync')({sigint: true});
const fs = require('fs');
const {setupCountries} = require('./country')

const parseInput = (input) => {
    // we split our input from files to array of strings where each element is new line
    const data = input.split('\n')

    // Array of test cases
    const cases = []

    // temp var that is used to determine how many lines we should parse before expecting next "number" line
    // where "number" is the first line of each individual test case that represents number of cities in it.
    let numberOfCountries = 0;    

    // temp var to store each individual test case where countries is array of country object
    // and countriesNames is array of countries names represented in individual test case we will need it later on
    let tempCase = {countries: [], countriesNames: []}
    
    // iterating through input array 
    for (let element of data) {

        // IsNaN checks if input is number 
        // if numberOfCountries === 0 it means that line on this iteration is expected to be a start of a new test case 
        if (numberOfCountries === 0 && !Number.isNaN(Number(element))) {
            // update temp var with number that represents how many countries this test case has
            // so we know how many next lines should be parsed as "country info lines" 
            numberOfCountries = Number(element)

            // reset temp case
            tempCase = {countries: [], countriesNames: []}

            // break the loop after we parsed a line with that represents number of countries
            continue;
        }

        // The country description has the format: name xl yl xh yh
        // where name is a single word with at most 25 characters; xl, yl are the lower left city
        // coordinates of that country (most southwestward city ) and xh, yh are the upper right city
        // coordinates of that country (most northeastward city).

        // transform input line to array of strings by splitting it by space (' ')
        const countryData = element.split(' ')

        // expected format for country data string is -- | name xl yl xh yh |
        // so we know how we should validate array that we got in previous step
        
        // Country string validation
        if (typeof countryData[0] !== 'string' || countryData[0].length > 25) throw Error('Wrong input: country name')
        if (Number.isNaN(Number(countryData[1]))) throw Error('Wrong input: country coordinates')
        if (Number.isNaN(Number(countryData[2]))) throw Error('Wrong input: country coordinates')
        if (Number.isNaN(Number(countryData[3]))) throw Error('Wrong input: country coordinates')
        if (Number.isNaN(Number(countryData[4]))) throw Error('Wrong input: country coordinates')

        // add country object to temp case var
        tempCase.countries.push({name: countryData[0], lowerX: Number(countryData[1]), lowerY: Number(countryData[2]), upperX: Number(countryData[3]), upperY: Number(countryData[4]), completionDay: -1, cities: []})

        // save country name
        tempCase.countriesNames.push(countryData[0])

        // decrease number that represents how many country data string left to parse in this test case
        numberOfCountries--

        // after we parsed X ( X = numberOfCountries) lines we save a case to the list
        if (numberOfCountries === 0) cases.push(tempCase)
    }

    return cases
}

// used caseX naming cause case is reserved by JavaScript
const updateCitiesDayBalance = (caseX, map) => {
    
    // Iterate through all countries from the given case
    for (const countryIndex in caseX.countries) {

        // Iterate through all the cities in country
        for (const cityIndex in caseX.countries[countryIndex].cities) {

            // save city coordinates to variable for readability
            const cityCoordinates = caseX.countries[countryIndex].cities[cityIndex]

            // get city object from map by given coordinates
            const city = map[cityCoordinates[0]][cityCoordinates[1]]

            // calculate all possible neighbors coordinates  
            const cityNeighborsCoordinates = [
                [cityCoordinates[0] + 1, cityCoordinates[1]],
                [cityCoordinates[0] - 1, cityCoordinates[1]],
                [cityCoordinates[0], cityCoordinates[1] - 1],
                [cityCoordinates[0], cityCoordinates[1] + 1],
            ]

            // filter out invalid coordinates
            const validatedNeighborsCoordinates = cityNeighborsCoordinates.filter( ( coordinates ) => {

                // if X or Y is less than 0 -- we are out of map bounds remove from possible neighbors 
                if (coordinates[0] < 0 || coordinates[1] < 0) return false

                // if X or Y is more than 10 -- we are out of map bounds remove from possible neighbors 
                if (coordinates[0] > 10 || coordinates[1] > 10) return false

                // if it appears to be an empty space -- we are on "sea" tile also should be removed from valid neighbors list  
                if (!map[coordinates[0]][coordinates[1]]) return false

                // if it appeared to be inside out world borders and city exists by given coordinates save it to valid neighbors list
                return true
            })

            // This line creates an object that has the same type as balance and represents how many coins of each motif this city will pass to neighbors today
            // As stated in task description amount of coins which should be passed to neighbors is calculated by this formula:
            // (amount of coins of each motif / 1000 ) rounded to flor 
            // For example let's say city has 945 French coins it means that we are not passing it to neighbors
            // and if amount og French coins is 1232 -- we pass 1 coin
            // following the logic described we calculate how much coins of each motif should be passed 
            const todayTransferMap =  caseX.countriesNames.reduce( (balance, countryName) => ({...balance, [countryName]: Math.floor(city.balance[countryName] / 1000) }), {})

            // iterate through each valid neighbors coordinate
            validatedNeighborsCoordinates.forEach( coordinates => {
                
               // get neighbor city object by its coordinates   
               const neighbor = map[coordinates[0]][coordinates[1]]

               // here is an interesting part, we are go city by city and don't want today's comings from neighbors to effect today's 
               // payout calculations, so we store city income in separate object that will be added to city balance at the end of the day  
               // NOTE: You should account for previous daily income of the city. If this neighbor already received coins from other city we 
               // want to make sure we add up those incomes and not lose any data 
               const updatedNeighborDayBalance = caseX.countriesNames.reduce( (dayBalance, countryName) => ({...dayBalance, [countryName]: dayBalance[countryName] + todayTransferMap[countryName] }), neighbor.dayBalance)

               // save updated day income balance
               map[coordinates[0]][coordinates[1]].dayBalance = updatedNeighborDayBalance

            })

            // calculate amount of coins for each motif that should be subtracted from city balance
            // to get it we need to take amount of coins that this city is passing to 1 neighbor and multiply it by number of valid neighbors
            const updatedCityBalance = caseX.countriesNames.reduce( (dayBalance, countryName) => ({...dayBalance, [countryName]: city.balance[countryName] - validatedNeighborsCoordinates.length * todayTransferMap[countryName]  }), city.balance)

            // save updated city balance
            map[cityCoordinates[0]][cityCoordinates[1]].balance = updatedCityBalance
        }
    };
}

const updateCitiesBalance = (caseX, map) => {
        // Iterate through all countries from the given case
        for (const countryIndex in caseX.countries) {

            // Iterate through all the cities in country
            for (const cityIndex in caseX.countries[countryIndex].cities) {
    
                // save city coordinates to variable for readability
                const cityCoordinates = caseX.countries[countryIndex].cities[cityIndex]
    
                // get city object from map by given coordinates
                const city = map[cityCoordinates[0]][cityCoordinates[1]]
                
                // updatedCityBalance is the same type as balance
                // what we do here is iterate through each country of test case and save updated balance of each motif
                // For example let's say we are on France right now, to calculate updated balance we do city.balance['France'] + city.dayBalance['France']
                // where city.balance['France'] is amount of French coins at the start of the day 
                // and city.dayBalance['France'] is amount of French coins that this city acquire through the day
                const updatedCityBalance =  caseX.countriesNames.reduce( (updatedBalance, countryName) => ({...updatedBalance, [countryName]: city.balance[countryName] + city.dayBalance[countryName]}), {})
                
                // save updated balance
                map[cityCoordinates[0]][cityCoordinates[1]].balance = updatedCityBalance

                // reset dayBalance map 
                map[cityCoordinates[0]][cityCoordinates[1]].dayBalance = caseX.countriesNames.reduce( (dayBalance, countryName) => ({...dayBalance, [countryName]: 0}),  {})
            }
        };
}
 
// used caseX naming cause case is reserved by JavaScript
const updateCountriesAndCitiesCompletion = (caseX, day, map) => {
    // indicates case completion state 
    // Defaulted to true because if even 1 city is not complete it means test case is also not complete
    // so if we found city that is incomplete we just mark it false. 
    let isCaseComplete = true

    // Iterates through all the countries in test case
    for (const countryIndex in caseX.countries) {

        // Same as case completion but indicates country completion
        // follows the same logic: even if 1 city of country is not complete it means that country is also incomplete.
        let isCountryComplete = true

        // Skip iteration step if country was already complete.
        if (caseX.countries[countryIndex].completionDay !== -1) continue

        // Iterate through all the cities in country
        for (const cityIndex in caseX.countries[countryIndex].cities) {

            // save city coordinates to variable for readability
            const cityCoordinates = caseX.countries[countryIndex].cities[cityIndex]
            
            // Shares the same logic as isCaseComplete and isCountryComplete
            let isCityComplete = true

            // skip iteration step if city was already complete. 
            if (map[cityCoordinates[0]][cityCoordinates[1]].isComplete) continue;

            // iterate through all motifs of a given city
            // refer to City object description if u don't get it.
            for (const [_,value] of Object.entries(map[cityCoordinates[0]][cityCoordinates[1]].balance)) {
                // So we assume motif complete if amount of its coins is more then 1000 
                if (value < 1000) {

                    // Shares same logic with previous boolean values: even if 1 motif is incomplete it means that city is also incomplete
                    isCityComplete = false

                    // break the loop because we already know that this city is incomplete
                    break
                };
            }

            // if city is complete we update its completion state in case object
            if (isCityComplete) map[cityCoordinates[0]][cityCoordinates[1]].isComplete = true

            else {
                // if not mark country as incomplete cause even if 1 city of that country is incomplete it also is incomplete
                isCountryComplete = false
                // break the loop because we already know that this country is incomplete 
                break;
            }
        }

        // if country is complete we set a completion day that indicates completion ( default value is -1, so once it's changed we will always know whether country is complete or not ) 
        if (isCountryComplete) caseX.countries[countryIndex].completionDay = day

        // if not set case as incomplete shares the same logic as in loops inside
        // but we don't break the big loop here cause we care about countries completion day, 
        // that is why its important to check all the countries each time  
        else isCaseComplete = false
    };

    return isCaseComplete
}

const main = () => {

    // Create 10x10 matrix for our new little world
    const map = Array(10).fill(undefined).map( x => Array(10).fill(undefined))

    // read test cases input from file
    const input = fs.readFileSync('./input.txt',
            {encoding:'utf8', flag:'r'});

    // number of days passed during simulation we need to save it as we need to sort countries by completion date after all the countries will be completed
    let daysPassed = 0        
     
    // parse input to test cases array where each test case is object containing countries property which is array where each element matches this interface
    // Country {
    //    name: string
    //    lowerX: number
    //    lowerY: number
    //    upperX: number 
    //    upperY: number
    //    completionDay: number -- represents day when country became complete
    //    cities: Array[y: number, x: number] array of cities coordinates that belongs to the city ( are stored in (y, x) manner ) 
    //}
    //
    // and countriesNames which is array that contains all countries names represented in that test case
    const cases = parseInput(input)

    // empty array for future answers
    const answers = []

    // iterate through cases 
    for (let case1 of cases ) {
        
        // iterate through test case to fill in cities in our little new world
        for(let country of case1.countries) {

            // we take lower left and upper right corners of country border
            // assuming it has rectangular shape and create cities inside of that rectangle
            // inside our world map matrix
            for(let i = country.lowerX - 1; i < country.upperX; i++) {
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
                    const cityBalance = case1.countriesNames.reduce( (balance, countryName) => {
                        if (countryName === country.name) return {...balance, [countryName]: 1000000}
                        else return {...balance, [countryName]: 0}
                    }, {})

                    const initDayBalance = case1.countriesNames.reduce( (balance, countryName) => ({...balance, [countryName]: 0}), {})

                    // save city object to appropriate place in our world map matrix where j is Y coordinate and i is X
                    // 
                    // city object interface 
                    // City {
                    //     country: string -- country name
                    //     isComplete: boolean -- if true means this city has at least 1000 coins of each country represented in test case
                    //     balance: Object -- check balance description in upper comments
                    //     dayBalance: Object -- has the same type as balance, exists for saving transaction. Why it is needed will be explained later on. 
                    // }
                    map[j][i] = {country: country.name, isComplete: false, balance: cityBalance, dayBalance: initDayBalance}

                    // add city coordinates to country
                    country.cities.push([j, i])
                }
            }
        }

        // marker of test case completion
        let isCaseComplete = false

        while (!isCaseComplete) {        
            updateCitiesDayBalance(case1, map)

            updateCitiesBalance(case1, map) 

            // Iterate through each country and each city within it and check if all motifs are complete. 
            // Update completion state accordingly both for cities and countries.
            // It returns boolean: if true -- means all the cities from test case are completed and indicates that simulation is finished
            // if false -- continue iterations.  
            isCaseComplete = updateCountriesAndCitiesCompletion(case1, daysPassed, map)

            // increase days counter
            daysPassed++
        }

        // save result to the answers array
        answers.push(case1)

        // reset days counter
        daysPassed = 0
    }

    console.log(answers[0], answers[1], answers[2])
}

main()