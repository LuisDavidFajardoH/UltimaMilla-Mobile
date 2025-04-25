import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Modal as RNModal, View } from 'react-native';
import { Layout, Text, Input, Button, Icon, Spinner, Card } from '@ui-kitten/components';
import { authService } from '../../services/authService';
import { CustomAlert } from '../../components/Alert/CustomAlert';

const TIME_SLOTS = [
  { label: 'Mañana (8:00 - 12:00)', start: '08:00', end: '12:00' },
  { label: 'Tarde (12:00 - 17:00)', start: '12:00', end: '17:00' },
  { label: 'Noche (17:00 - 22:00)', start: '17:00', end: '22:00' },
];

const CustomDateSection = ({ label, date, onSelect, min }) => {
  return (
    <Layout style={styles.dateSection}>
      <Text category="label" style={styles.dateLabel}>{label}</Text>
      <Layout style={styles.datePickerContainer}>
        <Input
          value={date.toLocaleDateString()}
          style={styles.datePicker}
          disabled
          accessoryRight={(props) => <Icon {...props} name="calendar-outline" />}
        />
        <Button 
          appearance="ghost" 
          onPress={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            onSelect(tomorrow);
          }}
        >
          Seleccionar
        </Button>
      </Layout>
    </Layout>
  );
};

