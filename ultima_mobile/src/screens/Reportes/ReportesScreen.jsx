import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { Layout, Text, Card, Button, ButtonGroup, Spinner, Modal, Icon, Divider } from '@ui-kitten/components';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import axios from 'axios';
import { authService } from '../../services/authService';
import CustomDatePicker from '../../components/DatePicker/CustomDatePicker';

const DatePickerButton = ({ label, date, onPress }) => (
  <TouchableOpacity 
    style={styles.datePickerTouchable}
    onPress={onPress}
  >
    <Layout style={styles.datePickerInner}>
      <Icon name="calendar-outline" style={styles.datePickerIcon} fill="#8F9BB3"/>
      <Text style={styles.datePickerText}>
        {date ? date.toLocaleDateString() : 'Seleccionar fecha'}
      </Text>
    </Layout>
  </TouchableOpacity>
);

const FilterHeader = ({ 
  tipoFecha, 
  setTipoFecha, 
  fechaDesde, 
  fechaHasta, 
  setFechaDesde,
  setFechaHasta
}) => (
  <Card style={styles.filterCard}>
    <Text category="s1" style={styles.filterTitle}>Periodo de Reporte</Text>
    <Layout style={styles.filterButtons}>
      <Button
        size='small'
        appearance={tipoFecha === 'hoy' ? 'filled' : 'outline'}
        onPress={() => setTipoFecha('hoy')}
        style={styles.filterButton}
      >
        Hoy
      </Button>
      <Button
        size='small'
        appearance={tipoFecha === 'semana' ? 'filled' : 'outline'}
        onPress={() => setTipoFecha('semana')}
        style={styles.filterButton}
      >
        Esta Semana
      </Button>
      <Button
        size='small'
        appearance={tipoFecha === 'mes' ? 'filled' : 'outline'}
        onPress={() => setTipoFecha('mes')}
        style={styles.filterButton}
      >
        Este Mes
      </Button>
      <Button
        size='small'
        appearance={tipoFecha === 'personalizado' ? 'filled' : 'outline'}
        onPress={() => setTipoFecha('personalizado')}
        style={styles.filterButton}
      >
        Personalizado
      </Button>
    </Layout>

    {tipoFecha === 'personalizado' && (
      <Layout style={styles.dateRangeContainer}>
        <Layout style={styles.datePickerColumn}>
          <CustomDatePicker
            date={fechaDesde}
            onSelect={(nextDate) => {
              setFechaDesde(nextDate);
              if (nextDate > fechaHasta) {
                setFechaHasta(nextDate);
              }
            }}
            max={new Date()}
            label='Desde'
            style={styles.datePicker}
          />
        </Layout>
        <Layout style={styles.datePickerColumn}>
          <CustomDatePicker
            date={fechaHasta}
            onSelect={(nextDate) => {
              setFechaHasta(nextDate);
              if (nextDate < fechaDesde) {
                setFechaDesde(nextDate);
              }
            }}
            min={fechaDesde}
            max={new Date()}
            label='Hasta'
            style={styles.datePicker}
          />
        </Layout>
      </Layout>
    )}
  </Card>
);

