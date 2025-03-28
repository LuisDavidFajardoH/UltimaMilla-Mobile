import React, { useState } from 'react';
import { StyleSheet, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Button, Text, Layout, Input, TopNavigation, TopNavigationAction, Icon, SelectItem } from '@ui-kitten/components';
import CustomSelect from '../../components/Select/select';

const tiposIdentificacion = [
  { id: 'CC', text: 'Cédula de Ciudadanía' },
  { id: 'CE', text: 'Cédula de Extranjería' },
  { id: 'NIT', text: 'NIT' },
];

const ciudades = [
  { id: '1', text: 'Bogotá' },
  { id: '2', text: 'Medellín' },
  { id: '3', text: 'Cali' },
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
        options={ciudades.map(c => ({ label: c.text, value: c.id }))}
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
        value={tiposIdentificacion.find(t => t.id === formData.tipo_identificacion)?.text}
        onSelect={(item) => setFormData({...formData, tipo_identificacion: item.id})}
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

  const renderButtons = () => (
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
        onPress={() => setCurrentStep(prev => prev + 1)}>
        {currentStep === 3 ? 'Finalizar' : 'Siguiente'}
      </Button>
    </Layout>
  );

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
        {renderButtons()}
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
});

export default RegisterBusinessScreen;
