import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Layout, Text, Card, Button, Spinner, Icon, TopNavigation, TopNavigationAction, Toggle } from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../../services/authService';

const StatCard = ({ title, value, status, iconName, subvalue, onPress }) => (
  <Card style={styles.earningCard} onPress={onPress}>
    <Layout style={styles.earningCardContent}>
      <Layout style={styles.earningTitleContainer}>
        <Icon
          style={[styles.earningIcon, { tintColor: status }]}
          name={iconName}
          pack="eva"
        />
        <Text category="s1" style={[styles.earningTitle, { color: status }]}>
          {title}
        </Text>
      </Layout>
      {value !== undefined && (
        <Text category="h6" style={[styles.earningValue, { color: status }]}>
          {value}
        </Text>
      )}
      {subvalue && (
        <Text category="s2" style={styles.statSubValue}>
          {subvalue}
        </Text>
      )}
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

const BackIcon = (props) => (
  <Icon {...props} name="arrow-back" />
);

const renderBackAction = (navigation) => (
  <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
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
            onPress={() => navigation.navigate('EnEspera')}
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
            onPress={() => navigation.navigate('EntregaFallida')}
          />
          <StatCard
            title="Entregados"
            value={totals.entregados}
            iconName="checkmark-circle-2-outline"
            status="#00E096"
            onPress={() => navigation.navigate('Entregado')}
          />
          <StatCard
            title="No Asignados"
            iconName="person-remove-outline"
            status="#8F9BB3"
            onPress={() => navigation.navigate('NoAsignado')}
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
    width: '100%', // Ocupa el 100% del ancho para una sola columna
    marginBottom: 8, // Espaciado entre tarjetas
    borderRadius: 12,
    minHeight: 140,
  },
  statCardContent: {
    flexDirection: 'column', // Cambia a diseño en columna
    alignItems: 'flex-start', // Alinea los elementos al inicio
    backgroundColor: 'transparent',
    padding: 12, // Espaciado interno
  },
  statIconTitleContainer: {
    flexDirection: 'row', // Mantiene el ícono y el título en una fila
    alignItems: 'center',
    padding: 8, // Espaciado interno
    borderRadius: 16,
    backgroundColor: 'rgba(0, 149, 255, 0.1)',
    marginRight: 12, // Espaciado entre el contenedor del ícono/título y los demás elementos
  },
  statIcon: {
    width: 24,
    height: 24,
    marginRight: 8, // Espaciado entre el ícono y el título
  },
  statTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left', // Alinea el texto a la izquierda
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E3A59',
    marginLeft: 12, // Espaciado entre el valor y el contenedor del ícono/título
  },
  statSubValue: {
    fontSize: 14,
    color: '#8F9BB3',
    marginTop: 4, // Espaciado entre el subvalor y el valor principal
  },
  detailsButton: {
    alignSelf: 'flex-start', // Alinea el botón al inicio horizontalmente
    marginTop: 12, // Espaciado entre el botón y los demás elementos
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
    flexDirection: 'column', // Cambia a diseño en columna
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
