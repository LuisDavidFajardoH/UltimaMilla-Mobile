import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

export const authService = {
  setAuthData: async (userData) => {
    try {
      if (!userData || !userData.token) {
        throw new Error('Invalid user data or missing token');
      }

      // Asegurarse de que los valores no sean undefined y guardar el nombre de la sucursal
      const dataToStore = {
        id: userData.id || '',
        email: userData.email || '',
        id_rol: userData.id_rol || 0,
        token: userData.token,
        sucursales: userData.sucursales || [],
        sucursalNombre: userData.sucursales?.[0]?.nombre_sucursal || 'Sin nombre'
      };

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, dataToStore.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(dataToStore));
      
      return true;
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  },

  getAuthToken: async () => {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  getUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  clearAuth: async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
};
