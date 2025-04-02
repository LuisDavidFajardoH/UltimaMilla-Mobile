import React, { useState, useRef } from 'react';
import { StyleSheet, Platform, ScrollView, KeyboardAvoidingView, Alert, Linking, Image, TouchableOpacity } from 'react-native';
import { Button, Text, Layout, Input, TopNavigation, TopNavigationAction, Icon, CheckBox } from '@ui-kitten/components';
import CustomSelect from '../../components/Select/select';
import Ciudades from '../../ciudades/ciudades';
import { CustomAlert } from '../../components/Alert/CustomAlert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tiposIdentificacion = [
  { label: 'Cédula de Ciudadanía', value: 'CC' },
  { label: 'Cédula de Extranjería', value: 'CE' },
  { label: 'Tarjeta de Identidad', value: 'TI' }
];

const categorias = [
  { id: '1', text: 'Ropa y Accesorios' },
  { id: '2', text: 'Tecnología' },
  { id: '3', text: 'Alimentos y Bebidas' },
  { id: '4', text: 'Cosméticos y Belleza' },
  { id: '5', text: 'Libros y Papelería' },
  { id: '6', text: 'Hogar y Decoración' },
  { id: '7', text: 'Otros' },
];

const volumenPaquetes = [
  { id: '1', text: '1 a 100 paquetes', value: '1-100' },
  { id: '2', text: 'Entre 100 y 4.000 paquetes', value: '100-4000' },
  { id: '3', text: 'Más de 4.000 paquetes', value: '4000+' },
];

