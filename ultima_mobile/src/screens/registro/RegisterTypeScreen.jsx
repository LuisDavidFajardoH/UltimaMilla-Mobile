import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text, Layout, Icon } from '@ui-kitten/components';

const BusinessIcon = (props) => (
  <Icon {...props} name='briefcase-outline'/>
);

const DeliveryIcon = (props) => (
  <Icon {...props} name='car-outline'/>
);

export const RegisterTypeScreen = ({ navigation }) => {
  return (
    <Layout style={styles.container}>
      <Layout style={styles.content}>
        <Text category='h1' style={styles.title}>Registro</Text>
        <Text category='s1' style={styles.subtitle}>
          Selecciona el tipo de cuenta que deseas crear
        </Text>

        <Button
          style={styles.optionButton}
          size='giant'
          accessoryLeft={BusinessIcon}
          onPress={() => navigation.navigate('RegisterBusiness')}>
          Registrar Sucursal
        </Button>

        <Button
          style={styles.optionButton}
          size='giant'
          appearance='outline'
          accessoryLeft={DeliveryIcon}
          onPress={() => navigation.navigate('RegisterDelivery')}>
          Registrar Repartidor
        </Button>
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#8F9BB3',
  },
  optionButton: {
    marginVertical: 8,
    borderRadius: 12,
  },
});

export default RegisterTypeScreen;
