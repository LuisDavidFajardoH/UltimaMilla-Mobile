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
          height: 52, // Reducida altura del header
        },
        headerTitleStyle: {
          fontSize: 16, // Título más pequeño
        },
        headerTintColor: '#2E3A59',
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
        drawerActiveTintColor: '#0086FF',
        drawerInactiveTintColor: '#2E3A59',
        drawerItemStyle: {
          height: 60, // Altura reducida de cada item
          marginVertical: 0, // Sin margen vertical
          paddingVertical: 0, // Sin padding vertical
        },
        drawerLabelStyle: {
          fontSize: 14, // Texto más pequeño
          marginLeft: 0, // Reducir espacio entre icono y texto
        },
      }}
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
        name="Dashboard99" 
        component={TableroSucursalScreen}
        options={{
          title: 'Dashboard 99',
          drawerIcon: (props) => renderIcon(props)('browser-outline')
        }}
      />
      
      {/* Grupo de Administrar Sucursal */}
      <Drawer.Screen 
        name="Reportes" 
        component={TableroSucursalScreen}
        options={{
          title: 'Reportes',
          drawerIcon: (props) => renderIcon(props)('bar-chart-outline'),
          groupName: 'Administrar Sucursal'
        }}
      />
      <Drawer.Screen 
        name="Pedidos" 
        component={TableroSucursalScreen}
        options={{
          title: 'Pedidos',
          drawerIcon: (props) => renderIcon(props)('file-text-outline')
        }}
      />
      <Drawer.Screen 
        name="CrearConductor" 
        component={TableroSucursalScreen}
        options={{
          title: 'Crear Conductor',
          drawerIcon: (props) => renderIcon(props)('person-add-outline')
        }}
      />
      <Drawer.Screen 
        name="Inventario" 
        component={TableroSucursalScreen}
        options={{
          title: 'Inventario',
          drawerIcon: (props) => renderIcon(props)('archive-outline')
        }}
      />
      <Drawer.Screen 
        name="Dropshipping" 
        component={TableroSucursalScreen}
        options={{
          title: 'Dropshipping',
          drawerIcon: (props) => renderIcon(props)('shopping-bag-outline')
        }}
      />

      {/* Grupo de Pedidos */}
      <Drawer.Screen 
        name="PedidoIndividual" 
        component={TableroSucursalScreen}
        options={{
          title: 'Pedido Individual',
          drawerIcon: (props) => renderIcon(props)('pin-outline')
        }}
      />
      <Drawer.Screen 
        name="PedidoMasivo" 
        component={TableroSucursalScreen}
        options={{
          title: 'Pedido Masivo',
          drawerIcon: (props) => renderIcon(props)('layers-outline')
        }}
      />
      <Drawer.Screen 
        name="EditarPedidos" 
        component={TableroSucursalScreen}
        options={{
          title: 'Editar Pedidos',
          drawerIcon: (props) => renderIcon(props)('edit-2-outline')
        }}
      />
      <Drawer.Screen 
        name="CerrarSesion" 
        component={TableroSucursalScreen}
        options={{
          title: 'Cerrar Sesión',
          drawerIcon: (props) => renderIcon(props)('log-out-outline')
        }}
      />
    </Drawer.Navigator>
  );
}

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
        <Stack.Screen name="Tablero" component={DrawerNavigator} />
        <Stack.Screen name="Conductor" component={TableroConductorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