export const RegisterDeliveryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    pais: '',
    nombre_sucursal: '',
    direccion_negocio: '',
    ciudad: '',
    nombre: '',
    apellido: '',
    tipo_identificacion: '',
    num_identificacion: '',
    email: '',
    telefono: '',
    categoria_principal: '',
    volumen_estimado: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    foto_perfil: null,
    foto_documento: null,
  });
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    status: 'primary'
  });

  const showAlert = (title, message, status = 'primary') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      status
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({...prev, visible: false}));
  };

  const BackIcon = (props) => (
    <Icon {...props} name='arrow-back'/>
  );

  const renderBackAction = () => (
    <TopNavigationAction 
      icon={BackIcon} 
      onPress={navigation.goBack}
    />
  );

  const handleSubmitEditing = () => {
    if (currentStep < 3) {
      if (validateStep(currentStep)) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      handleSubmit();
    }
  };

  // Refs para los inputs del paso 1
  const nombreSucursalRef = useRef();
  const direccionRef = useRef();
  const nombreRef = useRef();
  const apellidoRef = useRef();
  const identificacionRef = useRef();
  const emailRef = useRef();
  const telefonoRef = useRef();

  // Refs para los inputs del paso 3
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  const handleInputSubmit = (nextRef) => {
    if (nextRef && nextRef.current) {
      nextRef.current.focus();
    }
  };

  const selectImage = async (type) => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        allowMultiSelection: false,
      });

      if (result[0]) {
        const selectedFile = {
          uri: result[0].uri,
          type: result[0].type,
          name: result[0].name,
        };

        setFormData(prev => ({
          ...prev,
          [type]: selectedFile
        }));
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        showAlert('Error', 'No se pudo cargar el documento', 'danger');
      }
    }
  };

  const renderImageSelector = (type, title) => (
    <TouchableOpacity 
      style={styles.imageSelector} 
      onPress={() => selectImage(type)}
    >
      {formData[type] ? (
        <Image 
          source={{ uri: formData[type].uri }} 
          style={styles.selectedImage}
        />
      ) : (
        <Layout style={styles.imagePlaceholder}>
          <Icon name='camera' style={styles.cameraIcon} fill='#8F9BB3'/>
          <Text category='s1'>{title}</Text>
        </Layout>
      )}
    </TouchableOpacity>
  );

  const renderStep1 = () => (
    <Layout style={styles.stepContainer}>
      <Text category='h5' style={styles.stepTitle}>Información del Conductor</Text>
      <Text category='p1' style={styles.stepDescription}>
        Cuéntanos sobre ti
      </Text>

      <Input
        ref={nombreRef}
        label='Nombre'
        placeholder='Ingresa tu nombre'
        value={formData.nombre}
        onChangeText={value => setFormData({...formData, nombre: value})}
        style={styles.input}
        returnKeyType="next"
        onSubmitEditing={() => handleInputSubmit(apellidoRef)}
        blurOnSubmit={false}
      />

      <CustomSelect
        label='Tipo de Identificación'
        placeholder='Selecciona el tipo'
        value={formData.tipo_identificacion}
        onSelect={(value) => setFormData({...formData, tipo_identificacion: value})}
        options={tiposIdentificacion}
      />

      <Input
        ref={identificacionRef}
        label='Documento de Identidad'
        placeholder='Ingresa tu documento de identidad'
        value={formData.num_identificacion}
        onChangeText={value => setFormData({...formData, num_identificacion: value})}
        keyboardType='numeric'
        style={styles.input}
        returnKeyType="next"
        onSubmitEditing={() => handleInputSubmit(emailRef)}
        blurOnSubmit={false}
      />

      <Input
        ref={identificacionRef}
        label='Número de Identificación'
        placeholder='Ingresa tu número de identificación'
        value={formData.num_identificacion}
        onChangeText={value => setFormData({...formData, num_identificacion: value})}
        keyboardType='numeric'
        style={styles.input}
        returnKeyType="next"
        onSubmitEditing={() => handleInputSubmit(emailRef)}
        blurOnSubmit={false}
      />

      <CustomSelect
        label='País'
        placeholder='Selecciona tu país'
        value={formData.pais}
        onSelect={(value) => setFormData({...formData, pais: value})}
        options={[
          { label: 'Colombia', value: 'CO' },
          { label: 'México', value: 'MX' }
        ]}
      />

      <CustomSelect
        label='Ciudad'
        placeholder='Selecciona tu ciudad'
        value={formData.ciudad}
        onSelect={(value) => setFormData({...formData, ciudad: value})}
        options={Ciudades}
        searchable={true} // Habilitamos la búsqueda para el select de ciudades
      />

      <Input
        ref={nombreRef}
        label='Dirección'
        placeholder='Ingresa tu dirección'
        value={formData.nombre}
        onChangeText={value => setFormData({...formData, nombre: value})}
        style={styles.input}
        returnKeyType="next"
        onSubmitEditing={() => handleInputSubmit(apellidoRef)}
        blurOnSubmit={false}
      />

      <Input
        ref={emailRef}
        label='Correo Electrónico'
        placeholder='correo@ejemplo.com'
        value={formData.email}
        onChangeText={value => setFormData({...formData, email: value})}
        keyboardType='email-address'
        autoCapitalize='none'
        style={styles.input}
        returnKeyType="next"
        onSubmitEditing={() => handleInputSubmit(telefonoRef)}
        blurOnSubmit={false}
      />

      <Input
        ref={telefonoRef}
        label='Celular'
        placeholder='Ingresa tu número de Celular'
        value={formData.telefono}
        onChangeText={value => setFormData({...formData, telefono: value})}
        keyboardType='phone-pad'
        style={styles.input}
        returnKeyType="next"
        onSubmitEditing={() => handleInputSubmit(passwordRef)}
        blurOnSubmit={false}
      />

<Input
        ref={passwordRef}
        label='Contraseña'
        placeholder='Ingresa tu contraseña'
        value={formData.password}
        secureTextEntry
        onChangeText={value => setFormData({...formData, password: value})}
        style={styles.input}
        caption='Debe contener al menos 8 caracteres'
        returnKeyType="next"
        onSubmitEditing={() => handleInputSubmit(confirmPasswordRef)}
        blurOnSubmit={false}
      />

      <Input
        ref={confirmPasswordRef}
        label='Confirmar Contraseña'
        placeholder='Confirma tu contraseña'
        value={formData.confirmPassword}
        secureTextEntry
        onChangeText={value => setFormData({...formData, confirmPassword: value})}
        style={styles.input}
        status={formData.password !== formData.confirmPassword && formData.confirmPassword ? 'danger' : 'basic'}
        caption={formData.password !== formData.confirmPassword && formData.confirmPassword ? 'Las contraseñas no coinciden' : ''}
        returnKeyType="done"
        onSubmitEditing={handleNext}
        blurOnSubmit={true}
      />

      <Text category='s1' style={styles.sectionTitle}>Ingresa tus Documentos</Text>
      <Layout style={styles.imageSelectorsContainer}>
        {renderImageSelector('foto_perfil', 'Foto de Perfil')}
        {renderImageSelector('foto_documento', 'Foto del Documento')}
      </Layout>
      
    </Layout>
  );

  const renderStep2 = () => (
    <Layout style={styles.stepContainer}>
      <Text category='h5' style={styles.stepTitle}>Detalles del Negocio</Text>
      <Text category='p1' style={styles.stepDescription}>
        Información sobre tu operación
      </Text>

      <CustomSelect
        label='Categoría Principal de Productos'
        placeholder='Selecciona una categoría'
        value={formData.categoria_principal}
        onSelect={(value) => setFormData({...formData, categoria_principal: value})}
        options={categorias.map(c => ({ label: c.text, value: c.id }))}
      />

      <CustomSelect
        label='Volumen Estimado Mensual'
        placeholder='Selecciona un rango'
        value={formData.volumen_estimado}
        onSelect={(value) => setFormData({...formData, volumen_estimado: value})}
        options={volumenPaquetes.map(v => ({ label: v.text, value: v.value }))}
      />
    </Layout>
  );

  const renderStep3 = () => (
    <Layout style={styles.stepContainer}>
      <Text category='h5' style={styles.stepTitle}>Finalizar Registro</Text>
      <Text category='p1' style={styles.stepDescription}>
        Ya estamos finalizando. Por favor, ingresa una contraseña para crear tu cuenta
      </Text>

      <Input
        ref={passwordRef}
        label='Contraseña'
        placeholder='Ingresa tu contraseña'
        value={formData.password}
        secureTextEntry
        onChangeText={value => setFormData({...formData, password: value})}
        style={styles.input}
        caption='Debe contener al menos 8 caracteres'
        returnKeyType="next"
        onSubmitEditing={() => handleInputSubmit(confirmPasswordRef)}
        blurOnSubmit={false}
      />

      <Input
        ref={confirmPasswordRef}
        label='Repetir Contraseña'
        placeholder='Confirma tu contraseña'
        value={formData.confirmPassword}
        secureTextEntry
        onChangeText={value => setFormData({...formData, confirmPassword: value})}
        style={styles.input}
        status={formData.password !== formData.confirmPassword && formData.confirmPassword ? 'danger' : 'basic'}
        caption={formData.password !== formData.confirmPassword && formData.confirmPassword ? 'Las contraseñas no coinciden' : ''}
        returnKeyType="done"
        onSubmitEditing={handleNext}
        blurOnSubmit={true}
      />

      <Layout style={styles.termsContainer}>
        <CheckBox
          checked={formData.termsAccepted}
          onChange={checked => setFormData({...formData, termsAccepted: checked})}
          style={styles.checkbox}
        >
          {evaProps => (
            <Text {...evaProps} style={styles.termsText}>
              He leído y acepto los{' '}
              <Text
                onPress={() => Linking.openURL('https://99envios.app/terminos-y-condiciones')}
                style={styles.termsLink}
              >
                términos y condiciones
              </Text>
            </Text>
          )}
        </CheckBox>
      </Layout>
    </Layout>
  );

  const handleSubmit = async () => {
    try {
      // Transform form data to match API requirements
      const apiData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        cantidad: parseInt(formData.volumen_estimado === '1-100' ? 1 : formData.volumen_estimado === '100-4000' ? 2 : 3),
        ciudad: formData.ciudad,
        codigo_pais: formData.pais === 'CO' ? 1 : 2,
        direccion: formData.direccion_negocio,
        email: formData.email,
        id_rol: 3,
        nombre_sucursal: formData.nombre_sucursal,
        num_identificacion: formData.num_identificacion,
        pais: formData.pais === 'CO' ? 1 : 2,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        producto: categorias.find(c => c.id === formData.categoria_principal)?.text || '',
        telefono: formData.telefono,
        terminosCondiciones: formData.termsAccepted,
        tipo_identificacion: formData.tipo_identificacion,
      };

      const response = await fetch('https://api.99envios.app/api/auth/register_sucursal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        const errorMessage = data.message || 
                           (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) ||
                           'Error en el registro';
        
        console.error('Error Response:', {
          status: response.status,
          data: data,
          message: errorMessage
        });
        
        showAlert('Error', errorMessage, 'danger');
        return;
      }

      showAlert(
        '¡Registro Exitoso!', 
        'Tu cuenta ha sido creada correctamente',
        'success'
      );

      // Navegar después de que el usuario cierre el alert
      setTimeout(() => {
        navigation.replace('99 Envios');
      }, 1500);

    } catch (error) {
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        originalError: error
      });
      
      showAlert(
        'Error',
        `Error al registrar: ${error.message}. Por favor intente nuevamente.`,
        'danger'
      );
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.pais) {
          showAlert('Campo Requerido', 'Por favor seleccione un país', 'warning');
          return false;
        }
        if (!formData.nombre_sucursal) {
          showAlert('Campo Requerido', 'Por favor ingrese el nombre del negocio', 'warning');
          return false;
        }
        if (!formData.direccion_negocio) {
          showAlert('Campo Requerido', 'Por favor ingrese la dirección del negocio', 'warning');
          return false;
        }
        if (!formData.ciudad) {
          showAlert('Campo Requerido', 'Por favor seleccione una ciudad', 'warning');
          return false;
        }
        if (!formData.nombre) {
          showAlert('Campo Requerido', 'Por favor ingrese su nombre', 'warning');
          return false;
        }
        if (!formData.apellido) {
          showAlert('Campo Requerido', 'Por favor ingrese su apellido', 'warning');
          return false;
        }
        if (!formData.tipo_identificacion) {
          showAlert('Campo Requerido', 'Por favor seleccione el tipo de identificación', 'warning');
          return false;
        }
        if (!formData.num_identificacion) {
          showAlert('Campo Requerido', 'Por favor ingrese su número de identificación', 'warning');
          return false;
        }
        if (!formData.email) {
          showAlert('Campo Requerido', 'Por favor ingrese su correo electrónico', 'warning');
          return false;
        }
        if (!formData.celular) {
          showAlert('Campo Requerido', 'Por favor ingrese su número de celular', 'warning');
          return false;
        }
        if (!formData.password) {
          showAlert('Campo Requerido', 'Por favor ingrese una contraseña', 'warning');
          return false;
        }
        if (!formData.confirmPassword) {
          showAlert('Campo Requerido', 'Por favor confirme su contraseña', 'warning');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          showAlert('Error', 'Las contraseñas no coinciden', 'warning');
          return false;
        }
        if (formData.password.length < 8) {
          showAlert('Error', 'La contraseña debe tener al menos 8 caracteres', 'warning');
          return false;
        }
        break;

      case 2:
        if (!formData.categoria_principal) {
          showAlert('Campo Requerido', 'Por favor seleccione la categoría principal de productos', 'warning');
          return false;
        }
        if (!formData.volumen_estimado) {
          showAlert('Campo Requerido', 'Por favor seleccione el volumen estimado mensual', 'warning');
          return false;
        }
        break;

      case 3:
        if (!formData.password || formData.password.length < 8) {
          showAlert('Error', 'La contraseña debe tener al menos 8 caracteres', 'danger');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          showAlert('Error', 'Las contraseñas no coinciden', 'danger');
          return false;
        }
        if (!formData.termsAccepted) {
          showAlert('Error', 'Debe aceptar los términos y condiciones', 'danger');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { 
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right
      }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopNavigation
        title='Registrarse como Conductor'
        alignment='center'
        accessoryLeft={renderBackAction}
      />

      <Layout style={styles.progressContainer}>
        <Layout style={styles.progressBar}>
          <Layout 
            style={[
              styles.progressFill, 
              { width: `${(currentStep / 3) * 100}%` } 
            ]} 
          />
        </Layout>
      </Layout>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        <Layout style={styles.buttonContainer}>
          {currentStep > 1 && (
            <Button 
              style={[styles.button, styles.backButton]} 
              appearance='ghost'
              onPress={() => setCurrentStep(prev => prev - 1)}>
              Anterior
            </Button>
          )}
          <Button 
            style={[styles.button, styles.nextButton]}
            onPress={handleNext}
            disabled={currentStep === 3 && (!formData.password || !formData.confirmPassword || !formData.termsAccepted)}>
            {currentStep === 3 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </Layout>
      </ScrollView>
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
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E4E9F2',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0086FF',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  stepContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  stepTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  stepDescription: {
    color: '#8F9BB3',
    marginBottom: 24,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 16,
    color: '#2E3A59',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'transparent',
  },
  button: {
    flex: 1,
    margin: 8,
  },
  backButton: {
    backgroundColor: 'transparent',
  },
  nextButton: {
    backgroundColor: '#0086FF',
  },
  selectContainer: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  select: {
    marginTop: 4,
    backgroundColor: '#fff',
  },
  termsContainer: {
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  checkbox: {
    marginBottom: 16,
  },
  termsText: {
    fontSize: 14,
    color: '#2E3A59',
    marginLeft: 8,
  },
  termsLink: {
    color: '#0086FF',
    textDecorationLine: 'underline',
  },
  imageSelectorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  imageSelector: {
    width: '48%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#8F9BB3',
    borderRadius: 8,
  },
  cameraIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
});

export default RegisterDeliveryScreen;