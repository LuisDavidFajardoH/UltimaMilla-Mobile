import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Layout, Text, Spinner, Input, Icon, Button } from '@ui-kitten/components';
import { ProductCard } from '../../components/Cards/ProductCard';
import { authService } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@inventario_data';
const CACHE_TIMESTAMP_KEY = '@inventario_timestamp';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes
const ITEMS_PER_PAGE = 10;

const InventarioScreen = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventario();
  }, []);

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadCachedData = async () => {
    try {
      console.log("Attempting to load cached inventory data");
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cachedData && timestamp) {
        const parsedData = JSON.parse(cachedData);
        const lastUpdateTime = new Date(parseInt(timestamp));
        
        console.log(`Found cached data from ${lastUpdateTime.toLocaleString()}`);
        
        // Check if data is valid and cache hasn't expired
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setLastUpdate(lastUpdateTime);
          setProductos(parsedData);
          setLoading(false);
          
          // If cache is fresh, use it
          if (new Date().getTime() - lastUpdateTime.getTime() < CACHE_DURATION) {
            console.log("Using cached data (still fresh)");
            return true;
          } else {
            console.log("Cached data expired, will refresh");
          }
        } else {
          console.log("Cached data exists but is empty or invalid");
        }
      } else {
        console.log("No cached data found");
      }
      return false;
    } catch (error) {
      console.error("Error loading cache:", error);
      return false;
    }
  };

  const fetchInventario = async (forceUpdate = false) => {
    setError(null);
    
    try {
      // Try to use cached data if not forcing update
      if (!forceUpdate) {
        const hasCachedData = await loadCachedData();
        if (hasCachedData) return;
      }

      console.log("Fetching fresh inventory data from API");
      setLoading(true);
      
      // Get user data for API authentication
      const userData = await authService.getUserData();
      
      if (!userData || !userData.token) {
        throw new Error("No authentication token available");
      }

      // Make API request
      const response = await fetch('https://api.99envios.app/api/inventarios', {
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log("API response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Parse response
      const responseText = await response.text();
      console.log("Raw API response:", responseText.slice(0, 100) + "..."); // Log first 100 chars
      
      // Try to parse as JSON
      let jsonData;
      try {
        jsonData = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON parse error:", e);
        throw new Error("Invalid JSON response from API");
      }
      
      // Process data
      console.log("Response data type:", typeof jsonData);
      
      // Ensure we have a valid array of products
      let productArray = [];
      
      if (Array.isArray(jsonData)) {
        productArray = jsonData;
      } else if (typeof jsonData === 'object' && jsonData !== null) {
        productArray = Object.values(jsonData);
      }
      
      console.log(`Successfully processed ${productArray.length} products`);
      
      // Cache the data
      if (productArray.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(productArray));
        await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().getTime().toString());
        setLastUpdate(new Date());
      }
      
      // Update state
      setProductos(productArray);
      
    } catch (error) {
      console.error("Inventory fetch error:", error);
      setError(error.message);
      
      // Keep any existing products
      if (productos.length === 0) {
        setProductos([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInventario(true); // Force update from API
  };

  const handleRetry = () => {
    setLoading(true);
    fetchInventario(true);
  };

  // Filter products based on search query
  const filteredProducts = React.useMemo(() => {
    if (!productos || !Array.isArray(productos)) return [];
    
    return productos.filter(producto => 
      producto && 
      ((producto.nombre_producto && producto.nombre_producto.toLowerCase().includes(searchQuery.toLowerCase())) ||
       (producto.sku && producto.sku.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [productos, searchQuery]);

  // Get paginated products
  const paginatedProducts = React.useMemo(() => {
    return filteredProducts.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const hasMoreProducts = filteredProducts.length > paginatedProducts.length;

  const loadMore = () => {
    if (hasMoreProducts) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const renderFooter = () => {
    if (!hasMoreProducts) return null;
    
    return (
      <Layout style={styles.footerLoader}>
        <Spinner size='small'/>
        <Text category='c1' style={styles.footerText}>Cargando más productos...</Text>
      </Layout>
    );
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <Layout style={styles.loadingContainer}>
        <Spinner size='large'/>
        <Text category='s1' style={styles.loadingText}>Cargando inventario...</Text>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout style={styles.errorContainer}>
        <Icon name='alert-circle-outline' fill='#FF3D71' style={styles.errorIcon} />
        <Text category='s1' status='danger' style={styles.errorText}>{error}</Text>
        <Button appearance='outline' status='primary' onPress={handleRetry}>
          Intentar nuevamente
        </Button>
      </Layout>
    );
  }

  // Empty state
  if (filteredProducts.length === 0) {
    return (
      <Layout style={styles.container}>
        <Layout style={styles.header}>
          <Layout style={styles.titleContainer}>
            <Text category='h5' style={styles.title}>Inventario</Text>
            {lastUpdate && (
              <Text category='c1' appearance='hint'>
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

        <Layout style={styles.emptyContainer}>
          <Icon name='archive-outline' fill='#8F9BB3' style={styles.emptyIcon} />
          <Text category='s1' appearance='hint' style={styles.emptyText}>
            {searchQuery ? 'No se encontraron productos que coincidan con tu búsqueda' : 'No hay productos en el inventario'}
          </Text>
          <Button appearance='outline' onPress={() => fetchInventario(true)}>
            Actualizar
          </Button>
        </Layout>
      </Layout>
    );
  }

  // Regular view with products
  return (
    <Layout style={styles.container}>
      <Layout style={styles.header}>
        <Layout style={styles.titleContainer}>
          <Text category='h5' style={styles.title}>Inventario</Text>
          {lastUpdate && (
            <Text category='c1' appearance='hint'>
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
        data={paginatedProducts}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <ProductCard producto={item} />
          </View>
        )}
        keyExtractor={(item, index) => `${item?.id_producto || item?.nombre_producto || 'product'}-${index}`}
        numColumns={2}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={styles.gridContainer}
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
  loadingText: {
    marginTop: 16,
    color: '#8F9BB3',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  gridContainer: {
    padding: 8,
    paddingBottom: 20,
  },
  productItem: {
    width: '50%',
    padding: 4,
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
