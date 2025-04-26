import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Layout, Text, Icon, TopNavigation, TopNavigationAction, Button, Card, Divider } from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { FontAwesome5 } from '@expo/vector-icons';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
const CashIcon = (props) => <Icon {...props} name="credit-card-outline" />;
const DigitalIcon = (props) => <Icon {...props} name="smartphone-outline" />;
const MixedIcon = (props) => <Icon {...props} name="options-2-outline" />;

const renderBackAction = (navigation) => (
  <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
);

/**
 * Componente principal para gestionar el proceso de pago de un pedido específico.
 * @component
 */
function ProcesoPago({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [orderInfo, setOrderInfo] = useState(null);
    const id = route.params?.id;

    /**
     * Navega a la página de pago mixto.
     */
    function handleDetailsClickMixto() {
        navigation.navigate('PagoMixto', { id });
    }

    /**
     * Navega a la página de pago en efectivo.
     */
    function handleDetailsClickEfectivo() {
        navigation.navigate('PagoEfectivo', { id });
    }

    /**
     * Navega a la página de pago digital.
     */
    function handleDetailsClickDigital() {
        navigation.navigate('PagoDigital', { id });
    }

    /**
     * Obtiene la información del pedido desde la API.
     * @function
     */
    const fetchOrderInfo = useCallback(async () => {
        try {
            console.log('Fetching order info for:', id);
            const url = `https://api.99envios.app/api/pedidos/${id}`;
            const response = await axios.get(url);
            console.log('GET Response:', response.data);
            setOrderInfo(response.data);
        } catch (error) {
            console.error('Error fetching order info:', error);
        }
    }, [id]);

    /**
     * Hook de efecto para obtener la información del pedido cuando el ID del pedido cambia.
     */
    useEffect(() => {
        if (id) {
            fetchOrderInfo();
        }
    }, [id, fetchOrderInfo]);

    const total = orderInfo && orderInfo.costo_envio != null && orderInfo.valor_producto != null && orderInfo.FEE99 != null 
        ? (parseFloat(orderInfo.costo_envio) + parseFloat(orderInfo.valor_producto) + parseFloat(orderInfo.FEE99)) 
        : null;

    return (
        <Layout style={[styles.container, { paddingTop: insets.top }]}>
            <TopNavigation
                title={`Pago del Pedido #${orderInfo?.ID_pedido || id}`}
                alignment="center"
                accessoryLeft={() => renderBackAction(navigation)}
            />
            <View style={styles.contentContainer}>
                <Card style={styles.information}>
                    <View style={styles.header}>
                        <FontAwesome5 name="money-check-alt" size={20} color="#7380EC" />
                        <Text category="h6" style={styles.cardTitle}>Detalles del Pedido</Text>
                    </View>
                    
                    <View style={styles.row}>
                        <FontAwesome5 name="calendar" size={16} color="#555" />
                        <Text style={styles.financeLabel}>Fecha:</Text>
                        <Text style={styles.financeValue}>{orderInfo?.fecha_pedido || 'No disponible'}</Text>
                    </View>
                    
                    <View style={styles.row}>
                        <FontAwesome5 name="info-circle" size={16} color="#555" />
                        <Text style={styles.financeLabel}>Estado:</Text>
                        <Text style={styles.financeValue}>{orderInfo?.estado_pedido || 'No disponible'}</Text>
                    </View>
                    
                    {orderInfo && (
                        <>
                            <View style={styles.row}>
                                <FontAwesome5 name="shipping-fast" size={16} color="#555" />
                                <Text style={styles.financeLabel}>Costo envío:</Text>
                                <Text style={styles.financeValue}>+{parseFloat(orderInfo.costo_envio || 0).toFixed(2)}</Text>
                            </View>
                            
                            <View style={styles.row}>
                                <FontAwesome5 name="box" size={16} color="#555" />
                                <Text style={styles.financeLabel}>Valor producto:</Text>
                                <Text style={styles.financeValue}>+{parseFloat(orderInfo.valor_producto || 0).toFixed(2)}</Text>
                            </View>
                            
                            <View style={styles.row}>
                                <FontAwesome5 name="percentage" size={16} color="#555" />
                                <Text style={styles.financeLabel}>Fee:</Text>
                                <Text style={styles.financeValue}>+{parseFloat(orderInfo.FEE99 || 0).toFixed(2)}</Text>
                            </View>
                        </>
                    )}
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.row}>
                        <FontAwesome5 name="money-bill-wave" size={16} color="#41c675" />
                        <Text style={[styles.financeLabel, { color: '#41c675' }]}>Total a cobrar:</Text>
                        <Text style={styles.totalValue}>
                            $ {total !== null 
                                ? Math.round(total).toLocaleString('es-CO', { maximumFractionDigits: 0 })
                                : '...'}
                        </Text>
                    </View>
                </Card>
                
                <Card style={styles.information}>
                    <View style={styles.header}>
                        <FontAwesome5 name="credit-card" size={20} color="#7380EC" />
                        <Text category="h6" style={styles.cardTitle}>Selecciona el Método de Pago</Text>
                    </View>
                    
                    <View style={styles.buttonsContainer}>
                        <Button
                            style={[styles.customButton, styles.cashButton]}
                            accessoryLeft={CashIcon}
                            onPress={handleDetailsClickEfectivo}
                        >
                            Pago Efectivo Total
                        </Button>
                        <Button
                            style={[styles.customButton, styles.digitalButton]}
                            accessoryLeft={DigitalIcon}
                            onPress={handleDetailsClickDigital}
                        >
                            Pago Digital Total
                        </Button>
                        <Button
                            style={[styles.customButton, styles.mixedButton]}
                            accessoryLeft={MixedIcon}
                            onPress={handleDetailsClickMixto}
                        >
                            Pago Mixto
                        </Button>
                    </View>
                </Card>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    contentContainer: {
        padding: 16,
    },
    information: {
        marginBottom: 20,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        backgroundColor: 'white',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#7380EC',
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    financeLabel: {
        marginLeft: 8,
        color: '#555',
        flex: 1,
    },
    financeValue: {
        color: '#555',
        textAlign: 'right',
    },
    totalValue: {
        color: '#41c675',
        textAlign: 'right',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#E4E4E4',
        marginVertical: 8,
    },
    buttonsContainer: {
        gap: 12,
        marginTop: 12,
    },
    customButton: {
        borderRadius: 10,
        height: 55,
    },
    cashButton: {
        backgroundColor: '#28a745',
        borderColor: '#28a745',
    },
    digitalButton: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
    },
    mixedButton: {
        backgroundColor: '#6c757d',
        borderColor: '#6c757d',
    },
});

export default ProcesoPago;
