import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, View } from 'react-native';
import { Layout, Text, Card, Button, Spinner, Icon, TopNavigation, TopNavigationAction, Datepicker } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';
import CustomDatePicker from '../../components/DatePicker/CustomDatePicker';

const StatCard = ({ title, value, status, iconName, subvalue }) => (
  <Card style={[styles.statCard, { borderLeftColor: status, borderLeftWidth: 4 }]}>
    <Layout style={styles.statCardContent}>
      <Layout style={[styles.statIconContainer, { backgroundColor: `${status}15` }]}>
        <Icon
          style={[styles.statIcon, { tintColor: status }]}
          name={iconName}
          pack='eva'
        />
      </Layout>
      <Layout style={styles.statTextContainer}>
        <Text category='h5' style={styles.statValue}>{value}</Text>
        {subvalue && (
          <Layout style={[styles.statBadge, { backgroundColor: `${status}15` }]}>
            <Text style={[styles.statSubValue, { color: status }]}>{subvalue}</Text>
          </Layout>
        )}
        <Text category='s1' style={styles.statTitle}>{title}</Text>
      </Layout>
    </Layout>
  </Card>
);

const DetailItem = ({ label, value, status }) => (
  <Layout style={styles.detailItem}>
    <Layout style={styles.detailLabelContainer}>
      <View style={[styles.statusDot, { backgroundColor: status }]} />
      <Text style={styles.detailLabel}>{label}</Text>
    </Layout>
    <Text style={styles.detailValue}>{value}</Text>
  </Layout>
);

const DetailCard = ({ title, icon, children, style }) => (
  <Card style={[styles.detailCard, style]}>
    <Layout style={styles.detailCardHeader}>
      <Layout style={styles.detailTitleContainer}>
        <Icon name={icon} style={styles.detailIcon} fill="#0086FF"/>
        <Text category='h6' style={styles.detailTitle}>{title}</Text>
      </Layout>
    </Layout>
    <Layout style={styles.detailContent}>
      {children}
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
    <Card style={styles.datePickerCard}>
      <Text category='h6' style={styles.datePickerTitle}>Rango de Fechas</Text>
      <Layout style={styles.datePickerContainer}>
        <Layout style={styles.datePickerColumn}>
          <CustomDatePicker
            date={startDate}
            onSelect={(nextDate) => {
              setStartDate(nextDate);
              if (nextDate > endDate) {
                setEndDate(nextDate);
              }
            }}
            max={new Date()}
            label='Desde'
            style={styles.datePicker}
          />
        </Layout>
        <Layout style={styles.datePickerColumn}>
          <CustomDatePicker
            date={endDate}
            onSelect={(nextDate) => {
              setEndDate(nextDate);
              if (nextDate < startDate) {
                setStartDate(nextDate);
              }
            }}
            min={startDate}
            max={new Date()}
            label='Hasta'
            style={styles.datePicker}
          />
        </Layout>
      </Layout>
      <Button
        onPress={fetchDashboardData}
        style={styles.updateButton}
        status='primary'
        accessoryLeft={(props) => <Icon {...props} name='refresh-outline'/>}
      >
        Actualizar Datos
      </Button>
    </Card>
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
          <DetailCard title="Estado de Envíos" icon="pie-chart-2">
            {Object.entries(data?.estadisticas_pedidos || {})
              .filter(([key]) => key !== 'total')
              .map(([estado, cantidad], index) => (
                <DetailItem
                  key={index}
                  label={estado}
                  value={cantidad}
                  status={
                    estado === 'Entregado' ? '#00E096' :
                    estado === 'Devuelto' ? '#FF3D71' :
                    estado === 'En proceso' ? '#0095FF' : '#8F9BB3'
                  }
                />
              ))}
          </DetailCard>

          <DetailCard title="Destinos Más Usados" icon="pin">
            {(showMoreDestinations ? data?.destinos_comunes : data?.destinos_comunes?.slice(0, 5))?.map((destino, index) => (
              <DetailItem
                key={index}
                label={destino.ciudad}
                value={destino.cantidad}
                status="#639aff"
              />
            ))}
            {data?.destinos_comunes?.length > 5 && (
              <Button
                appearance='ghost'
                status='primary'
                style={styles.verMasButton}
                onPress={() => setShowMoreDestinations(!showMoreDestinations)}
              >
                {showMoreDestinations ? 'Ver menos' : 'Ver más'}
              </Button>
            )}
          </DetailCard>

          <DetailCard title="Pedidos No Asignados" icon="alert-triangle">
            {data?.registros_No_Asignados?.registros?.map((registro, index) => (
              <DetailItem
                key={index}
                label={`Pedido #${registro.ID_pedido}`}
                value={registro.fecha_pedido}
                status="#FF3D71"
              />
            ))}
          </DetailCard>
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
  statsContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  statCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 8,
  },
  statIconContainer: {
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  statIcon: {
    width: 28,
    height: 28,
  },
  statTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E3A59',
    marginBottom: 4,
  },
  statBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  statSubValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statTitle: {
    color: '#8F9BB3',
  },
  datePickerCard: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  datePickerTitle: {
    marginBottom: 16,
    color: '#2E3A59',
    fontWeight: '600',
  },
  datePickerContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  datePickerColumn: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  detailCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F2',
    backgroundColor: 'transparent',
  },
  detailTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  detailTitle: {
    marginLeft: 8,
    color: '#2E3A59',
    fontWeight: '600',
  },
  detailIcon: {
    width: 24,
    height: 24,
  },
  detailContent: {
    backgroundColor: 'transparent',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#F7F9FC',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  detailLabel: {
    color: '#2E3A59',
    fontSize: 15,
    flex: 1,
  },
  detailValue: {
    color: '#8F9BB3',
    fontSize: 15,
    fontWeight: '600',
  },
  verMasButton: {
    marginTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F2',
    backgroundColor: 'transparent',
  },
  updateButton: {
    borderRadius: 12,
    backgroundColor: '#0086FF',
  },
  detailCardsContainer: {
    padding: 16,
    backgroundColor: 'transparent',
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
  datePicker: {
    marginBottom: 0,
  },
});

export default TableroSucursalScreen;
