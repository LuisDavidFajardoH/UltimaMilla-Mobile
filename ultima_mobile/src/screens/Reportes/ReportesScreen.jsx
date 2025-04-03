import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Platform } from 'react-native';
import { Layout, Text, Card, Button, ButtonGroup, Spinner, Modal, Icon, Divider } from '@ui-kitten/components';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import axios from 'axios';
import { authService } from '../../services/authService';

const DatePickerButton = ({ label, date, onPress }) => (
  <Button
    appearance="ghost"
    status="basic"
    style={styles.datePickerButton}
    onPress={onPress}
    accessoryLeft={(props) => <Icon {...props} name="calendar-outline"/>}
  >
    {date ? date.toLocaleDateString() : 'Seleccionar fecha'}
  </Button>
);

const ReportesScreen = ({ navigation }) => {
  const [reporte, setReporte] = useState([]);
  const [tipoFecha, setTipoFecha] = useState('hoy');
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const obtenerReporteRepartidores = async () => {
    try {
      const userData = await authService.getUserData();
      const response = await axios.get(
        `https://api.99envios.app/api/reporte-repartidores/${userData.id}`,
        {
          params: {
            tipo_fecha: tipoFecha,
            fecha_desde: tipoFecha === "personalizado" ? fechaDesde : null,
            fecha_hasta: tipoFecha === "personalizado" ? fechaHasta : null,
          },
          headers: { 'Authorization': `Bearer ${userData.token}` }
        }
      );
      setReporte(response.data);
    } catch (error) {
      console.error("Error al obtener reporte:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    obtenerReporteRepartidores();
  }, [tipoFecha, fechaDesde, fechaHasta]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    obtenerReporteRepartidores();
  }, []);

  const onDateChange = (event, selectedDate, isFromDate) => {
    if (event.type === 'set' && selectedDate) {
      if (isFromDate) {
        setFechaDesde(selectedDate);
        setShowFromPicker(false);
      } else {
        setFechaHasta(selectedDate);
        setShowToPicker(false);
      }
    } else {
      setShowFromPicker(false);
      setShowToPicker(false);
    }
  };

  const renderHeader = () => (
    <Layout style={styles.headerContainer}>
      <Text category="h4" style={styles.headerTitle}>Reportes</Text>
      <Text appearance="hint" style={styles.headerSubtitle}>Obtén un resumen visual de tus datos</Text>
    </Layout>
  );

  const formatDate = (date) => {
    if (!date) return 'Seleccionar fecha';
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderResumenCard = (title, value, icon) => (
    <Card style={styles.resumenCard}>
      <Layout style={styles.resumenContent}>
        <Icon name={icon} style={styles.resumenIcon} fill="#0086FF"/>
        <Layout style={styles.resumenTexts}>
          <Text category="s2" appearance="hint">{title}</Text>
          <Text category="h6">{value}</Text>
        </Layout>
      </Layout>
    </Card>
  );

  const renderDatePicker = (showPicker, currentDate, onChange, minDate) => {
    if (!showPicker) return null;
    return (
      <DateTimePicker
        testID="dateTimePicker"
        value={currentDate || new Date()}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={onChange}
        minimumDate={minDate}
        maximumDate={new Date()}
      />
    );
  };

  const onChangeFromDate = (event, selectedDate) => {
    setShowFromPicker(false);
    if (event.type === 'set' && selectedDate) setFechaDesde(selectedDate);
  };

  const onChangeToDate = (event, selectedDate) => {
    setShowToPicker(false);
    if (event.type === 'set' && selectedDate) setFechaHasta(selectedDate);
  };

  const showDatePicker = (isFrom) => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: isFrom ? (fechaDesde || new Date()) : (fechaHasta || new Date()),
        mode: 'date',
        onChange: (event, date) => onDateChange(event, date, isFrom),
        maximumDate: new Date(),
        minimumDate: isFrom ? null : fechaDesde,
      });
    } else {
      isFrom ? setShowFromPicker(true) : setShowToPicker(true);
    }
  };

  if (loading && !refreshing) {
    return (
      <Layout style={styles.loadingContainer}>
        <Spinner size="large"/>
        <Text category="s1" style={styles.loadingText}>Cargando reportes...</Text>
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      {renderHeader()}
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Card style={styles.filterCard}>
          <Layout style={styles.selectContainer}>
            <Text category="label" style={styles.selectLabel}>Filtrar por fecha</Text>
            <ButtonGroup style={styles.buttonGroup}>
              <Button
                size='small'
                appearance={tipoFecha === 'hoy' ? 'filled' : 'outline'}
                onPress={() => setTipoFecha('hoy')}
              >
                Todos
              </Button>
              <Button
                size='small'
                appearance={tipoFecha === 'personalizado' ? 'filled' : 'outline'}
                onPress={() => setTipoFecha('personalizado')}
              >
                Personalizado
              </Button>
            </ButtonGroup>
            {tipoFecha === 'personalizado' && (
              <Layout style={styles.datePickersContainer}>
                <Layout style={styles.datePickerColumn}>
                  <Text category="label">Desde</Text>
                  <DatePickerButton
                    label="Desde"
                    date={fechaDesde}
                    onPress={() => showDatePicker(true)}
                  />
                </Layout>
                <Layout style={styles.datePickerColumn}>
                  <Text category="label">Hasta</Text>
                  <DatePickerButton
                    label="Hasta"
                    date={fechaHasta}
                    onPress={() => showDatePicker(false)}
                  />
                </Layout>
              </Layout>
            )}
            {Platform.OS === 'android' ? (
              <>
                {showFromPicker && renderDatePicker(true, fechaDesde, onChangeFromDate)}
                {showToPicker && renderDatePicker(true, fechaHasta, onChangeToDate, fechaDesde)}
              </>
            ) : (
              <>
                {renderDatePicker(showFromPicker, fechaDesde, onChangeFromDate)}
                {renderDatePicker(showToPicker, fechaHasta, onChangeToDate, fechaDesde)}
              </>
            )}
          </Layout>
        </Card>
        <Divider style={styles.divider}/>
        <Layout style={styles.resumenContainer}>
          {renderResumenCard('Total Pedidos', reporte.length, 'shopping-cart-outline')}
          {renderResumenCard('Entregados', 
            reporte.reduce((acc, r) => acc + parseInt(r.entregados || 0), 0),
            'checkmark-circle-2-outline'
          )}
          {renderResumenCard('En Proceso',
            reporte.reduce((acc, r) => acc + parseInt(r.en_proceso || 0), 0),
            'clock-outline'
          )}
        </Layout>
        <Layout style={styles.listContainer}>
          {reporte.map((r, index) => (
            <Card key={index} style={styles.rowCard}>
              <Text style={styles.rowItem}><Text style={styles.rowLabel}>Repartidor:</Text> {r.nombre_repartidor || "Sin asignar"}</Text>
              <Text style={styles.rowItem}><Text style={styles.rowLabel}>Pedidos:</Text> {r.total_pedidos || "0"}</Text>
              <Text style={[styles.rowItem, styles.clickable]} onPress={() => { /* handle Entregado click */ }}>
                <Text style={styles.rowLabel}>Entregados:</Text> {r.entregados || "0"}
              </Text>
              <Text style={[styles.rowItem, styles.clickable]} onPress={() => { /* handle Devuelto click */ }}>
                <Text style={styles.rowLabel}>Devuelto:</Text> {r.devueltos || "0"}
              </Text>
              <Text style={[styles.rowItem, styles.clickable]} onPress={() => { /* handle En Proceso click */ }}>
                <Text style={styles.rowLabel}>En Proceso:</Text> {r.en_proceso || "0"}
              </Text>
              <Text style={styles.rowItem}>
                <Text style={styles.rowLabel}>En Espera:</Text> {r.en_espera || "0"}
              </Text>
              <Text style={styles.rowItem}>
                <Text style={styles.rowLabel}>Pago Digital:</Text> {r.pago_digital || "0"}
              </Text>
              <Text style={styles.rowItem}>
                <Text style={styles.rowLabel}>Contra Reembolso:</Text> {r.contra_entrega || "0"}
              </Text>
              <Text style={styles.rowItem}>
                <Text style={styles.rowLabel}>Total Recaudo:</Text> {r.total_pagos || "0"}
              </Text>
              <Text style={styles.rowItem}>
                <Text style={styles.rowLabel}>Costo Envio:</Text> {r.costo_envio || "0"}
              </Text>
              <Text style={styles.rowItem}>
                <Text style={styles.rowLabel}>FEE:</Text> {r.fee99 || "0"}
              </Text>
              <Text style={styles.rowItem}>
                <Text style={styles.rowLabel}>Total:</Text> {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(r.total || 0)}
              </Text>
            </Card>
          ))}
          <Card style={styles.totalCard}>
            <Text style={styles.totalText}>Total de Pedidos: {reporte.reduce((acc, r) => acc + (parseInt(r.total_pedidos || 0)), 0)}</Text>
          </Card>
        </Layout>
      </ScrollView>
      <Modal
        visible={isModalVisible}
        backdropStyle={styles.modalBackdrop}
        onBackdropPress={() => setIsModalVisible(false)}>
        {/* Modal content will go here */}
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  headerContainer: {
    backgroundColor: '#0086FF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#E0F0FF',
    fontSize: 14,
  },
  filterCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  selectContainer: {
    backgroundColor: 'transparent',
  },
  selectLabel: {
    marginBottom: 8,
    color: '#2E3A59',
  },
  buttonGroup: {
    borderRadius: 8,
    marginBottom: 12,
  },
  datePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  datePickerColumn: {
    flex: 1,
  },
  datePickerButton: {
    justifyContent: 'flex-start',
    borderColor: '#E4E9F2',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  divider: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  resumenContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  resumenCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  resumenContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  resumenIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  resumenTexts: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#8F9BB3',
  },
  listContainer: {
    padding: 16,
  },
  rowCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  rowItem: {
    fontSize: 16,
    color: '#2E3A59',
    marginVertical: 2,
  },
  rowLabel: {
    fontWeight: 'bold',
    color: '#0086FF',
  },
  clickable: {
    color: '#0086FF',
    textDecorationLine: 'underline',
  },
  totalCard: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f2f2f2',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3A59',
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default ReportesScreen;
