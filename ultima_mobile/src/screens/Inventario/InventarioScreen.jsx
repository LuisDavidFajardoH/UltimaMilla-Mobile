import React, { useState, useEffect } from 'react';
import { StyleSheet, RefreshControl, FlatList } from 'react-native';
import { Layout, Text, Spinner, Input, Icon } from '@ui-kitten/components';
import { ProductCard } from '../../components/Cards/ProductCard';
import { authService } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@inventario_data';
const CACHE_TIMESTAMP_KEY = '@inventario_timestamp';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutos
const ITEMS_PER_PAGE = 10;

const InventarioScreen = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadCachedData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cachedData && timestamp) {
        const parsedData = JSON.parse(cachedData);
        const lastUpdateTime = new Date(parseInt(timestamp));
        setLastUpdate(lastUpdateTime);
        setProductos(parsedData);
        setLoading(false);

        // Si el caché es reciente, no recargamos
        if (new Date().getTime() - lastUpdateTime.getTime() < CACHE_DURATION) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error loading cache:', error);
      return false;
    }
  };

  const fetchInventario = async (forceUpdate = false) => {
    try {
      // Si no es forzado, intentamos usar caché
      if (!forceUpdate) {
        const hasCachedData = await loadCachedData();
        if (hasCachedData) return;
      }

      const userData = await authService.getUserData();
      const response = await fetch('https://api.99envios.app/api/inventarios', {
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar inventario');
      
      const data = await response.json();
      
      // Guardamos en caché
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().getTime().toString());
      
      setProductos(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventario();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInventario(true); // Forzar actualización
  };

  const paginatedProducts = React.useMemo(() => {
    const filtered = productos.filter(producto => 
      producto.nombre_producto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      producto.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return {
      data: filtered.slice(0, currentPage * ITEMS_PER_PAGE),
      hasMore: filtered.length > currentPage * ITEMS_PER_PAGE
    };
  }, [productos, searchQuery, currentPage]);

  const loadMore = () => {
    if (paginatedProducts.hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
      setIsLoadingMore(false);
    }
  };

  const renderFooter = () => {
    if (!paginatedProducts.hasMore) return null;
    
    return (
      <Layout style={styles.footerLoader}>
        <Spinner size='small'/>
        <Text category='c1' style={styles.footerText}>Cargando más productos...</Text>
      </Layout>
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading && !refreshing) {
    return (
      <Layout style={styles.loadingContainer}>
        <Spinner size='large'/>
        <Text category='s1'>Cargando inventario...</Text>
      </Layout>
    );
  }

  return (
    <Layout style={styles.container}>
      <Layout style={styles.header}>
        <Layout style={styles.titleContainer}>
          <Text category='h5' style={styles.title}>Inventario</Text>
          {lastUpdate && (
            <Text category='c1' appearance='hint' style={styles.lastUpdate}>
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </Text>
          )}
        </Layout>
        <Input
          placeholder='Buscar por nombre o SKU'
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessoryLeft={(props) => <Icon {...props} name='search-outline'/>}
          style={styles.searchInput}
        />
      </Layout>

      <FlatList
        data={paginatedProducts.data}
        renderItem={({ item }) => (
          <ProductCard producto={item} />
        )}
        keyExtractor={item => item.id_producto.toString()}
        numColumns={2}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  title: {
    color: '#2E3A59',
  },
  lastUpdate: {
    fontSize: 12,
  },
  searchInput: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    padding: 8,
  },
  row: {
    flex: 1,
    justifyContent: 'space-around',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  footerText: {
    marginLeft: 8,
    color: '#8F9BB3',
  },
});

export default InventarioScreen;
