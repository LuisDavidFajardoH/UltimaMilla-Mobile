import React, { useState } from 'react';
import { StyleSheet, Platform, ScrollView, KeyboardAvoidingView, Alert, Linking, Image, TouchableOpacity } from 'react-native';
import { Button, Text, Layout, Input, TopNavigation, TopNavigationAction, Icon, CheckBox, Datepicker } from '@ui-kitten/components';
import CustomSelect from '../../components/Select/select';
import Ciudades from '../../ciudades/ciudades';
import { CustomAlert } from '../../components/Alert/CustomAlert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tiposIdentificacion = [
  { label: 'Cédula de Ciudadanía', value: 'CC' },
  { label: 'Cédula de Extranjería', value: 'CE' },
  { label: 'Tarjeta de Identidad', value: 'TI' }
];

export const RegisterDeliveryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    documento_identidad: '',
    num_identificacion: '',
    pais: '',
    ciudad: '',
    direccion: '',
    email: '',
    celular: '',
    capacidad_carga: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    foto_perfil: null,
    foto_documento: null,
    vencimiento_soat: new Date(),
    vencimiento_tecnomecanica: new Date(),
    tipo_identificacion: '',
    tipo_vehiculo: '',
    placa_vehiculo: '',
    numero_soat: '',
    numero_tecnomecanica: '',
    latitud: '',
    longitud: '',
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
        label='Nombre'
        placeholder='Ingresa tu nombre'
        value={formData.nombre_usuario}                      // actualización
        onChangeText={value => setFormData({...formData, nombre_usuario: value})}
        style={styles.input}
      />

      <CustomSelect
        label='Tipo de Identificación'
        placeholder='Selecciona el tipo'
        value={formData.tipo_identificacion}
        onSelect={(value) => setFormData({...formData, tipo_identificacion: value})}
        options={tiposIdentificacion}
      />

      <Input
        label='Documento de Identidad'
        placeholder='Ingresa tu documento de identidad'
        value={formData.documento_identidad}                // actualización
        onChangeText={value => setFormData({...formData, documento_identidad: value})}
        keyboardType='numeric'
        style={styles.input}
      />

      <Input
        label='Número de Identificación'
        placeholder='Ingresa tu número de identificación'
        value={formData.num_identificacion}
        onChangeText={value => setFormData({...formData, num_identificacion: value})}
        keyboardType='numeric'
        style={styles.input}
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
        label='Dirección'
        placeholder='Ingresa tu dirección'
        value={formData.direccion}
        onChangeText={value => setFormData({...formData, direccion: value})}
        style={styles.input}
      />

      <Input
        label='Correo Electrónico'
        placeholder='correo@ejemplo.com'
        value={formData.email}
        onChangeText={value => setFormData({...formData, email: value})}
        keyboardType='email-address'
        autoCapitalize='none'
        style={styles.input}
      />

      <Input
        label='Celular'
        placeholder='Ingresa tu número de Celular'
        value={formData.celular}
        onChangeText={value => setFormData({...formData, celular: value})}
        keyboardType='phone-pad'
        style={styles.input}
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
      <Text category='h5' style={styles.stepTitle}>Información del Vehículo</Text>
      <Text category='p1' style={styles.stepDescription}>
        Ingresa la información de tu vehículo
      </Text>
      <CustomSelect
        label='Tipo de Vehículo'
        placeholder='Selecciona el tipo de vehículo'
        value={formData.tipo_vehiculo}
        onSelect={(value) => setFormData({ ...formData, tipo_vehiculo: value })}
        options={[
          { label: 'Moto', value: 'moto' },
          { label: 'Carro', value: 'carro' }
        ]}
      />
      <Input
        label='Placa del Vehículo'
        placeholder='Ingresa la placa del vehículo'
        value={formData.placa_vehiculo}
        onChangeText={value => setFormData({...formData, placa_vehiculo: value})}
        style={styles.input}
      />
      <Input
        label='Número de SOAT'
        placeholder='Ingresa el número de SOAT'
        value={formData.numero_soat}
        onChangeText={value => setFormData({...formData, numero_soat: value})}
        keyboardType='numeric'
        style={styles.input}
      />
      <Datepicker
        label='Vencimiento SOAT'
        placeholder='Seleccione fecha'
        date={formData.vencimiento_soat}
        onSelect={nextDate => setFormData({...formData, vencimiento_soat: nextDate})}
        min={new Date(1900, 0, 1)} // desde el año 1900
        max={new Date(2100, 11, 31)} // hasta el año 2100
        controlStyle={styles.datePickerControl}
      />
      <Input
        label='Número de Tecnomecánica'
        placeholder='Ingresa el número de Tecnomecánica'
        value={formData.numero_tecnomecanica}
        onChangeText={value => setFormData({...formData, numero_tecnomecanica: value})}
        keyboardType='numeric'
        style={styles.input}
      />
      <Datepicker
        label='Vencimiento Tecnomecánica'
        placeholder='Seleccione fecha'
        date={formData.vencimiento_tecnomecanica}
        onSelect={nextDate => setFormData({...formData, vencimiento_tecnomecanica: nextDate})}
        min={new Date(1900, 0, 1)} // desde el año 1900
        max={new Date(2100, 11, 31)} // hasta el año 2100
        controlStyle={styles.datePickerControl}
      />
      <Input
        label='Capacidad de Carga'
        placeholder='Ingresa la capacidad de carga'
        value={formData.capacidad_carga}
        onChangeText={value => setFormData({...formData, capacidad_carga: value})}
        keyboardType='numeric'
        style={styles.input}
      />
      <Input
        label='Latitud'
        placeholder='Ingresa la latitud'
        value={formData.latitud}
        onChangeText={value => setFormData({...formData, latitud: value})}
        keyboardType='numeric'
        style={styles.input}
      />
      <Input
        label='Longitud'
        placeholder='Ingresa la longitud'
        value={formData.longitud}
        onChangeText={value => setFormData({...formData, longitud: value})}
        keyboardType='numeric'
        style={styles.input}
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
        label='Contraseña'
        placeholder='Ingresa tu contraseña'
        value={formData.password}
        secureTextEntry
        onChangeText={value => setFormData({...formData, password: value})}
        style={styles.input}
        caption='Debe contener al menos 8 caracteres'
      />

      <Input
        label='Repetir Contraseña'
        placeholder='Confirma tu contraseña'
        value={formData.confirmPassword}
        secureTextEntry
        onChangeText={value => setFormData({...formData, confirmPassword: value})}
        style={styles.input}
        status={formData.password !== formData.confirmPassword && formData.confirmPassword ? 'danger' : 'basic'}
        caption={formData.password !== formData.confirmPassword && formData.confirmPassword ? 'Las contraseñas no coinciden' : ''}
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
    // Helper para formatear la fecha como YYYY-MM-DD
    const formatDate = (date) => {
      const d = new Date(date);
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${d.getFullYear()}-${month}-${day}`;
    };

    let formDataToSend = new FormData();
    formDataToSend.append('nombre_usuario', formData.nombre_usuario);
    formDataToSend.append('telefono', formData.celular);
    formDataToSend.append('direccion', formData.direccion);
    formDataToSend.append('documento_identidad', formData.documento_identidad);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('pais', formData.pais === 'CO' ? 1 : 2);
    if (formData.foto_perfil) {
      formDataToSend.append('foto_cara', formData.foto_perfil);
    }
    formDataToSend.append('capacidad_carga', formData.capacidad_carga);
    formDataToSend.append('tipo_vehiculo', formData.tipo_vehiculo);
    formDataToSend.append('placa_vehiculo', formData.placa_vehiculo);
    formDataToSend.append('ciudad', formData.ciudad);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('password_confirmation', formData.confirmPassword);
    formDataToSend.append('id_rol', 4);
    formDataToSend.append('estado', 0);
    formDataToSend.append('tipo_identificacion', formData.tipo_identificacion);
    formDataToSend.append('numero_soat', formData.numero_soat);
    formDataToSend.append('numero_tecnomecanica', formData.numero_tecnomecanica);
    formDataToSend.append('latitud', parseFloat(formData.latitud).toFixed(1));
    formDataToSend.append('longitud', parseFloat(formData.longitud).toFixed(1));
    formDataToSend.append('fecha_vencimiento_soat', formatDate(formData.vencimiento_soat));
    formDataToSend.append('fecha_vencimiento_tecnomecanica', formatDate(formData.vencimiento_tecnomecanica));
    if (formData.foto_documento) {
      formDataToSend.append('foto_documento', formData.foto_documento);
    }
    try {
      const response = await fetch('https://api.99envios.app/api/auth/register_repartidor', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formDataToSend,
      });
      const data = await response.json();
      console.log('API Response:', data);
      if (!response.ok) {
        const errorMessage = data.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) || 'Error en el registro';
        console.error('Error Response:', { status: response.status, data, message: errorMessage });
        showAlert('Error', errorMessage, 'danger');
        return;
      }
      showAlert('¡Registro Exitoso!', 'Tu cuenta ha sido creada correctamente', 'success');
      setTimeout(() => {
        navigation.replace('99 Envios');
      }, 1500);
    } catch (error) {
      console.error('Full error details:', error);
      showAlert('Error', `Error al registrar: ${error.message}. Por favor intente nuevamente.`, 'danger');
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        // Datos del Conductor
        if (!formData.pais) {
          showAlert('Campo Requerido', 'Por favor seleccione un país', 'warning');
          return false;
        }
        if (!formData.nombre_usuario) {
          showAlert('Campo Requerido', 'Por favor ingrese su nombre', 'warning');
          return false;
        }
        if (!formData.tipo_identificacion) {
          showAlert('Campo Requerido', 'Por favor seleccione el tipo de identificación', 'warning');
          return false;
        }
        if (!formData.documento_identidad) {
          showAlert('Campo Requerido', 'Por favor ingrese su documento de identidad', 'warning');
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
        if (!formData.ciudad) {
          showAlert('Campo Requerido', 'Por favor seleccione una ciudad', 'warning');
          return false;
        }
        if (!formData.direccion) {
          showAlert('Campo Requerido', 'Por favor ingrese su dirección', 'warning');
          return false;
        }
        break;
      case 2:
        // Datos del Vehículo
        if (!formData.tipo_vehiculo) {
          showAlert('Campo Requerido', 'Por favor seleccione el tipo de vehículo', 'warning');
          return false;
        }
        if (!formData.placa_vehiculo) {
          showAlert('Campo Requerido', 'Por favor ingrese la placa del vehículo', 'warning');
          return false;
        }
        if (!formData.numero_soat) {
          showAlert('Campo Requerido', 'Por favor ingrese el número de SOAT', 'warning');
          return false;
        }
        if (!formData.numero_tecnomecanica) {
          showAlert('Campo Requerido', 'Por favor ingrese el número de Tecnomecánica', 'warning');
          return false;
        }
        if (!formData.capacidad_carga) {
          showAlert('Campo Requerido', 'Por favor ingrese la capacidad de carga', 'warning');
          return false;
        }
        if (!formData.latitud) {
          showAlert('Campo Requerido', 'Por favor ingrese la latitud', 'warning');
          return false;
        }
        if (!formData.longitud) {
          showAlert('Campo Requerido', 'Por favor ingrese la longitud', 'warning');
          return false;
        }
        if (!formData.vencimiento_soat) {
          showAlert('Campo Requerido', 'Por favor seleccione la fecha de vencimiento del SOAT', 'warning');
          return false;
        }
        if (!formData.vencimiento_tecnomecanica) {
          showAlert('Campo Requerido', 'Por favor seleccione la fecha de vencimiento de la Tecnomecánica', 'warning');
          return false;
        }
        break;
      case 3:
        // Validación de contraseña y términos
        if (!formData.password) {
          showAlert('Campo Requerido', 'Por favor ingrese una contraseña', 'warning');
          return false;
        }
        if (!formData.confirmPassword) {
          showAlert('Campo Requerido', 'Por favor confirme su contraseña', 'warning');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          showAlert('Error', 'Las contraseñas no coinciden', 'danger');
          return false;
        }
        if (formData.password.length < 8) {
          showAlert('Error', 'La contraseña debe tener al menos 8 caracteres', 'warning');
          return false;
        }
        if (!formData.termsAccepted) {
          showAlert('Error', 'Debe aceptar los términos y condiciones', 'danger');
          return false;
        }
        break;
      default:
        return false;
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
  datePicker: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF', // fondo blanco para el selector de fechas
    borderRadius: 8,
  },
  datePickerControl: {
    backgroundColor: '#FFFFFF', // fondo blanco para el cuadro del selector
    borderRadius: 8,
    marginBottom: 16,
  },
});

export default RegisterDeliveryScreen;