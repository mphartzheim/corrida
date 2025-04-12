import axios from 'axios';

/**
 * Service for fetching Formula 1 data
 */
export default {
    /**
     * Fetches data for the next race
     * @returns {Promise} Promise with race data
     */
    async getNextRace() {
        try {
            const response = await axios.get('https://api.jolpi.ca/ergast/f1/current/next.json');
            return response.data.MRData.RaceTable.Races[0];
        } catch (error) {
            console.error('Error fetching race data:', error);
            throw error;
        }
    },

    /**
     * Fetches data for the full season calendar
     * @param {number} year - Optional year to fetch (defaults to current season)
     * @returns {Promise} Promise with full season race data
     */
    async getFullCalendar(year = 'current') {
        try {
            const response = await axios.get(`https://api.jolpi.ca/ergast/f1/${year}.json`);
            return response.data.MRData.RaceTable.Races;
        } catch (error) {
            console.error(`Error fetching ${year} calendar data:`, error);
            throw error;
        }
    },

    /**
     * Gets the list of valid F1 seasons from 1950 to current year
     * @param {boolean} descending - Whether to sort years in descending order (newest first)
     * @returns {Array} Array of year numbers
     */
    getValidSeasons(descending = true) {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = 1950; year <= currentYear; year++) {
            years.push(year);
        }
        return descending ? years.reverse() : years;
    },

    /**
     * Fetches race results for a specific round
     * @param {number} year - The season year
     * @param {number} round - The round number
     * @returns {Promise} Promise with race results data
     */
    async getRaceResults(year, round) {
        try {
            const response = await axios.get(`https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json`);
            return response.data.MRData.RaceTable.Races[0];
        } catch (error) {
            console.error(`Error fetching race results for ${year} round ${round}:`, error);
            throw error;
        }
    },

    /**
     * Fetches qualifying results for a specific round
     * @param {number} year - The season year
     * @param {number} round - The round number
     * @returns {Promise} Promise with qualifying results data
     */
    async getQualifyingResults(year, round) {
        try {
            const response = await axios.get(`https://api.jolpi.ca/ergast/f1/${year}/${round}/qualifying.json`);
            return response.data.MRData.RaceTable.Races[0];
        } catch (error) {
            console.error(`Error fetching qualifying results for ${year} round ${round}:`, error);
            throw error;
        }
    },

    /**
     * Fetches sprint race results for a specific round
     * @param {number} year - The season year
     * @param {number} round - The round number
     * @returns {Promise} Promise with sprint race results data
     */
    async getSprintResults(year, round) {
        try {
            const response = await axios.get(`https://api.jolpi.ca/ergast/f1/${year}/${round}/sprint.json`);
            return response.data.MRData.RaceTable.Races[0];
        } catch (error) {
            // If we get a 404, it likely means there was no sprint race
            if (error.response && error.response.status === 404) {
                return null;
            }
            console.error(`Error fetching sprint results for ${year} round ${round}:`, error);
            throw error;
        }
    }
};