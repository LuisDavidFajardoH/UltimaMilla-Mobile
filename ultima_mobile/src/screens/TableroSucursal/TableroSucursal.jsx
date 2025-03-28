import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, View } from 'react-native';
import { Layout, Text, Card, Button, Spinner, Icon, TopNavigation, TopNavigationAction, Datepicker } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import CustomDatePicker from '../../components/DatePicker/CustomDatePicker';

const StatCard = ({ title, value, status, iconName, subvalue }) => (
  <Card style={styles.statCard}>
    <Layout style={styles.statCardContent}>
      <Layout style={[styles.statIconContainer, { backgroundColor: `${status}10` }]}>
        <Icon
          style={[styles.statIcon, { tintColor: status }]}
          name={iconName}
          pack='eva'
        />
      </Layout>
      <Text category='h6' style={styles.statValue}>{value}</Text>
      {subvalue && <Text category='s2' style={styles.statSubValue}>{subvalue}</Text>}
      <Text category='s1' style={styles.statTitle}>{title}</Text>
    </Layout>
  </Card>
);

export const TableroSucursalScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [showMoreDestinations, setShowMoreDestinations] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const userData = await authService.getUserData();
      if (!userData?.id) throw new Error('No user data found');

      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const response = await fetch(
        `https://api.99envios.app/api/panel-sucursales/${userData.id}/${formattedStartDate}/${formattedEndDate}`,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Network response was not ok');
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const calculateStats = () => {
    if (!data?.estadisticas_pedidos) return { totals: {}, percentages: {} };

    const stats = data.estadisticas_pedidos;
    const totals = {
      total: stats.total || 0,
      entregados: stats.Entregado || 0,
      devueltos: stats.Devuelto || 0,
      enProceso: stats['En proceso'] || 0
    };

    const percentages = {
      entrega: totals.total ? ((totals.entregados / totals.total) * 100).toFixed(2) : 0,
      devolucion: totals.total ? ((totals.devueltos / totals.total) * 100).toFixed(2) : 0
    };

    return { totals, percentages };
  };

  const BackIcon = (props) => (
    <Icon {...props} name='arrow-back'/>
  );

  const renderBackAction = () => (
    <TopNavigationAction 
      icon={BackIcon} 
      onPress={() => navigation.goBack()}
    />
  );

  const renderCustomCalendarHeader = (date) => (
    <Text category='s1'>{date.toLocaleDateString()}</Text>
  );

  const renderDatePicker = () => (
    <Layout style={styles.datePickerContainer}>
      <CustomDatePicker
        date={startDate}
        onSelect={setStartDate}
        max={endDate}
        label='Fecha Inicio'
        style={styles.datePickerMargin}
      />
      <CustomDatePicker
        date={endDate}
        onSelect={setEndDate}
        min={startDate}
        max={new Date()}
        label='Fecha Fin'
        style={styles.datePickerMargin}
      />
      <Button
        onPress={fetchDashboardData}
        style={styles.updateButton}
      >
        Actualizar Datos
      </Button>
    </Layout>
  );

  const { totals, percentages } = calculateStats();

  if (loading && !refreshing) {
    return (
      <Layout style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Spinner size='large'/>
        <Text category='s1' style={styles.loadingText}>Cargando datos...</Text>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Icon name='alert-circle-outline' style={styles.errorIcon} fill='#FF3D71'/>
        <Text category='s1' style={styles.errorText}>Error: {error}</Text>
        <Button onPress={fetchDashboardData}>Reintentar</Button>
      </Layout>
    );
  }

  return (
    <Layout style={[styles.container, { paddingTop: insets.top }]}>
      <TopNavigation
        title='Tablero de Control'
        alignment='center'
        accessoryLeft={renderBackAction}
      />

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderDatePicker()}

        <Layout style={styles.statsContainer}>
          <StatCard
            title="Total Envíos"
            value={totals.total}
            iconName="car-outline"
            status="#0095FF"
          />
          <StatCard
            title="Entregados"
            value={totals.entregados}
            subvalue={`${percentages.entrega}%`}
            iconName="checkmark-circle-2-outline"
            status="#00E096"
          />
          <StatCard
            title="Devoluciones"
            value={totals.devueltos}
            subvalue={`${percentages.devolucion}%`}
            iconName="alert-triangle-outline"
            status="#FF3D71"
          />
        </Layout>

        <Layout style={styles.detailCardsContainer}>
          <Card style={styles.detailCard}>
            <Text category='h6'>Estado de Envíos</Text>
            {Object.entries(data?.estadisticas_pedidos || {})
              .filter(([key]) => key !== 'total')
              .map(([estado, cantidad], index) => (
                <Layout key={index} style={styles.statRow}>
                  <Text>{estado}</Text>
                  <Text>{cantidad}</Text>
                </Layout>
              ))
            }
          </Card>

          <Card style={styles.detailCard}>
            <Text category='h6'>Destinos Más Usados</Text>
            {(showMoreDestinations ? data?.destinos_comunes : data?.destinos_comunes?.slice(0, 5))?.map((destino, index) => (
              <Layout key={index} style={styles.statRow}>
                <Text>{destino.ciudad}</Text>
                <Text>{destino.cantidad}</Text>
              </Layout>
            ))}
            {data?.destinos_comunes?.length > 5 && (
              <Button
                appearance='ghost'
                onPress={() => setShowMoreDestinations(!showMoreDestinations)}
              >
                {showMoreDestinations ? 'Ver menos' : 'Ver más'}
              </Button>
            )}
          </Card>

          <Card style={styles.detailCard}>
            <Text category='h6'>Pedidos No Asignados</Text>
            {data?.registros_No_Asignados?.registros?.map((registro, index) => (
              <Layout key={index} style={styles.statRow}>
                <Text>Pedido #{registro.ID_pedido}</Text>
                <Text>{registro.fecha_pedido}</Text>
              </Layout>
            ))}
          </Card>
        </Layout>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    backgroundColor: 'transparent',
  },
  statCard: {
    width: '45%',
    margin: '2.5%',
    borderRadius: 12,
  },
  statCardContent: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statIconContainer: {
    padding: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 149, 255, 0.1)',
    marginBottom: 8,
  },
  statIcon: {
    width: 24,
    height: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubValue: {
    fontSize: 14,
    color: '#8F9BB3',
  },
  statTitle: {
    color: '#8F9BB3',
    textAlign: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#FF3D71',
  },
  datePickerContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  datePicker: {
    marginBottom: 8,
  },
  updateButton: {
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    backgroundColor: 'transparent',
  },
  detailCardsContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  detailCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F2',
    backgroundColor: 'transparent',
  },
  datePickerWrapper: {
    backgroundColor: 'transparent',
  },
  dateLabel: {
    marginBottom: 4,
    color: '#2E3A59',
  },
  datePickerMargin: {
    marginBottom: 16,
  },
});

export default TableroSucursalScreen;
