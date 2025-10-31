import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

export const getPredictionForDomain = async (domain, inputValue) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/${domain}`, {
      input: inputValue
    });

    return response.data;
  } catch (error) {
    console.error(`ML Service Error for ${domain}:`, error.message);
    throw new Error(`Failed to get predictions for ${domain}`);
  }
};

export const checkMLServiceHealth = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`);
    return response.data;
  } catch (error) {
    return { status: 'unavailable', error: error.message };
  }
};