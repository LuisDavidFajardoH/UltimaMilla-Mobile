import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, RefreshControl, Alert } from 'react-native';
import { Layout, Text, Card, Button, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { authService } from '../../services/authService';

const BackIcon = (props) => (
  <Icon {...props} name="arrow-back" />
);

const renderBackAction = (navigation) => (
  <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
);

const NoAsignado = ({ navigation }) => {
  const insets = useSafeAreaInsets(); // Get safe area insets
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleEnEspera = async (orderId) => {
    try {
      const userData = await authService.getUserData();
      const url = `https://api.99envios.app/api/pedidos/actualizar-sin-asignar/${userData.id}/${orderId}`;
      
      const response = await axios.post(url);
      if (response.status === 200) {
        // Remove the order from the local state
        setPedidos(pedidos.filter(p => p.id_pedido !== orderId));
        Alert.alert('Éxito', 'Pedido marcado como en espera');
        // Optionally navigate back or refresh the screen
        navigation.navigate('MenuConductor', { refresh: true });
      } else {
        throw new Error('Error al actualizar el estado del pedido');
      }
    } catch (error) {
      console.error('Error al marcar el pedido como en espera:', error);
      Alert.alert('Error', 'No se pudo marcar el pedido como en espera');
    }
  };

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get(`https://api.99envios.app/api/pedidos-no-asignados`);
        const data = response.data;
        const mappedPedidos = data.map((pedido) => ({
          id_pedido: pedido.ID_pedido,
          direccion_entrega: pedido.direccion_entrega,
          direccion_recogida: pedido.direccion_recogida,
          costo_envio: `$${parseFloat(pedido.costo_envio).toFixed(2)}`,
          pais: pedido.pais,
          ciudad: pedido.ciudad,
          hora_inicio: new Date(pedido.hora_inicio).toLocaleTimeString(),
          hora_fin: new Date(pedido.hora_fin).toLocaleTimeString(),
          fecha_pedido: pedido.fecha_pedido,
          estado_pedido: pedido.estado_pedido,
        }));
        setPedidos(mappedPedidos);
      } catch (error) {
        console.error('Error fetching pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  if (loading) {
    return (
      <Layout style={styles.container}>
        <ActivityIndicator size="large" color="#7380EC" />
      </Layout>
    );
  }

  return (
    <Layout style={[styles.container, { paddingTop: insets.top }]}>
      <TopNavigation
        title="Pedidos no Asignados"
        alignment="center"
        accessoryLeft={() => renderBackAction(navigation)} // Add back button
      />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7380EC']}
          />
        }
      >
        <Card style={styles.card}>
          <Text category="h6" style={styles.title}>
            Pedidos no Asignados
          </Text>
          <Layout style={styles.underline} /> {/* Reduced width underline */}
          <Text category="p2" style={styles.description}>
            Elija pedidos y haga clic en el botón "En espera", para marcar los pedidos como listos para entregar y salir a entregarlos
          </Text>
        </Card>

        {/* Dynamic cards */}
        {pedidos.map((pedido) => (
          <Card key={pedido.id_pedido} style={styles.card}>
            <View style={styles.header}>
              <FontAwesome5 name="box" size={20} color="#7380EC" />
              <Text category="h6" style={styles.cardTitle}>
                PEDIDO #{pedido.id_pedido}
              </Text>
            </View>
            <View style={styles.row}>
              <FontAwesome5 name="map-marker-alt" size={16} color="black" />
              <Text style={styles.text}>Entrega: {pedido.direccion_entrega}</Text>
            </View>
            <View style={styles.row}>
              <FontAwesome5 name="warehouse" size={16} color="black" />
              <Text style={styles.text}>Recogida: {pedido.direccion_recogida}</Text>
            </View>
            <View style={styles.row}>
              <FontAwesome5 name="money-bill-wave" size={16} color="black" />
              <Text style={styles.text}>{pedido.costo_envio}</Text>
            </View>
            <View style={styles.row}>
              <FontAwesome5 name="globe-americas" size={16} color="black" />
              <Text style={styles.text}>{pedido.ciudad}, {pedido.pais}</Text>
            </View>
            <View style={styles.row}>
              <FontAwesome5 name="clock" size={16} color="black" />
              <Text style={styles.text}>De {pedido.hora_inicio} a {pedido.hora_fin}</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.statusCircle} />
              <Text style={styles.text}>{pedido.estado_pedido}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <Button 
                style={[styles.button, { marginRight: 8 }]} 
                size="small"
                onPress={() => navigation.navigate('DetallesPedido', { 
                  pedido: { 
                    id_pedido: pedido.id_pedido 
                  } 
                })}
              >
                Ver detalles
              </Button>
              <Button 
                style={[styles.button, { backgroundColor: '#41c675', borderColor: '#41c675' }]} 
                size="small"
                onPress={() => handleEnEspera(pedido.id_pedido)}
              >
                En espera
              </Button>
            </View>
          </Card>
        ))}
        <View style={styles.scrollBottomPadding} />
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 16,
  },
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  title: {
    fontWeight: 'bold',
    color: '#7380EC',
    textAlign: 'center', // Center the title text
  },
  underline: {
    height: 2,
    backgroundColor: '#7380EC',
    marginVertical: 8,
    alignSelf: 'center', // Center the underline
    width: '80%', // Reduce the width
  },
  description: {
    color: '#555',
    textAlign: 'center', // Center the description text
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the title and icon
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#7380EC',
    textAlign: 'center', // Center the title text
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  text: {
    marginLeft: 8,
    color: '#555',
  },
  statusCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7380EC',
    marginRight: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#7380EC',
    borderColor: '#7380EC',
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  scrollBottomPadding: {
    height: 20,
  },
});

export default NoAsignado;
