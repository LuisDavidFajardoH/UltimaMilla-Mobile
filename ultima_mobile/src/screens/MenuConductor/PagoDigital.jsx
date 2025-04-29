import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Layout, Text, Icon, TopNavigation, TopNavigationAction, Button, Card, Divider } from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
const CashIcon = (props) => <Icon {...props} name="credit-card-outline" />;
const ConfirmIcon = (props) => <Icon {...props} name="checkmark-circle-2-outline" />;

const renderBackAction = (navigation) => (
  <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
);

/**
 * Componente principal para gestionar el proceso de pago de un pedido específico.
 * @component
 */
function PagoDigital({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [orderInfo, setOrderInfo] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const id = route.params?.id;

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

    /**
     * Marca el pedido como entregado en la API.
     * @async
     */
    const markAsDelivered = async () => {
        try {
            const url = `https://api.99envios.app/api/pedidos/actualizar-a-entregado/${id}`;
            console.log('Marking as delivered:', url);
            const response = await axios.post(url);
            console.log('Mark as delivered response:', response.data);
            if (response.status === 200) {
                console.log('Pedido marcado como entregado correctamente');
                return true;
            } else {
                console.error('Error marking as delivered, status:', response.status);
                return false;
            }
        } catch (error) {
            console.error('Error updating order to delivered:', error);
            Alert.alert('Error', 'No se pudo marcar el pedido como entregado.');
            return false;
        }
    };

    /**
     * Envía la imagen del comprobante de pago a la API.
     * @async
     */
    const sendPaymentProofImage = async () => {
        if (!selectedFile || !orderInfo) return false;

        const formData = new FormData();
        formData.append('foto_comprobante_virtual', {
            uri: selectedFile.uri,
            name: selectedFile.name,
            type: selectedFile.mimeType || 'image/jpeg',
        });
        formData.append('ID_pedido', id);
        formData.append('estado_pago', 'Entregado');
        formData.append('pago_efectivo', 0);
        formData.append('pago_digital', orderInfo.valor_producto);

        try {
            const url = `https://api.99envios.app/api/pago_digital`;
            console.log('Sending payment proof:', url, formData);
            const response = await axios.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Send payment proof response:', response.data);
            if (response.status === 200) {
                console.log('Imagen de comprobante de pago enviada correctamente');
                return true;
            } else {
                console.error('Error sending payment proof, status:', response.status);
                return false;
            }
        } catch (error) {
            console.error('Error sending payment proof image:', error.response ? error.response.data : error);
            Alert.alert('Error', 'No se pudo enviar el comprobante de pago.');
            return false;
        }
    };

    /**
     * Handles the confirmation of delivery process.
     * @async
     */
    const handleConfirmDelivery = async () => {
        if (!selectedFile) {
            Alert.alert('Archivo Requerido', 'Por favor, selecciona una imagen del comprobante antes de confirmar.');
            return;
        }
        if (!orderInfo) {
            Alert.alert('Error', 'No se pudo cargar la información del pedido.');
            return;
        }

        setIsLoading(true);

        try {
            // First, try to send the payment proof image
            const paymentProofSuccess = await sendPaymentProofImage();

            if (paymentProofSuccess) {
                // If payment proof is sent successfully, then mark the order as delivered
                const deliveredSuccess = await markAsDelivered();

                if (deliveredSuccess) {
                    navigation.navigate('EntregaConfirmada', { id });
                } else {
                    // This case might need specific handling depending on business logic
                    // e.g., retry marking as delivered, or inform support
                    Alert.alert('Error Parcial', 'El comprobante fue enviado, pero falló la marcación como entregado. Por favor, contacta a soporte.');
                }
            } else {
                // If sending payment proof fails, do not proceed to mark as delivered
                Alert.alert('Error', 'No se pudo enviar el comprobante de pago. La entrega no fue confirmada.');
            }
        } catch (error) {
            console.error('Error during confirmation process:', error);
            Alert.alert('Error', 'Ocurrió un error inesperado durante la confirmación.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles the file selection process.
     * @async
     */
    const handleFilePick = async () => {
        // Pedir permiso para galería
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a las imágenes.');
            return;
        }
        // Abrir selector de imágenes (sin recorte)
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.length) {
            const asset = result.assets[0];
            const uri = asset.uri;
            const name = asset.fileName || uri.split('/').pop();
            const ext = name.split('.').pop() || 'jpg';
            setSelectedFile({
                uri,
                name,
                mimeType: `image/${ext}`,
            });
        } else {
            console.log('Selección de imagen cancelada');
            setSelectedFile(null);
        }
    };

    return (
        <Layout style={[styles.container, { paddingTop: insets.top }]}>
            <TopNavigation
                title={`Pago Digital del Pedido #${orderInfo?.ID_pedido || id}`}
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
                        <FontAwesome5 name="file-invoice" size={20} color="#7380EC" />
                        <Text category="h6" style={styles.cardTitle}>Comprobante de pago virtual</Text>
                    </View>
                    <Text style={styles.instructionText}>
                        Anexa una captura o fotografía de la transacción virtual
                    </Text>
                    <Button
                        style={[styles.customButton, styles.uploadButton]}
                        accessoryLeft={(props) => <Icon {...props} name="upload-outline" />}
                        onPress={handleFilePick}
                        disabled={isLoading}
                    >
                        Seleccionar imagen
                    </Button>
                    {selectedFile && (
                        <Text style={styles.fileNameText} numberOfLines={1} ellipsizeMode="middle">
                            Archivo: {selectedFile.name}
                        </Text>
                    )}
                    <Button
                        style={[styles.customButton, styles.cashButton]}
                        accessoryLeft={ConfirmIcon}
                        onPress={handleConfirmDelivery}
                        disabled={!selectedFile || isLoading}
                    >
                        {isLoading ? 'Confirmando...' : 'Confirmar Entrega'}
                    </Button>
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
    instructionText: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 16,
        color: '#555',
    },
    uploadButton: {
        marginTop: 2,
        marginVertical: 12,
        backgroundColor: '#6200ee',
        borderColor: '#6200ee',
    },
    fileNameText: {
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 12,
        color: '#555',
        fontSize: 13,
        fontStyle: 'italic',
    },
}); 

export default PagoDigital;
