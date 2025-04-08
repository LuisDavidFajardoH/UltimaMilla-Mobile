import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, RefreshControl, Linking } from 'react-native';
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

const formatTimeFromDateTime = (dateTimeStr) => {
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  });
};

const DetallesPedido = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Extract parameters from route
  const id_pedido = route.params?.pedido?.id_pedido;
  const fromScreen = route.params?.fromScreen;

  const fetchPedidoDetails = useCallback(async () => {
    if (!id_pedido) {
      console.error('No se proporcionó ID del pedido');
      return;
    }
    
    try {
      const response = await axios.get(`https://api.99envios.app/api/pedidos/${id_pedido}`);
      setPedido(response.data);
    } catch (error) {
      console.error('Error fetching pedido details:', error);
    } finally {
      setLoading(false);
    }
  }, [id_pedido]);

  useEffect(() => {
    fetchPedidoDetails();
  }, [fetchPedidoDetails]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPedidoDetails().finally(() => setRefreshing(false));
  }, [fetchPedidoDetails]);

  const openWhatsApp = (phoneNumber) => {
    let number = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    Linking.openURL(`whatsapp://send?phone=${number}`);
  };

  const openMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
  };

  if (loading || !pedido) {
    return (
      <Layout style={styles.container}>
        <ActivityIndicator size="large" color="#7380EC" />
      </Layout>
    );
  }

  return (
    <Layout style={[styles.container, { paddingTop: insets.top }]}>
      <TopNavigation
        title={`Pedido #${pedido.ID_pedido}`}
        alignment="center"
        accessoryLeft={() => renderBackAction(navigation)}
      />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7380EC']} />
        }
      >
        <Card style={styles.card}>
          <View style={styles.header}>
            <FontAwesome5 name="info-circle" size={20} color="#7380EC" />
            <Text category="h6" style={styles.cardTitle}>Información</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome5 name="calendar" size={16} color="black" />
            <Text style={styles.text}>{pedido.fecha_pedido}</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome5 name="money-bill-wave" size={16} color="black" />
            <Text style={styles.text}>$ {(parseFloat(pedido.costo_envio) + parseFloat(pedido.valor_producto)).toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome5 name="clock" size={16} color="black" />
            <Text style={styles.text}>De {formatTimeFromDateTime(pedido.hora_inicio)} a {formatTimeFromDateTime(pedido.hora_fin)}</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.statusCircle} />
            <Text style={styles.text}>{pedido.estado_pedido}</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.header}>
            <FontAwesome5 name="map-marker" size={20} color="#7380EC" />
            <Text category="h6" style={styles.cardTitle}>Dirección de Recogida</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome5 name="city" size={16} color="#555" />
            <Text style={styles.text}>{pedido.ciudad}</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#555" />
            <Text style={styles.text}>{pedido.direccion_recogida}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              size="small"
              style={[styles.button, styles.mapButton]}
              onPress={() => openMaps(pedido.direccion_recogida)}
              accessoryLeft={(props) => <FontAwesome5 name="map" size={16} color="white" />}
            >
              Ver Mapa
            </Button>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.header}>
            <FontAwesome5 name="map-marker" size={20} color="#7380EC" />
            <Text category="h6" style={styles.cardTitle}>Dirección de Envío</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome5 name="user" size={16} color="#555" />
            <Text style={styles.text}>{pedido.cliente.nombre}</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome5 name="phone" size={16} color="#555" />
            <Text style={styles.text}>{pedido.cliente.telefono}</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome5 name="envelope" size={16} color="#555" />
            <Text style={styles.text}>{pedido.cliente.email}</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome5 name="flag" size={16} color="#555" />
            <Text style={styles.text}>{pedido.pais}</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome5 name="city" size={16} color="#555" />
            <Text style={styles.text}>{pedido.ciudad}</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome5 name="map-marker-alt" size={16} color="#555" />
            <Text style={styles.text}>{pedido.direccion_entrega}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              size="small"
              style={[styles.button, styles.whatsappButton]}
              onPress={() => openWhatsApp(pedido.cliente.telefono)}
              accessoryLeft={(props) => <FontAwesome5 name="whatsapp" size={16} color="white" />}
            >
              WhatsApp
            </Button>
            <Button
              size="small"
              style={[styles.button, styles.mapButton]}
              onPress={() => openMaps(pedido.direccion_entrega)}
              accessoryLeft={(props) => <FontAwesome5 name="map" size={16} color="white" />}
            >
              Ver Mapa
            </Button>
          </View>
        </Card>
        
        <Card style={styles.card}>
          <View style={styles.header}>
            <FontAwesome5 name="box" size={20} color="#7380EC" />
            <Text category="h6" style={styles.cardTitle}>Detalles del Producto</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome5 name="box" size={16} color="#555" />
            <Text style={styles.text}>{pedido.detalles_producto}</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome5 name="tag" size={16} color="#555" />
            <Text style={styles.text}>$ {parseFloat(pedido.valor_producto).toFixed(2)}</Text>
          </View>
        </Card>

        {/* Only show action buttons if not coming from Entregado or EntregaFallida */}
        {!fromScreen && (
          <View style={styles.actionButtonsContainer}>
            <Button
              size="medium"
              style={[styles.actionButton, styles.entregarButton]}
              accessoryLeft={(props) => <FontAwesome5 name="truck" size={16} color="white" />}
            >
              Salir a entregar
            </Button>
            <Button
              size="medium"
              style={[styles.actionButton, styles.novedadesButton]}
              accessoryLeft={(props) => <FontAwesome5 name="exclamation-circle" size={16} color="white" />}
            >
              Novedades
            </Button>
            <Button
              size="medium"
              style={[styles.actionButton, styles.desasignarButton]}
              accessoryLeft={(props) => <FontAwesome5 name="times-circle" size={16} color="white" />}
            >
              Desasignar
            </Button>
          </View>
        )}

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
  button: {
    marginTop: 16,
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
  label: {
    fontWeight: 'bold',
    color: '#555',
    marginRight: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    borderColor: '#25D366',
  },
  mapButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  actionButtonsContainer: {
    padding: 16,
    gap: 10,
  },
  actionButton: {
    marginBottom: 10,
  },
  desasignarButton: {
    backgroundColor: '#c64141',
    borderColor: '#c64141',
  },
  novedadesButton: {
    backgroundColor: '#7380EC',
    borderColor: '#7380EC',
  },
  entregarButton: {
    backgroundColor: '#41c675',
    borderColor: '#41c675',
  },
});

export default DetallesPedido;