const ReportesScreen = ({ navigation }) => {
  const [reporte, setReporte] = useState([]);
  const [tipoFecha, setTipoFecha] = useState('hoy');
  // Initialize dates with current values
  const [fechaDesde, setFechaDesde] = useState(new Date());
  const [fechaHasta, setFechaHasta] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    // Set initial dates based on tipoFecha
    if (tipoFecha === 'hoy') {
      setFechaDesde(new Date());
      setFechaHasta(new Date());
    } else if (tipoFecha === 'semana') {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      setFechaDesde(weekAgo);
      setFechaHasta(today);
    } else if (tipoFecha === 'mes') {
      const today = new Date();
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      setFechaDesde(monthAgo);
      setFechaHasta(today);
    }
  }, [tipoFecha]);

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
    if (event.type === 'set' && selectedDate) {
      setFechaDesde(selectedDate);
      // After setting "desde", automatically show "hasta" picker
      setTimeout(() => {
        showDatePicker(false);
      }, 500);
    }
  };

  const onChangeToDate = (event, selectedDate) => {
    setShowToPicker(false);
    if (event.type === 'set' && selectedDate) {
      setFechaHasta(selectedDate);
    }
  };

  const showDatePicker = (isFrom) => {
    // Ensure only one picker is shown at a time
    if (isFrom) {
      setShowToPicker(false);
    } else {
      setShowFromPicker(false);
    }

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: isFrom ? (fechaDesde || new Date()) : (fechaHasta || new Date()),
        mode: 'date',
        onChange: (event, date) => {
          if (event.type === 'set' && date) {
            if (isFrom) {
              setFechaDesde(date);
              // After setting "desde", automatically show "hasta" picker
              setTimeout(() => {
                showDatePicker(false);
              }, 500);
            } else {
              setFechaHasta(date);
            }
          }
        },
        maximumDate: new Date(),
        minimumDate: isFrom ? null : fechaDesde,
        positiveButton: { label: 'Aceptar', textColor: 'blue' },
        negativeButton: { label: 'Cancelar', textColor: 'gray' }
      });
    } else {
      if (isFrom) {
        setShowFromPicker(true);
      } else {
        setShowToPicker(true);
      }
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
        <FilterHeader
          tipoFecha={tipoFecha}
          setTipoFecha={setTipoFecha}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          setFechaDesde={setFechaDesde}
          setFechaHasta={setFechaHasta}
        />
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
              <Layout style={styles.cardHeader}>
                <Text style={styles.repartidorName}>{r.nombre_repartidor || "Sin asignar"}</Text>
              </Layout>
              <Layout style={styles.statsGrid}>
                <Layout style={styles.statItem}>
                  <Text style={styles.statLabel}>Pedidos</Text>
                  <Text style={styles.statValue}>{r.total_pedidos || "0"}</Text>
                </Layout>
                <Layout style={styles.statItem}>
                  <Text style={styles.statLabel}>Entregados</Text>
                  <Text style={[styles.statValue, styles.clickableValue]} onPress={() => { /* handle Entregado click */ }}>
                    {r.entregados || "0"}
                  </Text>
                </Layout>
                <Layout style={styles.statItem}>
                  <Text style={styles.statLabel}>Devuelto</Text>
                  <Text style={[styles.statValue, styles.clickableValue]} onPress={() => { /* handle Devuelto click */ }}>
                    {r.devueltos || "0"}
                  </Text>
                </Layout>
                <Layout style={styles.statItem}>
                  <Text style={styles.statLabel}>En Proceso</Text>
                  <Text style={[styles.statValue, styles.clickableValue]} onPress={() => { /* handle En Proceso click */ }}>
                    {r.en_proceso || "0"}
                  </Text>
                </Layout>
                <Layout style={styles.statItem}>
                  <Text style={styles.statLabel}>En Espera</Text>
                  <Text style={styles.statValue}>{r.en_espera || "0"}</Text>
                </Layout>
                <Layout style={styles.statItem}>
                  <Text style={styles.statLabel}>Pago Digital</Text>
                  <Text style={styles.statValue}>{r.pago_digital || "0"}</Text>
                </Layout>
                <Layout style={styles.statItem}>
                  <Text style={styles.statLabel}>Contra Reembolso</Text>
                  <Text style={styles.statValue}>{r.contra_entrega || "0"}</Text>
                </Layout>
                <Layout style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Recaudo</Text>
                  <Text style={styles.statValue}>{r.total_pagos || "0"}</Text>
                </Layout>
                <Layout style={styles.statItem}>
                  <Text style={styles.statLabel}>Costo Envio</Text>
                  <Text style={styles.statValue}>{r.costo_envio || "0"}</Text>
                </Layout>
                <Layout style={styles.statItem}>
                  <Text style={styles.statLabel}>FEE</Text>
                  <Text style={styles.statValue}>{r.fee99 || "0"}</Text>
                </Layout>
                <Layout style={styles.statItem}>
                  <Text style={styles.statLabel}>Total</Text>
                  <Text style={styles.statValue}>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(r.total || 0)}</Text>
                </Layout>
              </Layout>
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
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterTitle: {
    color: '#2E3A59',
    fontWeight: '600',
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  filterButton: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 8,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  datePickerWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F7F9FC',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E4E9F2',
  },
  dateIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  dateText: {
    color: '#2E3A59',
    fontSize: 14,
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
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F2',
    backgroundColor: 'transparent',
  },
  repartidorName: {
    fontWeight: '600',
    color: '#2E3A59',
    fontSize: 16,
  },
  statsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: 'transparent',
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F7F9FC',
    padding: 12,
    borderRadius: 8,
  },
  statLabel: {
    color: '#8F9BB3',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#2E3A59',
    fontSize: 16,
    fontWeight: '600',
  },
  clickableValue: {
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
  datePickerColumn: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  datePicker: {
    marginBottom: 0,
  },
  datePickerTouchable: undefined,
  datePickerInner: undefined,
  datePickerIcon: undefined,
  datePickerText: undefined,
  pickerOverlay: undefined,
  pickerContainer: undefined,
  pickerButton: undefined,
});

export default ReportesScreen;
