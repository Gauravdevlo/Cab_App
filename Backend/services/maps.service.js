const axios = require('axios');
const captainModel = require('../models/captain.model');

const apiKey = process.env.LOCATIONIQ_API;

// Get Coordinates from Address
module.exports.getAddressCoordinate = async (address) => {
    const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(address)}&format=json`;

    try {
        const response = await axios.get(url);
        if (response.data.length > 0) {
            const location = response.data[0];
            return {
                ltd: parseFloat(location.lat),
                lng: parseFloat(location.lon)
            };
        } else {
            throw new Error('Unable to fetch coordinates');
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Get Distance and Time
module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const url = `https://us1.locationiq.com/v1/matrix/driving?key=${apiKey}&origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&format=json`;

    try {
        const response = await axios.get(url);
        if (response.data.distances.length > 0) {
            return {
                distance: response.data.distances[0][0], // Distance in meters
                duration: response.data.durations[0][0] // Duration in seconds
            };
        } else {
            throw new Error('No routes found');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
};

// Autocomplete Suggestions
module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('Query is required');
    }

    const url = `https://us1.locationiq.com/v1/autocomplete.php?key=${apiKey}&q=${encodeURIComponent(input)}&format=json`;

    try {
        const response = await axios.get(url);
        if (response.data.length > 0) {
            return response.data.map(prediction => prediction.display_name);
        } else {
            throw new Error('Unable to fetch suggestions');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
};

// Get Captains in the Radius
module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [[ltd, lng], radius / 6371]
            }
        }
    });

    return captains;
};
