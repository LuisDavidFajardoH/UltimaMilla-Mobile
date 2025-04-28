import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Layout, Text, Icon, TopNavigation, TopNavigationAction, Button, Card, Divider } from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { FontAwesome5 } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker'; // Import DocumentPicker

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
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
    const [selectedFile, setSelectedFile] = useState(null); // State for selected file
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
     * Handles the file selection process.
     * @async
     */
    const handleFilePick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*', // Allow any file type, adjust as needed (e.g., 'image/*')
                copyToCacheDirectory: true,
            });

            console.log('Document Picker Result:', result);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedFile(result.assets[0]); // Store the first selected asset
            } else {
                // Handle cancellation or no asset selected
                setSelectedFile(null);
                console.log('File selection cancelled or failed.');
            }
        } catch (error) {
            console.error('Error picking document:', error);
            setSelectedFile(null);
            // Optionally show an error message to the user
        }
    };

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
                        <FontAwesome5 name="file-invoice" size={20} color="#7380EC" />
                        <Text category="h6" style={styles.cardTitle}>Comprobante pago digital</Text>
                    </View>
                    <Text style={styles.instructionText}>
                        Anexa una captura o fotografía de la transacción virtual
                    </Text>
                    <Button
                        style={[styles.customButton, styles.uploadButton]}
                        accessoryLeft={(props) => <Icon {...props} name="upload-outline" />}
                        onPress={handleFilePick} // Attach file picker function
                    >
                        Seleccionar archivo
                    </Button>
                    {/* Display selected file name */}
                    {selectedFile && (
                        <Text style={styles.fileNameText} numberOfLines={1} ellipsizeMode="middle">
                            Archivo: {selectedFile.name}
                        </Text>
                    )}
                    <Button
                        style={[styles.customButton, styles.cashButton]}
                        accessoryLeft={ConfirmIcon}
                    >
                        Confirmar Entrega
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
