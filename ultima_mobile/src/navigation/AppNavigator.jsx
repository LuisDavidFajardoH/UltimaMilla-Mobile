import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import RegisterTypeScreen from '../screens/registro/RegisterTypeScreen';
import { RegisterBusinessScreen } from '../screens/registro/registroSucursal';
import { RegisterDeliveryScreen } from '../screens/registro/registroRepartidor';
import { TableroSucursalScreen } from '../screens/TableroSucursal/TableroSucursal';
import { TableroConductorScreen } from '../screens/TableroConductor/TableroConductor';

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
        <Stack.Screen name="RegisterDelivery" component={RegisterDeliveryScreen} />
        <Stack.Screen name="Tablero" component={TableroSucursalScreen} />
        <Stack.Screen name="Conductor" component={TableroConductorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
