import React, { useEffect } from 'react';
import { StyleSheet, Image, Platform, View, Animated } from 'react-native';
import { Button, Text, Layout, Icon, Card } from '@ui-kitten/components';

const BusinessIcon = (props) => (
  <Layout style={styles.iconContainer}>
    <Icon {...props} name='briefcase-outline' style={styles.icon}/>
  </Layout>
);

const DeliveryIcon = (props) => (
  <Layout style={styles.iconContainer}>
    <Icon {...props} name='car-outline' style={styles.icon}/>
  </Layout>
);

const DecorativeLines = () => {
  const translateY1 = new Animated.Value(0);
  const scaleY1 = new Animated.Value(1);
  const translateY2 = new Animated.Value(0);
  const scaleY2 = new Animated.Value(1);

  useEffect(() => {
    const animate = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY1, {
              toValue: 30,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleY1, {
              toValue: 1.2,
              duration: 750,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY1, {
              toValue: -30,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleY1, {
              toValue: 0.8,
              duration: 750,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY1, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleY1, {
              toValue: 1,
              duration: 750,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY2, {
              toValue: -30,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleY2, {
              toValue: 0.8,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY2, {
              toValue: 30,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleY2, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY2, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleY2, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => animate());
    };

    animate();
  }, []);

  return (
    <View style={styles.decorativeContainer}>
      <Animated.View 
        style={[
          styles.decorativeLine1, 
          { 
            transform: [
              { translateY: translateY1 },
              { scaleY: scaleY1 },
              { rotate: '-10deg' }
            ] 
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.decorativeLine2, 
          { 
            transform: [
              { translateY: translateY2 },
              { scaleY: scaleY2 },
              { rotate: '8deg' }
            ] 
          }
        ]} 
      />
    </View>
  );
};

export const RegisterTypeScreen = ({ navigation }) => {
  return (
    <Layout style={styles.container}>
      <DecorativeLines />
      <Layout style={styles.header}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text category='h5' style={styles.welcomeText}>¡Únete a la comunidad!</Text>
        <Text category='h2' style={styles.title}>Elige tu perfil</Text>
        <Text category='s1' style={styles.subtitle}>
          Selecciona el tipo de cuenta que mejor se adapte a tus necesidades
        </Text>
      </Layout>

      <Layout style={styles.cardsContainer}>
        <Card style={[styles.optionCard, styles.leftCard]} onPress={() => navigation.navigate('RegisterBusiness')}>
          <BusinessIcon/>
          <Layout style={styles.cardContent}>
            <Text category='h6' style={styles.cardTitle}>Sucursal</Text>
            <Text style={styles.cardDescription}>
              Gestiona envíos y entregas eficientemente
            </Text>
            <Button 
              size='small'
              style={styles.cardButton} 
              status='primary'
              children={'Registrar Sucursal'}
            />
          </Layout>
        </Card>

        <Card style={[styles.optionCard, styles.rightCard]} onPress={() => navigation.navigate('RegisterDelivery')}>
          <DeliveryIcon/>
          <Layout style={styles.cardContent}>
            <Text category='h6' style={styles.cardTitle}>Repartidor</Text>
            <Text style={styles.cardDescription}>
              Únete y genera ingresos extra
            </Text>
            <Button 
              size='small'
              style={styles.cardButton} 
              appearance='outline' 
              status='primary'
              children={'Registrar Repartidor'}
            />
          </Layout>
        </Card>
      </Layout>

      <Layout style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
        <Button appearance='ghost' status='primary' onPress={() => navigation.goBack()}>
          Inicia sesión aquí
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 20,
  },
  welcomeText: {
    color: '#0086FF',
    fontWeight: '600',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
    fontSize: 32,
    color: '#2E3A59',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#8F9BB3',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  optionCard: {
    flex: 1,
    margin: 8,
    borderRadius: 16,
    padding: 16,
    maxWidth: '47%', // Aumentado de 45% a 47%
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden', // Importante para el elemento decorativo
    backgroundColor: '#fff',
    zIndex: 1,
  },
  leftCard: {
    marginRight: 4,
  },
  rightCard: {
    marginLeft: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 134, 255, 0.1)', // Cambiado a azul con opacidad
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: '#0086FF', // Cambiado a azul
  },
  cardContent: {
    backgroundColor: 'transparent',
  },
  decorativeContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  decorativeLine1: {
    position: 'absolute',
    width: '150%',
    height: 3,
    backgroundColor: 'rgba(255, 94, 112, 0.15)',
    top: '40%',
    left: -100,
    borderRadius: 1.5,
  },
  decorativeLine2: {
    position: 'absolute',
    width: '150%',
    height: 3,
    backgroundColor: 'rgba(255, 94, 112, 0.1)',
    top: '60%',
    right: -100,
    borderRadius: 1.5,
  },
  cardTitle: {
    marginBottom: 8,
    color: '#2E3A59',
    fontWeight: '600',
    fontSize: 18,
  },
  cardDescription: {
    color: '#8F9BB3',
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 18,
    borderLeftWidth: 2,
    borderLeftColor: '#FF5E70',
    paddingLeft: 8,
  },
  cardButton: {
    borderRadius: 8,
    minHeight: 40,
    paddingHorizontal: 8,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 'auto',
  },
  footerText: {
    color: '#8F9BB3',
    marginBottom: 8,
  },
});

export default RegisterTypeScreen;
