import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Icon } from '@ui-kitten/components';
import HomeScreen from '../screens/HomeScreen';
import RegisterTypeScreen from '../screens/registro/RegisterTypeScreen';
import { RegisterBusinessScreen } from '../screens/registro/registroSucursal';
import { RegisterDeliveryScreen } from '../screens/registro/registroRepartidor';
import { TableroSucursalScreen } from '../screens/TableroSucursal/TableroSucursal';
import { TableroConductorScreen } from '../screens/TableroConductor/TableroConductor';
import ReportesScreen from '../screens/Reportes/ReportesScreen'; // Update import to use default import
import InventarioScreen from '../screens/Inventario/InventarioScreen';  // Add this import
import PedidoIndividualScreen from '../screens/sucursal/PedidoIndividualScreen'; // Add this import

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  const renderIcon = (props) => (name) => (
    <Icon {...props} pack='eva' name={name} style={[props.style, { width: 18, height: 18 }]} />
  );

  return (
    <Drawer.Navigator 
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          height: 100,
        },
        headerTitleStyle: {
          fontSize: 16,
        },
        headerTintColor: '#2E3A59',
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
        drawerActiveTintColor: '#0086FF',
        drawerInactiveTintColor: '#2E3A59',
        drawerItemStyle: {
          height: 62,
          marginVertical: 0,
          paddingVertical: 0,
        },
        drawerLabelStyle: {
          fontSize: 14,
          marginLeft: 0,
        },
      }}
      initialRouteName="TableroSucursal"
    >
      <Drawer.Screen 
        name="TableroSucursal" 
        component={TableroSucursalScreen}
        options={{
          title: 'Tablero',
          drawerIcon: (props) => renderIcon(props)('grid-outline')
        }}
      />
      <Drawer.Screen 
        name="Reportes" 
        component={ReportesScreen}  // Use the imported component
        options={{
          title: 'Reportes',
          drawerIcon: (props) => renderIcon(props)('bar-chart-outline')
        }}
      />
      <Drawer.Screen 
        name="InventarioSucursal" 
        component={InventarioScreen}  // Change this line
        options={{
          title: 'Inventario',
          drawerIcon: (props) => renderIcon(props)('archive-outline')
        }}
      />
      <Drawer.Screen 
        name="PedidoIndividualSucursal" 
        component={PedidoIndividualScreen} // Update this line
        options={{
          title: 'Pedido Individual',
          drawerIcon: (props) => renderIcon(props)('pin-outline')
        }}
      />
      <Drawer.Screen 
        name="PedidoMasivoSucursal" 
        component={TableroSucursalScreen}
        options={{
          title: 'Pedido Masivo',
          drawerIcon: (props) => renderIcon(props)('layers-outline')
        }}
      />
    </Drawer.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f8f9fc' }
        }}>
        <Stack.Screen name="Login" component={HomeScreen} />
        <Stack.Screen name="Register" component={RegisterTypeScreen} />
        <Stack.Screen name="RegisterBusiness" component={RegisterBusinessScreen} />
        <Stack.Screen name="RegisterDelivery" component={RegisterDeliveryScreen} />
        <Stack.Screen name="SucursalDashboard" component={DrawerNavigator} />
        <Stack.Screen name="ConductorDashboard" component={TableroConductorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
