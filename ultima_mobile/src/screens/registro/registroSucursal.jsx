import React, { useState } from 'react';
import { StyleSheet, Platform, ScrollView, Alert, KeyboardAvoidingView } from 'react-native';
import { Button, Text, Layout, Input, Select, SelectItem, Radio, RadioGroup, CheckBox, Icon } from '@ui-kitten/components';

const productos = [
  { id: '1', text: 'Bisuteria' },
  { id: '2', text: 'Ropa Deportiva' },
  { id: '3', text: 'Vaporizadores' },
  { id: '4', text: 'Mascotas' },
  { id: '5', text: 'Moda' },
  { id: '6', text: 'Tecnología' },
];

const ciudades = [
  { id: '1', text: 'Bogotá' },
  { id: '2', text: 'Medellín' },
  { id: '3', text: 'Cali' },
];

const paises = [
  { id: '1', text: 'Colombia' },
  { id: '2', text: 'México' }
];

const CustomSelect = React.memo(({ 
  label = '', 
  value = '', 
  onSelect = () => {}, 
  placeholder = 'Seleccione una opción', 
  data = [] 
}) => {
  const displayValue = React.useMemo(() => value || placeholder, [value, placeholder]);

  return (
    <Layout style={styles.selectContainer}>
      {label && <Text category='label' style={styles.selectLabel}>{label}</Text>}
      <Select
        value={displayValue}
        onSelect={onSelect}
        style={styles.selectInput}>
        {data.map(item => (
          <SelectItem key={item.id} title={item.text} />
        ))}
      </Select>
    </Layout>
  );
});

CustomSelect.displayName = 'CustomSelect';

export const RegisterBusinessScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    id_rol: 3,
    pais: '',
    nombre_sucursal: '',
    direccion: '',
    ciudad: '',
    nombre: '',
    apellido: '',
    tipo_identificacion: '',
    num_identificacion: '',
    email: '',
    telefono: '',
    producto: '',
    cantidad: '1',
    password: '',
    password_confirmation: '',
    terminosCondiciones: false
  });

  const handleSubmit = async () => {
    try {
      // Validar campos requeridos
      if (!formData.nombre_sucursal || !formData.direccion || !formData.ciudad || 
          !formData.nombre || !formData.apellido || !formData.email || 
          !formData.password || !formData.password_confirmation) {
        Alert.alert('Error', 'Por favor complete todos los campos requeridos');
        return;
      }

      if (!formData.terminosCondiciones) {
        Alert.alert('Error', 'Debe aceptar los términos y condiciones');
        return;
      }

      const response = await fetch('https://api.99envios.app/api/auth/register_sucursal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      Alert.alert(
        'Registro Exitoso', 
        'Tu cuenta ha sido creada correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('99 Envios') // Redirigir al login
          }
        ]
      );

    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Hubo un error al crear la cuenta'
      );
    }
  };

  const HeaderIcon = (props) => (
    <Icon {...props} name='arrow-back' onPress={() => navigation.goBack()}/>
  );

  const renderHeader = () => (
    <Layout style={styles.header}>
      <Button 
        appearance='ghost' 
        accessoryLeft={HeaderIcon}
        onPress={() => navigation.goBack()}
      />
      <Layout style={styles.progressContainer}>
        <Layout style={styles.progressBar}>
          <Layout style={[styles.progressFill, { width: '25%' }]} />
        </Layout>
      </Layout>
      <Text category='h5' style={styles.headerTitle}>Registro de Sucursal</Text>
    </Layout>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Layout style={styles.container}>
        {renderHeader()}
        <ScrollView style={styles.scrollView} bounces={false}>
          <Layout style={styles.formContainer}>
            <Text category='s1' style={styles.sectionTitle}>Información del Negocio</Text>
            
            <CustomSelect
              label='País'
              value={paises.find(p => p.id === formData.pais)?.text}
              onSelect={index => {
                const selectedCountry = paises[index.row];
                setFormData(prev => ({...prev, pais: selectedCountry.id}));
              }}
              data={paises}
            />

            <Input
              label='Nombre del Negocio'
              placeholder='Ingrese el nombre de su negocio'
              value={formData.nombre_sucursal}
              onChangeText={value => setFormData({...formData, nombre_sucursal: value})}
              style={styles.input}
            />

            <Input
              label='Dirección'
              placeholder='Ingrese la dirección'
              value={formData.direccion}
              onChangeText={value => setFormData({...formData, direccion: value})}
              style={styles.input}
            />

            <CustomSelect
              label='Ciudad'
              value={ciudades.find(c => c.id === formData.ciudad)?.text}
              onSelect={(item) => setFormData({...formData, ciudad: item.id})}
              placeholder='Seleccione una ciudad'
              data={ciudades}
            />

            <Text category='s1' style={styles.sectionTitle}>Información Personal</Text>
            
            {/* ... Add personal information inputs ... */}

            <Text category='s1' style={styles.sectionTitle}>Información del Producto</Text>
            
            <CustomSelect
              label='Tipo de Producto'
              value={productos.find(p => p.id === formData.producto)?.text}
              onSelect={(item) => setFormData({...formData, producto: item.id})}
              placeholder='Seleccione un producto'
              data={productos}
            />

            <RadioGroup
              selectedIndex={parseInt(formData.cantidad) - 1}
              onChange={index => setFormData({...formData, cantidad: (index + 1).toString()})}
              style={styles.radioGroup}>
              <Radio>1 a 100 envíos</Radio>
              <Radio>Entre 100 y 4.000 envíos</Radio>
              <Radio>Más de 4.000 envíos</Radio>
            </RadioGroup>

            <CheckBox
              checked={formData.terminosCondiciones}
              onChange={checked => setFormData({...formData, terminosCondiciones: checked})}
              style={styles.checkbox}>
              Acepto términos y condiciones
            </CheckBox>

            <Button 
              style={styles.submitButton}
              onPress={handleSubmit}
              size='large'>
              REGISTRAR SUCURSAL
            </Button>
          </Layout>
        </ScrollView>
      </Layout>
    </KeyboardAvoidingView>
  );
};

export default RegisterBusinessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F2',
  },
  progressContainer: {
    marginVertical: 16,
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
  headerTitle: {
    textAlign: 'center',
    marginTop: 8,
    color: '#2E3A59',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    marginVertical: 16,
    color: '#2E3A59',
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  radioGroup: {
    marginBottom: 24,
  },
  checkbox: {
    marginBottom: 24,
  },
  submitButton: {
    marginVertical: 24,
  },
  selectContainer: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  selectLabel: {
    color: '#2E3A59',
    marginBottom: 4,
    fontWeight: '500',
  },
  selectInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#E4E9F2',
  },
});
