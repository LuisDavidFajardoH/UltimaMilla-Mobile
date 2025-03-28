import React, { useState } from 'react';
import { StyleSheet, Platform, ScrollView, KeyboardAvoidingView, Alert, Linking } from 'react-native';
import { Button, Text, Layout, Input, TopNavigation, TopNavigationAction, Icon, CheckBox } from '@ui-kitten/components';
import CustomSelect from '../../components/Select/select';
import Ciudades from '../../ciudades/ciudades';

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

export const RegisterBusinessScreen = ({ navigation }) => {
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
  });

  const BackIcon = (props) => (
    <Icon {...props} name='arrow-back'/>
  );

  const renderBackAction = () => (
    <TopNavigationAction 
      icon={BackIcon} 
      onPress={navigation.goBack}
    />
  );

  const renderStep1 = () => (
    <Layout style={styles.stepContainer}>
      <Text category='h5' style={styles.stepTitle}>Información del Negocio</Text>
      <Text category='p1' style={styles.stepDescription}>
        Cuéntanos sobre ti y tu negocio
      </Text>

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

      <Input
        label='Nombre del Negocio'
        placeholder='Ingresa el nombre de tu negocio'
        value={formData.nombre_sucursal}
        onChangeText={value => setFormData({...formData, nombre_sucursal: value})}
        style={styles.input}
      />

      <Input
        label='Dirección del Negocio'
        placeholder='Ingresa la dirección'
        value={formData.direccion_negocio}
        onChangeText={value => setFormData({...formData, direccion_negocio: value})}
        style={styles.input}
      />

      <CustomSelect
        label='Ciudad'
        placeholder='Selecciona tu ciudad'
        value={formData.ciudad}
        onSelect={(value) => setFormData({...formData, ciudad: value})}
        options={Ciudades}
      />

      <Text category='h6' style={styles.sectionTitle}>Información del Negocio</Text>

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

      <Text category='h6' style={styles.sectionTitle}>Información Personal</Text>

      <Input
        label='Nombre'
        placeholder='Ingresa tu nombre'
        value={formData.nombre}
        onChangeText={value => setFormData({...formData, nombre: value})}
        style={styles.input}
      />

      <Input
        label='Apellido'
        placeholder='Ingresa tu apellido'
        value={formData.apellido}
        onChangeText={value => setFormData({...formData, apellido: value})}
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
        label='Número de Identificación'
        placeholder='Ingresa tu número de identificación'
        value={formData.num_identificacion}
        onChangeText={value => setFormData({...formData, num_identificacion: value})}
        keyboardType='numeric'
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
        label='Teléfono'
        placeholder='Ingresa tu número de teléfono'
        value={formData.telefono}
        onChangeText={value => setFormData({...formData, telefono: value})}
        keyboardType='phone-pad'
        style={styles.input}
      />
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
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (!formData.termsAccepted) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones');
      return;
    }

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
      console.log('API Response:', data); // Agregar este log

      if (!response.ok) {
        // Mostrar el mensaje de error específico de la API
        const errorMessage = data.message || 
                           (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) ||
                           'Error en el registro';
        
        console.error('Error Response:', {
          status: response.status,
          data: data,
          message: errorMessage
        });
        
        throw new Error(errorMessage);
      }

      Alert.alert(
        '¡Registro Exitoso!',
        'Tu cuenta ha sido creada correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('99 Envios'),
          },
        ]
      );
    } catch (error) {
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        originalError: error
      });
      
      Alert.alert(
        'Error',
        `Error al registrar: ${error.message}. Por favor intente nuevamente.`
      );
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopNavigation
        title='Registro de Sucursal'
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
});

export default RegisterBusinessScreen;
