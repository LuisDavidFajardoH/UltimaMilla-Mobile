import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Layout, Text, Divider } from '@ui-kitten/components';

export const ReportTable = ({ data, onRowPress }) => {
  const headers = [
    'Repartidor',
    'Pedidos',
    'Entregados',
    'En Proceso',
    'Total'
  ];

  return (
    <ScrollView horizontal>
      <Layout style={styles.container}>
        <Layout style={styles.headerRow}>
          {headers.map((header, index) => (
            <Text key={index} style={styles.headerCell}>{header}</Text>
          ))}
        </Layout>
        <Divider/>
        {data.map((row, index) => (
          <Layout
            key={index}
            style={[
              styles.row,
              index % 2 === 1 && styles.alternateRow
            ]}
          >
            <Text style={styles.cell}>{row.nombre_repartidor || 'Sin asignar'}</Text>
            <Text style={styles.cell}>{row.total_pedidos || '0'}</Text>
            <Text style={[styles.cell, styles.clickableCell]} onPress={() => onRowPress(row, 'Entregado')}>
              {row.entregados || '0'}
            </Text>
            <Text style={[styles.cell, styles.clickableCell]} onPress={() => onRowPress(row, 'En proceso')}>
              {row.en_proceso || '0'}
            </Text>
            <Text style={styles.cell}>
              {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(row.total || 0)}
            </Text>
          </Layout>
        ))}
      </Layout>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#0086FF',
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
  },
  alternateRow: {
    backgroundColor: '#f9f9f9',
  },
  headerCell: {
    width: 120,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  cell: {
    width: 120,
    color: '#2E3A59',
    textAlign: 'center',
  },
  clickableCell: {
    color: '#0086FF',
    textDecorationLine: 'underline',
  },
});

export default ReportTable;