const CustomProductSelect = ({ 
  options = [], 
  placeholder = 'Seleccionar', 
  onSelect, 
  selectedValue,
  loading = false 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  return (
    <Layout>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        style={styles.selectButton}
      >
        <Text>
          {selectedValue 
            ? options.find(p => p.id === selectedValue)?.name || placeholder
            : placeholder
          }
        </Text>
        <Icon name="chevron-down-outline" fill="#8F9BB3" style={styles.selectIcon} />
      </TouchableOpacity>
      
      <RNModal
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text category="h6" style={styles.modalTitle}>Seleccionar Producto</Text>
            
            {loading ? (
              <Layout style={styles.loadingContainer}>
                <Spinner size="large" />
                <Text style={styles.loadingText}>Cargando productos...</Text>
              </Layout>
            ) : (
              <ScrollView style={styles.productList}>
                {options.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.productItem, 
                      selectedValue === item.id && styles.selectedProductItem
                    ]}
                    onPress={() => {
                      onSelect(item.id);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={selectedValue === item.id ? styles.selectedProductText : null}>
                      {item.name} (Stock: {item.stock || 0})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            <Button onPress={() => setModalVisible(false)}>
              Cancelar
            </Button>
          </View>
        </View>
      </RNModal>
    </Layout>
  );
};

const CustomModal = ({ visible, onClose, children }) => {
  return (
    <RNModal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {children}
        </View>
      </View>
    </RNModal>
  );
};

const PedidoIndividualScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fecha_entrega: new Date(),
    fecha_repartidor: new Date(),
    costo_envio: '',
    origin: '',
    destination: '',
    horaInicio: '08:00',
    horaFinal: '12:00',
    selectedProducts: []
  });

  const [loading, setLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0]);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    status: 'primary'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setProductLoading(true);
      const userData = await authService.getUserData();
      if (!userData || !userData.token) {
        showAlert('Error', 'No se encontró información del usuario', 'danger');
        return;
      }

      const response = await fetch('https://api.99envios.app/api/inventarios', {
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error al cargar productos: ${response.status}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        const formattedProducts = data.map(product => ({
          id: product.id_producto,
          name: product.nombre_producto,
          sku: product.sku,
          stock: product.cantidad_disponible,
          price: product.precio_sugerido
        }));
        
        setProductos(formattedProducts);
      } else if (typeof data === 'object' && data !== null) {
        const productsArray = Object.values(data);
        const formattedProducts = productsArray.map(product => ({
          id: product.id_producto,
          name: product.nombre_producto,
          sku: product.sku,
          stock: product.cantidad_disponible,
          price: product.precio_sugerido
        }));
        
        setProductos(formattedProducts);
      } else {
        setProductos([]);
        showAlert('Aviso', 'No hay productos disponibles', 'warning');
      }

    } catch (error) {
      console.error('Error fetching products:', error);
      showAlert('Error', 'No se pudieron cargar los productos', 'danger');
      setProductos([]);
    } finally {
      setProductLoading(false);
    }
  };

  const showAlert = (title, message, status = 'primary') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      status
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      showAlert('Error', 'Por favor seleccione un producto', 'warning');
      return;
    }

    if (cantidad <= 0) {
      showAlert('Error', 'La cantidad debe ser mayor a cero', 'warning');
      return;
    }

    const product = productos.find(p => p.id === selectedProduct);
    
    if (!product) {
      showAlert('Error', 'Producto no encontrado', 'danger');
      return;
    }

    const updatedProducts = [...formData.selectedProducts, {
      id: product.id,
      name: product.name,
      cantidad: cantidad
    }];

    setFormData({
      ...formData,
      selectedProducts: updatedProducts
    });

    setShowProductModal(false);
    setSelectedProduct(null);
    setCantidad(1);
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    setFormData({
      ...formData,
      horaInicio: slot.start,
      horaFinal: slot.end
    });
    setUseCustomTime(false);
  };

  const handleCustomTimeToggle = () => {
    setUseCustomTime(true);
    setSelectedTimeSlot(null);
  };

  const removeProduct = (index) => {
    const newProducts = [...formData.selectedProducts];
    newProducts.splice(index, 1);
    setFormData({
      ...formData,
      selectedProducts: newProducts
    });
  };

  const handleSubmit = async () => {
    if (formData.selectedProducts.length === 0) {
      showAlert('Error', 'Debe agregar al menos un producto', 'warning');
      return;
    }

    if (!formData.nombre) {
      showAlert('Error', 'Ingrese el nombre del destinatario', 'warning');
      return;
    }

    if (!formData.telefono) {
      showAlert('Error', 'Ingrese el teléfono del destinatario', 'warning');
      return;
    }

    if (!formData.destination) {
      showAlert('Error', 'Ingrese la dirección de entrega', 'warning');
      return;
    }

    setLoading(true);
    try {
      const userData = await authService.getUserData();
      
      const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };
      
      const deliveryDate = formatDate(formData.fecha_entrega);
      const payload = {
        cantidad: formData.selectedProducts[0].cantidad,
        costo_envio: formData.costo_envio || "1",
        direccion: formData.destination,
        email: formData.email || "",
        estado: "Espera",
        fecha_de_entrega: `${deliveryDate}T00:00:00`,
        fecha_entrega_repartidor: `${formatDate(formData.fecha_repartidor)}T00:00:00`,
        hora_inicio: `${deliveryDate}T${formData.horaInicio}:00`,
        hora_final: `${deliveryDate}T${formData.horaFinal}:00`,
        id_producto: parseInt(formData.selectedProducts[0].id),
        nombre: formData.nombre,
        origin: formData.origin || "",
        telefono: formData.telefono
      };

      const response = await fetch(`https://api.99envios.app/api/generar-pedido/${userData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al generar el pedido');
      }

      showAlert('Éxito', '¡Pedido creado correctamente!', 'success');
      
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        fecha_entrega: new Date(),
        fecha_repartidor: new Date(),
        costo_envio: '',
        origin: '',
        destination: '',
        horaInicio: '08:00',
        horaFinal: '12:00',
        selectedProducts: []
      });
      
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting order:', error);
      showAlert('Error', error.message || 'Error al procesar la solicitud', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <Layout style={styles.form}>
          <Text category="h5" style={styles.sectionTitle}>Datos del Pedido</Text>
          
          <Button
            style={styles.addProductButton}
            appearance="outline"
            status="primary"
            accessoryLeft={(props) => <Icon {...props} name="plus-outline" />}
            onPress={() => setShowProductModal(true)}
          >
            Seleccionar Producto
          </Button>
          
          {formData.selectedProducts.length > 0 && (
            <Layout style={styles.productsList}>
              <Text category="s1" style={styles.subsectionTitle}>Productos seleccionados:</Text>
              {formData.selectedProducts.map((item, index) => (
                <Card style={styles.productCard} key={`${item.id}-${index}`}>
                  <Layout style={styles.productCardContent}>
                    <Layout style={styles.productInfo}>
                      <Text category="s1">{item.name}</Text>
                      <Text category="c1">Cantidad: {item.cantidad}</Text>
                    </Layout>
                    <Button
                      appearance="ghost"
                      status="danger"
                      size="small"
                      accessoryLeft={(props) => <Icon {...props} name="trash-2-outline" />}
                      onPress={() => removeProduct(index)}
                    />
                  </Layout>
                </Card>
              ))}
            </Layout>
          )}
          
          <Text category="h6" style={styles.subsectionTitle}>Información del Destinatario</Text>
          
          <Input
            label="Nombre quien recibe"
            placeholder="Nombre completo"
            value={formData.nombre}
            onChangeText={value => setFormData({...formData, nombre: value})}
            style={styles.input}
          />
          
          <Input
            label="Teléfono"
            placeholder="Número de teléfono"
            keyboardType="phone-pad"
            value={formData.telefono}
            onChangeText={value => setFormData({...formData, telefono: value})}
            style={styles.input}
          />
          
          <Input
            label="Correo electrónico (opcional)"
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={value => setFormData({...formData, email: value})}
            style={styles.input}
          />
          
          <Input
            label="Dirección de entrega"
            placeholder="Dirección completa"
            value={formData.destination}
            onChangeText={value => setFormData({...formData, destination: value})}
            style={styles.input}
          />
          
          <Input
            label="Dirección de origen (opcional)"
            placeholder="Dirección de origen"
            value={formData.origin}
            onChangeText={value => setFormData({...formData, origin: value})}
            style={styles.input}
          />
          
          <Text category="h6" style={styles.subsectionTitle}>Fechas y Horarios</Text>
          
          <CustomDateSection
            label="Fecha de entrega"
            date={formData.fecha_entrega}
            onSelect={date => setFormData({...formData, fecha_entrega: date})}
            min={new Date()}
          />
          
          <CustomDateSection
            label="Fecha entrega repartidor"
            date={formData.fecha_repartidor}
            onSelect={date => setFormData({...formData, fecha_repartidor: date})}
            min={new Date()}
          />
          
          <Text category="label" style={styles.label}>Horario de entrega</Text>
          <Layout style={styles.timeSlotContainer}>
            {TIME_SLOTS.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedTimeSlot === slot && styles.selectedTimeSlot
                ]}
                onPress={() => handleTimeSlotSelect(slot)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTimeSlot === slot && styles.selectedTimeSlotText
                ]}>
                  {slot.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[
                styles.timeSlot,
                useCustomTime && styles.selectedTimeSlot
              ]}
              onPress={handleCustomTimeToggle}
            >
              <Text style={[
                styles.timeSlotText,
                useCustomTime && styles.selectedTimeSlotText
              ]}>
                Personalizado
              </Text>
            </TouchableOpacity>
          </Layout>
          
          {useCustomTime && (
            <Layout style={styles.customTimeContainer}>
              <Input
                label="Hora de inicio"
                placeholder="08:00"
                value={formData.horaInicio}
                onChangeText={value => setFormData({...formData, horaInicio: value})}
                style={[styles.input, styles.timeInput]}
              />
              
              <Input
                label="Hora de fin"
                placeholder="12:00"
                value={formData.horaFinal}
                onChangeText={value => setFormData({...formData, horaFinal: value})}
                style={[styles.input, styles.timeInput]}
              />
            </Layout>
          )}
          
          <Input
            label="Costo de envío (opcional)"
            placeholder="0"
            keyboardType="numeric"
            value={formData.costo_envio}
            onChangeText={value => setFormData({...formData, costo_envio: value})}
            style={styles.input}
          />
          
          <Button
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? <Spinner status="basic" size="small" /> : 'Crear Pedido'}
          </Button>
        </Layout>
      </ScrollView>
      
      <CustomModal 
        visible={showProductModal} 
        onClose={() => setShowProductModal(false)}
      >
        <Text category="h6" style={styles.modalTitle}>Seleccionar Producto</Text>
        
        {productLoading ? (
          <Layout style={styles.loadingContainer}>
            <Spinner size="large" />
            <Text category="s1" style={styles.loadingText}>Cargando productos...</Text>
          </Layout>
        ) : (
          <>
            {productos && productos.length > 0 ? (
              <Layout style={styles.productSelectContainer}>
                <CustomProductSelect
                  options={productos}
                  placeholder="Seleccione un producto"
                  selectedValue={selectedProduct}
                  onSelect={(value) => setSelectedProduct(value)}
                />
                
                <Input
                  label="Cantidad"
                  placeholder="1"
                  keyboardType="numeric"
                  value={cantidad.toString()}
                  onChangeText={value => setCantidad(parseInt(value) || 0)}
                  style={styles.input}
                />
              </Layout>
            ) : (
              <Text category="s1" status="warning" style={styles.noProductsText}>
                No hay productos disponibles
              </Text>
            )}
            
            <Layout style={styles.modalButtonContainer}>
              <Button
                appearance="outline"
                status="basic"
                style={styles.modalButton}
                onPress={() => setShowProductModal(false)}
              >
                Cancelar
              </Button>
              
              <Button
                style={styles.modalButton}
                onPress={handleAddProduct}
                disabled={!selectedProduct || productos.length === 0}
              >
                Agregar
              </Button>
            </Layout>
          </>
        )}
      </CustomModal>
      
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        status={alertConfig.status}
        onBackdropPress={hideAlert}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  subsectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#2E3A59',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  label: {
    marginBottom: 8,
    fontSize: 12,
    color: '#8F9BB3',
  },
  dateSection: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  dateLabel: {
    marginBottom: 4,
    color: '#8F9BB3',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  datePicker: {
    flex: 1,
    backgroundColor: '#fff',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  timeSlot: {
    padding: 10,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E4E9F2',
    backgroundColor: '#fff',
  },
  selectedTimeSlot: {
    backgroundColor: '#0086FF',
    borderColor: '#0086FF',
  },
  timeSlotText: {
    color: '#2E3A59',
    fontSize: 12,
  },
  selectedTimeSlotText: {
    color: '#fff',
  },
  customTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 8,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  addProductButton: {
    marginBottom: 16,
  },
  productsList: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  productCard: {
    marginBottom: 8,
  },
  productCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  productInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E9F2',
    borderRadius: 4,
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  selectIcon: {
    width: 20, 
    height: 20,
  },
  productList: {
    maxHeight: 300,
    marginVertical: 16,
  },
  productItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F2',
  },
  selectedProductItem: {
    backgroundColor: 'rgba(0, 134, 255, 0.1)',
  },
  selectedProductText: {
    color: '#0086FF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 8,
    color: '#8F9BB3',
  },
  noProductsText: {
    textAlign: 'center',
    margin: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default PedidoIndividualScreen;
