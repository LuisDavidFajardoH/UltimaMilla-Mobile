import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, View } from 'react-native';
import { Layout, Text, Card, Button, ButtonGroup, Modal, Icon, Divider } from '@ui-kitten/components';
import axios from 'axios';
import Navbar from '../../components/Navbar'; // ...existing import...
import BotonWhatsapp from '../../newInterface/botonWhatsapp/botonWhatsapp';

const ReporteRepartidores = () => {
  // ...existing state declarations...
  const [reporte, setReporte] = useState([]);
  const [tipoFecha, setTipoFecha] = useState("hoy");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [detallePedido, setDetallePedido] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    obtenerReporteRepartidores();
  }, [tipoFecha, fechaDesde, fechaHasta]);

  const obtenerReporteRepartidores = async () => {
    try {
      // En ambiente web se usaba localStorage; para demo se fija el id
      const id_usuario = "localUserId"; 
      const response = await axios.get(`https://api.99envios.app/api/reporte-repartidores/${id_usuario}`, {
        params: {
          tipo_fecha: tipoFecha,
          fecha_desde: tipoFecha === "personalizado" ? fechaDesde : null,
          fecha_hasta: tipoFecha === "personalizado" ? fechaHasta : null,
        },
      });
      setReporte(response.data);
    } catch (error) {
      console.error("Error al obtener el reporte de repartidores:", error);
    }
  };

  const filteredReporte = tipoFecha === "personalizado"
    ? reporte.filter(item => item.fecha_pedido >= fechaDesde && item.fecha_pedido <= fechaHasta)
    : reporte;

  const totalPedidos = filteredReporte.reduce((acc, r) => acc + (r.total_pedidos ? parseInt(r.total_pedidos) : 0), 0);

  const handleCellClick = (idRepartidor, estadoPedido) => {
    obtenerDetallePedido(idRepartidor, estadoPedido);
  };

  const obtenerDetallePedido = async (repartidorId, estadoPedido) => {
    try {
      const url = `https://api.99envios.app/api/filtrar-pedidos/${repartidorId}/${estadoPedido}`;
      const response = await axios.get(url);
      setDetallePedido(response.data);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error al obtener el detalle del pedido:", error);
      setIsModalVisible(false);
    }
  };

  const renderModalContent = () => {
    if (!detallePedido) return (
      <View style={styles.modalContent}>
        <Text style={styles.modalText}>Cargando...</Text>
      </View>
    );
    return (
      <View style={styles.modalContent}>
        <Text category="h6" style={styles.modalHeader}>Pedidos Filtrados</Text>
        <ScrollView horizontal>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Cliente</Text>
              <Text style={styles.tableCell}>Fecha</Text>
              <Text style={styles.tableCell}>Estado</Text>
              <Text style={styles.tableCell}>Total</Text>
            </View>
            {detallePedido.map((pedido, index) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlternate]}>
                <Text style={styles.tableCell}>{pedido.nombre_cliente}</Text>
                <Text style={styles.tableCell}>{pedido.fecha_pedido}</Text>
                <Text style={styles.tableCell}>{pedido.estado_pedido}</Text>
                <Text style={styles.tableCell}>{pedido.total}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <Layout style={styles.container}>
      <Navbar title="Reporte Repartidores" />
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={obtenerReporteRepartidores} />}
      >
        <View style={styles.header}>
          <Text category="h5">Reporte de Repartidores</Text>
        </View>

        <View style={styles.filters}>
          {/* Aquí podrías incluir controles para seleccionar tipoFecha, fechas y mostrar total */}
          <View style={styles.filterRow}>
            <ButtonGroup appearance="outline" style={styles.buttonGroup}>
              <Button
                size="small"
                appearance={tipoFecha === "hoy" ? "filled" : "outline"}
                onPress={() => setTipoFecha("hoy")}
              >
                Todos
              </Button>
              <Button
                size="small"
                appearance={tipoFecha === "personalizado" ? "filled" : "outline"}
                onPress={() => setTipoFecha("personalizado")}
              >
                Personalizado
              </Button>
            </ButtonGroup>
          </View>
          <View style={styles.filterRow}>
            {tipoFecha === "personalizado" && (
              <>
                <Text category="s2">Desde: {fechaDesde || "..."}</Text>
                <Text category="s2">Hasta: {fechaHasta || "..."}</Text>
              </>
            )}
          </View>
          <View style={styles.filterRow}>
            <Text category="s1">Total Pedidos: {totalPedidos}</Text>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <ScrollView horizontal>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>Repartidor</Text>
                <Text style={styles.tableCell}>Pedidos</Text>
                <Text style={styles.tableCell}>Entregados</Text>
                <Text style={styles.tableCell}>Devuelto</Text>
                <Text style={styles.tableCell}>En Proceso</Text>
                <Text style={styles.tableCell}>En Espera</Text>
                <Text style={styles.tableCell}>Pago Digital</Text>
                <Text style={styles.tableCell}>Contra Reembolso</Text>
                <Text style={styles.tableCell}>Total Recaudo</Text>
                <Text style={styles.tableCell}>Costo Envio</Text>
                <Text style={styles.tableCell}>FEE</Text>
                <Text style={styles.tableCell}>Total</Text>
              </View>
              {filteredReporte.map((r, index) => (
                <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlternate]}>
                  <Text style={styles.tableCell}>{r.nombre_repartidor || "Sin asignar"}</Text>
                  <Text style={styles.tableCell}>{r.total_pedidos || "0"}</Text>
                  <Text style={[styles.tableCell, styles.clickable]} onPress={() => handleCellClick(r.id_repartidor, "Entregado")}>
                    {r.entregados || "0"}
                  </Text>
                  <Text style={[styles.tableCell, styles.clickable]} onPress={() => handleCellClick(r.id_repartidor, "Devuelto")}>
                    {r.devueltos || "0"}
                  </Text>
                  <Text style={[styles.tableCell, styles.clickable]} onPress={() => handleCellClick(r.id_repartidor, "En proceso")}>
                    {r.en_proceso || "0"}
                  </Text>
                  <Text style={styles.tableCell}>{r.en_espera || "0"}</Text>
                  <Text style={styles.tableCell}>{r.pago_digital || "0"}</Text>
                  <Text style={styles.tableCell}>{r.contra_entrega || "0"}</Text>
                  <Text style={styles.tableCell}>{r.total_pagos || "0"}</Text>
                  <Text style={styles.tableCell}>{r.costo_envio || "0"}</Text>
                  <Text style={styles.tableCell}>{r.fee99 || "0"}</Text>
                  <Text style={styles.tableCell}>
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(r.total || 0)}
                  </Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalText}>Total de Pedidos: {totalPedidos}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
      <Modal
        visible={isModalVisible}
        backdropStyle={styles.modalBackdrop}
        onBackdropPress={() => setIsModalVisible(false)}>
        {renderModalContent()}
      </Modal>
      <BotonWhatsapp />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  scrollContainer: { flex: 1 },
  header: { padding: 16 },
  filters: { paddingHorizontal: 16, marginBottom: 16 },
  filterRow: { marginVertical: 4, flexDirection: 'row', justifyContent: 'space-between' },
  buttonGroup: { borderRadius: 8 },
  tableContainer: {
    padding: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    minWidth: 1500, // Asegura que la tabla tenga un ancho óptimo
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableCell: {
    width: 150, // Aumentado de 120 a 150 para mayor legibilidad
    padding: 8,
    textAlign: 'center',
    flexShrink: 0, // Evita que se reduzca el ancho de la celda
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableRowAlternate: {
    backgroundColor: '#f9f9f9',
  },
  clickable: {
    color: '#6C63FF',
    textDecorationLine: 'underline',
  },
  totalRow: {
    padding: 8,
  },
  totalText: {
    fontWeight: 'bold',
    textAlign: 'left',
    paddingLeft: 8,
  },
  modalBackdrop: { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: 24 },
  modalHeader: { marginBottom: 12, textAlign: 'center', fontWeight: 'bold' },
  modalText: { textAlign: 'center' },
});

export default ReporteRepartidores;
