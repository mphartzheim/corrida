// filepath: /home/joypunk/Applications/corrida/src/services/constructorUtils.js
import axios from 'axios';

/**
 * Utility functions for working with F1 constructors data
 */

/**
 * Fetches all F1 constructors from the Ergast API
 * @returns {Promise<Array>} Array of all F1 constructors
 */
export async function fetchAllConstructors() {
    const baseUrl = 'https://api.jolpi.ca/ergast/f1/constructors.json';
    const limit = 30; // API returns 30 items per page
    let offset = 0;
    let allConstructors = [];
    let hasMore = true;

    console.log('Fetching all F1 constructors...');

    while (hasMore) {
        const url = `${baseUrl}?limit=${limit}&offset=${offset}`;
        console.log(`Fetching from offset ${offset}...`);

        try {
            const response = await axios.get(url);
            const data = response.data;

            const constructors = data.MRData.ConstructorTable.Constructors;
            allConstructors = [...allConstructors, ...constructors];

            const total = parseInt(data.MRData.total);
            offset += limit;

            hasMore = offset < total;
            console.log(`Fetched ${allConstructors.length} of ${total} constructors`);
        } catch (error) {
            console.error('Error fetching constructors:', error);
            hasMore = false;
        }
    }

    return allConstructors;
}

/**
 * Maps constructor IDs to their brand colors
 * This is a comprehensive list of all F1 constructors' colors
 */
export const constructorColors = {
    // Current teams (2025)
    'red_bull': '#0600EF',      // Red Bull
    'ferrari': '#DC0000',       // Ferrari
    'mercedes': '#00D2BE',      // Mercedes
    'mclaren': '#FF8700',       // McLaren
    'aston_martin': '#006F62',  // Aston Martin
    'alpine': '#0090FF',        // Alpine
    'haas': '#FFF500',          // Haas
    'rb': '#2B4562',            // Racing Bulls (previously AlphaTauri)
    'sauber': '#900000',        // Sauber (transitioning to Audi)
    'williams': '#0082FA',      // Williams

    // Recent historical teams (2010-2024)
    'alphatauri': '#2B4562',    // AlphaTauri (2020-2023)
    'alfa': '#900000',          // Alfa Romeo (2019-2023)
    'racing_point': '#F596C8',  // Racing Point (2019-2020)
    'toro_rosso': '#0000FF',    // Toro Rosso (2006-2019)
    'force_india': '#FF5F0F',   // Force India (2008-2018)
    'manor': '#323332',         // Manor/Marussia (2016)
    'lotus_f1': '#000000',      // Lotus F1 (2012-2015)
    'caterham': '#006C61',      // Caterham (2012-2014)
    'hrt': '#B6BABD',           // HRT (2010-2012)
    'virgin': '#000000',        // Virgin (2010-2011)

    // 2000-2010 era
    'brawn': '#00FF00',         // Brawn GP (2009)
    'bmw_sauber': '#006EFF',    // BMW Sauber (2006-2009)
    'toyota': '#FF1E00',        // Toyota (2002-2009)
    'honda': '#000000',         // Honda (2006-2008)
    'super_aguri': '#E32F22',   // Super Aguri (2006-2008)
    'spyker': '#FF6600',        // Spyker (2007)
    'midland': '#FF6600',       // Midland (2006)
    'bar': '#F9F90E',           // BAR (1999-2005)
    'renault': '#FFF500',       // Renault (historical)
    'jaguar': '#006C61',        // Jaguar (2000-2004)

    // 1990s
    'arrows': '#FF8700',        // Arrows (1978-2002)
    'minardi': '#000000',       // Minardi (1985-2005)
    'prost': '#0000FF',         // Prost (1997-2001)
    'stewart': '#FF8700',       // Stewart (1997-1999)
    'tyrrell': '#0000FF',       // Tyrrell (1970-1998)
    'forti': '#FF8700',         // Forti (1995-1996)
    'footwork': '#FF8700',      // Footwork (1991-1996)
    'simtek': '#000000',        // Simtek (1994-1995)
    'pacific': '#0000FF',       // Pacific (1994-1995)
    'jordan': '#FF8700',        // Jordan (1991-2005)
    'larrousse': '#FF8700',     // Larrousse (1987-1994)
    'team_lotus': '#000000',    // Team Lotus (1958-1994)

    // 1980s
    'leyton': '#FF8700',        // Leyton House (1990-1992)
    'brabham': '#0000FF',       // Brabham (1962-1992)
    'ligier': '#0000FF',        // Ligier (1976-1996)
    'benetton': '#FF8700',      // Benetton (1986-2001)
    'dallara': '#000000',       // Dallara (1988-1992)
    'lola': '#000000',          // Lola (various years)
    'march': '#FF8700',         // March (1970-1992)
    'onyx': '#000000',          // Onyx (1989-1990)
    'rial': '#000000',          // Rial (1988-1989)
    'zakspeed': '#000000',      // Zakspeed (1985-1989)
    'osella': '#000000',        // Osella (1980-1990)
    'ags': '#000000',           // AGS (1986-1991)
    'coloni': '#FF8700',        // Coloni (1987-1991)
    'eurobrun': '#000000',      // EuroBrun (1988-1990)

    // 1970s
    'fittipaldi': '#FF8700',    // Fittipaldi (1975-1982)
    'hesketh': '#FFFFFF',       // Hesketh (1974-1978)
    'ensign': '#000000',        // Ensign (1973-1982)
    'shadow': '#000000',        // Shadow (1973-1980)
    'iso_marlboro': '#FF0000',  // Iso Marlboro (1973-1974)
    'surtees': '#FF0000',       // Surtees (1970-1978)
    'wolf': '#FF0000',          // Wolf (1977-1979)
    'matra': '#0000FF',         // Matra (1966-1972)

    // 1960s
    'eagle': '#FFFFFF',         // Eagle (1966-1969)
    'cooper': '#006600',        // Cooper (1953-1968)
    'brm': '#006600',           // BRM (1951-1977)
    'ats': '#FF0000',           // ATS (1963-1965)
    'de_tomaso': '#FF0000',     // De Tomaso (1961-1963)

    // 1950s
    'vanwall': '#006600',       // Vanwall (1954-1960)
    'connaught': '#006600',     // Connaught (1950-1959)
    'maserati': '#FF0000',      // Maserati (1950-1960)
    'gordini': '#0000FF',       // Gordini (1950-1956)
    'talbot-lago': '#0000FF',   // Talbot-Lago (1950-1951)
    'alta': '#006600',          // Alta (1950-1952)
    'emeryson': '#006600',      // Emeryson (1956)

    // Variant team names and special cases
    'mclaren_honda': '#FF8700',      // McLaren-Honda (historical reference)
    'mclaren_mercedes': '#FF8700',    // McLaren Mercedes
    'toro_rosso_honda': '#0000FF',    // Toro Rosso Honda
    'red_bull_racing': '#0600EF',     // Red Bull Racing
    'alphatauri_honda': '#2B4562',    // AlphaTauri Honda
    'alfa_romeo': '#900000',          // Alfa Romeo
    'alphatauri_rbpt': '#2B4562',     // AlphaTauri RBPT
    'alfa_romeo_sauber': '#900000',   // Alfa Romeo Sauber
    'alpine_renault': '#0090FF',      // Alpine Renault
    'aston_martin_aramco': '#006F62', // Aston Martin Aramco
    'mclaren_mercedes': '#FF8700',    // McLaren Mercedes
    'mercedes_amg': '#00D2BE',        // Mercedes AMG
    'rb_honda_rbpt': '#2B4562',       // RB Honda RBPT
    'red_bull_honda': '#0600EF',      // Red Bull Honda
    'red_bull_rbpt': '#0600EF',       // Red Bull RBPT
    'williams_mercedes': '#0082FA',   // Williams Mercedes
    'life': '#000000',                // Life (1990)
};

