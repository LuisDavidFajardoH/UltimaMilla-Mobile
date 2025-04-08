import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Layout, Text, Card, Button, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { authService } from '../../services/authService';

const BackIcon = (props) => (
  <Icon {...props} name="arrow-back" fill="#7380EC"/>
);

const renderBackAction = (navigation) => (
  <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
);

const renderDashboardAction = (navigation) => (
  <TopNavigationAction 
    icon={(props) => <FontAwesome5 name="columns" size={20} color="#7380EC" />}
    onPress={() => navigation.navigate('ConductorDashboard')}
  />
);

const PorEntregar = ({ navigation }) => {
  const insets = useSafeAreaInsets(); // Get safe area insets
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const userData = await authService.getUserData();
        const response = await axios.get(`https://api.99envios.app/api/reporte-pedidos/EnProceso/${userData.id}`);
        const data = response.data; // Use response.data instead of response.json()
        // Map API response to expected structure
        const mappedPedidos = data.map((pedido) => ({
          id_pedido: pedido.ID_pedido,
          nombre_cliente: pedido.nombre_cliente,
          costo_envio: `$${parseFloat(pedido.costo_envio).toFixed(2)}`,
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
      <Layout style={[styles.container, { paddingTop: insets.top }]}>
        <Layout style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7380EC" />
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout style={[styles.container, { paddingTop: insets.top }]}>
      <TopNavigation
        title={evaProps => <Text {...evaProps} style={{color: '#7380EC'}}>Pedidos por Entregar</Text>}
        alignment="center"
        accessoryLeft={() => renderBackAction(navigation)}
        accessoryRight={() => renderDashboardAction(navigation)}
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
              <FontAwesome5 name="user" size={16} color="black" />
              <Text style={styles.text}>{pedido.nombre_cliente}</Text>
            </View>
            <View style={styles.row}>
              <FontAwesome5 name="money-bill-wave" size={16} color="black" />
              <Text style={styles.text}>{pedido.costo_envio}</Text>
            </View>
            <View style={styles.row}>
              <FontAwesome5 name="calendar-alt" size={16} color="black" />
              <Text style={styles.text}>{pedido.fecha_pedido}</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.statusCircle} />
              <Text style={styles.text}>{pedido.estado_pedido}</Text>
            </View>
            <Button 
              style={styles.button} 
              size="small"
              onPress={() => navigation.navigate('DetallesPedido', { 
                pedido: { 
                  id_pedido: pedido.id_pedido 
                },
                fromScreen: 'PorEntregar'
              })}
            >
              Ver detalles
            </Button>
          </Card>
        ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#7380EC',
    textAlign: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PorEntregar;
