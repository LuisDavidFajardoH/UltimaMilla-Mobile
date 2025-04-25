import React from 'react';
import { StyleSheet, Image, Dimensions } from 'react-native';
import { Card, Text, Layout, Button } from '@ui-kitten/components';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export const ProductCard = ({ producto }) => {
  const mainImage = producto.imagenes?.[0]?.url_imagen || null;
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(parseFloat(price));
  };

  return (
    <Card style={styles.card}>
      {mainImage && (
        <Image
          source={{ uri: mainImage }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <Layout style={styles.content}>
        <Text category='s1' numberOfLines={2} style={styles.nombre}>
          {producto.nombre_producto}
        </Text>
        <Text category='label' style={styles.sku}>
          SKU: {producto.sku}
        </Text>
        <Layout style={styles.priceContainer}>
          <Text category='h6' style={styles.precio}>
            {formatPrice(producto.precio_sugerido)}
          </Text>
          <Text category='c1' style={[styles.stock, 
            producto.cantidad_disponible <= 0 ? styles.stockEmpty : null]}>
            Stock: {producto.cantidad_disponible}
          </Text>
        </Layout>
        {producto.descripcion_producto && (
          <Text category='c1' style={styles.descripcion} numberOfLines={2}>
            {producto.descripcion_producto}
          </Text>
        )}
      </Layout>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    margin: 8,
    borderRadius: 12,
  },
  image: {
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  content: {
    backgroundColor: 'transparent',
  },
  nombre: {
    marginBottom: 4,
    fontWeight: '600',
  },
  sku: {
    color: '#8F9BB3',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  precio: {
    color: '#0086FF',
  },
  stock: {
    color: '#8F9BB3',
  },
  categoria: {
    color: '#8F9BB3',
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  stockEmpty: {
    color: '#FF3D71',
  },
  descripcion: {
    color: '#8F9BB3',
    fontSize: 12,
    marginTop: 4,
  },
});