/**
 * Generates a color mapping for all constructors and saves it to local storage
 * This is meant to be called once to generate the mapping that will be used by the application
 */
export async function generateConstructorColorMap() {
    try {
        const constructors = await fetchAllConstructors();
        const colorMap = {};

        // Add each constructor to the color map
        constructors.forEach(constructor => {
            const constructorId = constructor.constructorId;
            // Check if we already have a color for this constructor
            if (constructorColors[constructorId]) {
                colorMap[constructorId] = constructorColors[constructorId];
            } else {
                // Try to match with a similar constructor
                const matchedColor = findSimilarConstructorColor(constructorId, constructor.name);
                colorMap[constructorId] = matchedColor || '#999999'; // Default gray for unknown teams
            }
        });

        // Save the complete color map to localStorage for future use
        localStorage.setItem('constructorColorMap', JSON.stringify(colorMap));
        console.log(`Generated color map for ${Object.keys(colorMap).length} constructors`);

        return colorMap;
    } catch (error) {
        console.error('Error generating constructor color map:', error);
        return constructorColors; // Fall back to our predefined colors
    }
}

/**
 * Try to find a similar constructor name in our color map
 * @param {string} constructorId - The ID of the constructor
 * @param {string} constructorName - The name of the constructor
 * @returns {string|null} The color code or null if not found
 */
function findSimilarConstructorColor(constructorId, constructorName) {
    // Convert to lowercase for easier matching
    const lowerId = constructorId.toLowerCase();
    const lowerName = constructorName.toLowerCase();

    // Check for common team patterns
    if (lowerId.includes('ferrari') || lowerName.includes('ferrari')) {
        return constructorColors.ferrari;
    }
    if (lowerId.includes('mclaren') || lowerName.includes('mclaren')) {
        return constructorColors.mclaren;
    }
    if (lowerId.includes('mercedes') || lowerName.includes('mercedes')) {
        return constructorColors.mercedes;
    }
    if (lowerId.includes('red_bull') || lowerId.includes('redbull') ||
        lowerName.includes('red bull')) {
        return constructorColors.red_bull;
    }
    if (lowerId.includes('williams') || lowerName.includes('williams')) {
        return constructorColors.williams;
    }
    if (lowerId.includes('lotus') || lowerName.includes('lotus')) {
        return constructorColors.team_lotus;
    }
    if (lowerId.includes('sauber') || lowerName.includes('sauber')) {
        return constructorColors.sauber;
    }
    if (lowerId.includes('renault') || lowerName.includes('renault')) {
        return constructorColors.renault;
    }

    // For teams we don't recognize, return null and let the caller use a default
    return null;
}

/**
 * Gets the color map for all F1 constructors
 * @returns {Object} Map of constructor IDs to color codes
 */
export function getConstructorColorMap() {
    // Try to get from localStorage first
    const storedMap = localStorage.getItem('constructorColorMap');
    if (storedMap) {
        return JSON.parse(storedMap);
    }

    // If not in localStorage, return our predefined colors
    return constructorColors;
}

/**
 * Gets the color for a specific constructor
 * @param {string} constructorId - The ID of the constructor
 * @returns {string} The color code for the constructor
 */
export function getConstructorColor(constructorId) {
    const colorMap = getConstructorColorMap();
    return colorMap[constructorId] || '#999999'; // Default gray for unknown teams
}