import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, View } from 'react-native';
import { Layout, Text, Card, Button, Spinner, Icon, TopNavigation, TopNavigationAction, Toggle } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';

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
      {value !== undefined && <Text category='h6' style={styles.statValue}>{value}</Text>}
      {subvalue && <Text category='s2' style={styles.statSubValue}>{subvalue}</Text>}
      <Text category='s1' style={styles.statTitle}>{title}</Text>
      <Button
        size='small'
        appearance='ghost'
        status='basic'
        style={styles.detailsButton}
      >
        Ver detalles
      </Button>
    </Layout>
  </Card>
);

const EarningCard = ({ value }) => (
  <Card style={styles.earningCard}>
    <Layout style={styles.earningCardContent}>
      <Layout style={styles.earningTitleContainer}>
        <Icon
          style={[styles.earningIcon]}
          name="credit-card-outline"
          pack='eva'
          fill="#00E096"
        />
        <Text category='s1' style={styles.earningTitle}>Ganancias de hoy</Text>
      </Layout>
      <Text category='h6' style={styles.earningValue}>${value}</Text>
    </Layout>
  </Card>
);

const StatusSwitch = ({ isActive, onToggle }) => (
  <Card style={styles.statusCard}>
    <Layout style={styles.statusCardContent}>
      <Text category='s1' style={styles.statusTitle}>Tablero de control</Text>
      <Layout style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: isActive ? '#00E096' : '#FF3D71' }]}>
          {isActive ? 'Disponible' : 'No disponible'}
        </Text>
        <Toggle
          checked={isActive}
          onChange={onToggle}
          status={isActive ? 'success' : 'danger'}
        />
      </Layout>
    </Layout>
  </Card>
);

export const TableroConductorScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const userData = await authService.getUserData();
      if (!userData?.id) throw new Error('No user data found');

      const response = await fetch(
        `https://api.99envios.app/api/panel-conductores/${userData.id}/pedidos`,
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
    if (!data?.estados_pedido) return { totals: {}, earnings: 0 };

    const stats = data.estados_pedido;
    const totals = {
      enEspera: parseInt(stats.En_Espera || 0),
      porEntregar: parseInt(stats.En_proceso || 0),
      entregasFallidas: parseInt(stats.Devuelto || 0),
      entregados: parseInt(stats.Entregado || 0),
    };

    return { 
      totals,
      earnings: stats.Ganancias_dia || 0
    };
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

  const { totals, earnings } = calculateStats();

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
        title='Tablero Conductor'
        alignment='center'
        accessoryLeft={renderBackAction}
      />

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <StatusSwitch 
          isActive={isActive}
          onToggle={nextValue => setIsActive(nextValue)}
        />
        <EarningCard value={earnings} />
        <Layout style={styles.statsContainer}>
          <StatCard
            title="En Espera"
            value={totals.enEspera}
            iconName="clock-outline"
            status="#FFA94D"
          />
          <StatCard
            title="Por Entregar"
            value={totals.porEntregar}
            iconName="car-outline"
            status="#0095FF"
          />
          <StatCard
            title="Entregas Fallidas"
            value={totals.entregasFallidas}
            iconName="alert-triangle-outline"
            status="#FF3D71"
          />
          <StatCard
            title="Entregados"
            value={totals.entregados}
            iconName="checkmark-circle-2-outline"
            status="#00E096"
          />
          <StatCard
            title="No Asignados"
            iconName="person-remove-outline"
            status="#8F9BB3"
          />
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
    minHeight: 140,
  },
  statCardContent: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingBottom: 4,
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
  detailsButton: {
    marginTop: 8,
    fontSize: 12,
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    backgroundColor: 'transparent',
  },
  earningCard: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  earningCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  earningTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  earningIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  earningTitle: {
    color: '#2E3A59',
  },
  earningValue: {
    color: '#00E096',
    fontWeight: 'bold',
  },
  statusCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  statusCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: 8,
  },
  statusTitle: {
    color: '#2E3A59',
  },
  statusText: {
    marginRight: 8,
  },
});

export default TableroConductorScreen;
