const axios = require('axios');

const BASE_URL = 'https://vpic.nhtsa.dot.gov/api';

class ExternalVehicleService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: 'https://api.imagin.studio/getimage',
      params: {
        customer: process.env.IMAGIN_CUSTOMER_KEY || 'hrjavascript-mastery'
      }
    });
  }

  async getMakes() {
    try {
      const response = await axios.get(`${BASE_URL}/vehicles/GetAllMakes?format=json`);
      return response.data.Results;
    } catch (error) {
      console.error('Error fetching makes:', error);
      throw error;
    }
  }

  async getModelsByMake(makeId) {
    try {
      const response = await axios.get(`${BASE_URL}/vehicles/GetModelsForMakeId/${makeId}?format=json`);
      return response.data.Results;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  async getVehicleDetails(make, model, year) {
    try {
      const response = await axios.get(`${BASE_URL}/vehicles/GetVehicleVariableValues?format=json&variable=EngineModel&year=${year}&make=${make}&model=${model}`);
      return response.data.Results;
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      throw error;
    }
  }

  async getVehicleRecalls(make, model, year) {
    try {
      const response = await axios.get(`${BASE_URL}/SafetyRatings/VehicleId/${year}/${make}/${model}?format=json`);
      return response.data.Results;
    } catch (error) {
      console.error('Error fetching recalls:', error);
      throw error;
    }
  }

  async getVehicleImage(brand, model, year) {
    try {
      const response = await this.apiClient.get('', {
        params: {
          make: brand,
          modelFamily: model.split(' ')[0],
          zoomType: 'fullscreen',
          modelYear: year,
          angle: '33'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle image:', error);
      throw error;
    }
  }
}

module.exports = new ExternalVehicleService(); 