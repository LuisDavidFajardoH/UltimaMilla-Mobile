import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import RegisterTypeScreen from '../screens/registro/RegisterTypeScreen';
import { RegisterBusinessScreen } from '../screens/registro/registroSucursal';
import { TableroSucursalScreen } from '../screens/TableroSucursal/TableroSucursal';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="99 Envios"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f8f9fc' }
        }}>
        <Stack.Screen name="99 Envios" component={HomeScreen} />
        <Stack.Screen name="Register" component={RegisterTypeScreen} />
        <Stack.Screen name="RegisterBusiness" component={RegisterBusinessScreen} />
        <Stack.Screen name="Tablero" component={TableroSucursalScreen} />
        {/* Temporalmente comentamos esta ruta hasta crear el componente
        <Stack.Screen name="RegisterDelivery" component={RegisterDeliveryScreen} /> 
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
