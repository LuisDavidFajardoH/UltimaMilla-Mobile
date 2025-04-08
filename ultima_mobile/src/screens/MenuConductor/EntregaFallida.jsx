import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Button as RNButton, Platform, ScrollView, RefreshControl } from 'react-native';
import { Layout, Text, Card, Icon, TopNavigation, TopNavigationAction, Button } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { authService } from '../../services/authService';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

const BackIcon = (props) => (
  <Icon {...props} name="arrow-back" />
);

const renderBackAction = (navigation) => (
  <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
);

const EntregaFallida = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);
  const [showDesdePicker, setShowDesdePicker] = useState(false);
  const [showHastaPicker, setShowHastaPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPedidos();
  }, []);

  useEffect(() => {
    if (desde || hasta) {
      const filtered = pedidos.filter((pedido) => {
        // Normaliza las fechas para comparación quitando la parte de tiempo
        const fechaPedidoStr = pedido.fecha_pedido.split('T')[0];
        const fechaPedido = new Date(fechaPedidoStr + 'T00:00:00');
        
        // Normaliza la fecha desde para comparación
        let desdeNormalizado = null;
        if (desde) {
          desdeNormalizado = new Date(desde);
          desdeNormalizado.setHours(0, 0, 0, 0);
        }
        
        // Normaliza la fecha hasta para comparación
        let hastaNormalizado = null;
        if (hasta) {
          hastaNormalizado = new Date(hasta);
          hastaNormalizado.setHours(23, 59, 59, 999);
        }
        
        if (desdeNormalizado && hastaNormalizado) {
          return fechaPedido >= desdeNormalizado && fechaPedido <= hastaNormalizado;
        } else if (desdeNormalizado) {
          return fechaPedido >= desdeNormalizado;
        } else if (hastaNormalizado) {
          return fechaPedido <= hastaNormalizado;
        }
        return true;
      });
      setFilteredPedidos(filtered);
      
      // Debug para ver el filtrado
      console.log('Desde:', desde ? desde.toISOString().split('T')[0] : 'no seleccionado');
      console.log('Hasta:', hasta ? hasta.toISOString().split('T')[0] : 'no seleccionado');
      console.log('Pedidos filtrados:', filtered.length);
    } else {
      setFilteredPedidos(pedidos);
    }
  }, [desde, hasta, pedidos]);

  // Normalizamos las fechas en la función onDateChange
  const onDateChange = (event, selectedDate, isFromDate) => {
    if (event.type === 'set' && selectedDate) {
      // Normaliza la fecha seleccionada
      const normalizedDate = new Date(selectedDate);
      normalizedDate.setHours(0, 0, 0, 0);
      
      if (isFromDate) {
        setDesde(normalizedDate);
        // Reajusta 'hasta' si es anterior a la nueva fecha 'desde'
        if (hasta && hasta < normalizedDate) {
          setHasta(null);
        }
        setShowDesdePicker(false);
      } else {
        setHasta(normalizedDate);
        setShowHastaPicker(false);
      }
    } else {
      setShowDesdePicker(false);
      setShowHastaPicker(false);
    }
  };

  const showDatePicker = (isFrom) => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: isFrom ? (desde || new Date()) : (hasta || new Date()),
        mode: 'date',
        onChange: (event, date) => onDateChange(event, date, isFrom),
        maximumDate: new Date(), // Limita la fecha máxima al día actual
        minimumDate: isFrom ? null : desde, // Si es "hasta", la fecha mínima es "desde"
      });
    } else {
      isFrom ? setShowDesdePicker(true) : setShowHastaPicker(true);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const userData = await authService.getUserData();
      const response = await axios.get(`https://api.99envios.app/api/reporte-pedidos/Devuelto/${userData.id}`);
      const data = response.data;
      const mappedPedidos = data.map((pedido) => ({
        id_pedido: pedido.ID_pedido,
        nombre_cliente: pedido.nombre_cliente,
        costo_envio: `$${parseFloat(pedido.costo_envio).toFixed(2)}`,
        fecha_pedido: pedido.fecha_pedido,
        estado_pedido: pedido.estado_pedido,
      }));
      setPedidos(mappedPedidos);
      setFilteredPedidos(mappedPedidos);
    } catch (error) {
      console.error('Error fetching pedidos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
        title="Entrega Fallida"
        alignment="center"
        accessoryLeft={() => renderBackAction(navigation)}
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
        {/* Card for the date filter */}
        <Card style={styles.card}>
          <Text category="h6" style={styles.title}>
            Filtrar por rango de fechas
          </Text>
          <Layout style={styles.underline} />
          <Text category="p2" style={styles.description}>
            Seleccione un rango de fechas para filtrar los pedidos fallidos.
          </Text>
          
          <View style={styles.datePickersContainer}>
            <View style={styles.datePicker}>
              <RNButton 
                title={`Desde: ${desde ? desde.toLocaleDateString() : 'Seleccionar'}`} 
                onPress={() => showDatePicker(true)}
                color="#7380EC" 
              />
              {Platform.OS !== 'android' && showDesdePicker && (
                <DateTimePicker
                  value={desde || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => onDateChange(event, date, true)}
                  maximumDate={new Date()}
                />
              )}
            </View>
            <View style={styles.datePicker}>
              <RNButton 
                title={`Hasta: ${hasta ? hasta.toLocaleDateString() : 'Seleccionar'}`} 
                onPress={() => showDatePicker(false)} 
                disabled={!desde}
                color="#7380EC"
              />
              {Platform.OS !== 'android' && showHastaPicker && (
                <DateTimePicker
                  value={hasta || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => onDateChange(event, date, false)}
                  maximumDate={new Date()}
                  minimumDate={desde}
                />
              )}
            </View>
          </View>
        </Card>

        {/* Results heading */}
        {filteredPedidos.length > 0 && (
          <Text category="h6" style={styles.resultsTitle}>
            Mostrando {filteredPedidos.length} resultados
          </Text>
        )}
        
        {/* Show message when no orders are found */}
        {filteredPedidos.length === 0 && (
          <Card style={styles.card}>
            <Text style={styles.noResultsText}>
              No se encontraron pedidos en el rango de fechas seleccionado.
            </Text>
          </Card>
        )}

        {/* List of orders */}
        {filteredPedidos.map((pedido) => (
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
                fromScreen: 'EntregaFallida'
              })}
            >
              Ver detalles
            </Button>
          </Card>
        ))}
        
        {/* Add some extra padding at the bottom for better scrolling */}
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
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 0, // Reduce el padding superior para acercar el filtro a la barra de navegación
  },
  scrollBottomPadding: {
    height: 20,
  },
  datePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  datePicker: {
    flex: 1,
    marginHorizontal: 8,
  },
  card: {
    padding: 16,
    marginVertical: 6, // Reduce el margen vertical de las tarjetas
    borderRadius: 8,
  },
  title: {
    fontWeight: 'bold',
    color: '#7380EC',
    textAlign: 'center',
  },
  underline: {
    height: 2,
    backgroundColor: '#7380EC',
    marginVertical: 8,
    alignSelf: 'center',
    width: '80%',
  },
  description: {
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
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
  resultsTitle: {
    marginVertical: 8,
    textAlign: 'center',
    color: '#7380EC',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#555',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EntregaFallida;
