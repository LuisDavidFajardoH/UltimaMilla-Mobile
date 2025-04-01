import React, { useEffect } from 'react';
import { StyleSheet, Image, Platform, View, Animated, Alert } from 'react-native';
import { Button, Text, Layout, Icon, Card } from '@ui-kitten/components';

const BusinessIcon = (props) => (
  <Layout style={styles.iconContainer}>
    <Icon {...props} name='briefcase-outline' style={styles.icon}/>
    <Text category='h6' style={styles.iconTitle}>Sucursal</Text>
  </Layout>
);

const DeliveryIcon = (props) => (
  <Layout style={styles.iconContainer}>
    <Icon {...props} name='car-outline' style={styles.icon}/>
    <Text category='h6' style={styles.iconTitle}>Repartidor</Text>
  </Layout>
);

const DecorativeLines = () => {
  const translateY1 = new Animated.Value(0);
  const scale1 = new Animated.Value(1);
  const translateY2 = new Animated.Value(0);
  const scale2 = new Animated.Value(1);
  const translateY3 = new Animated.Value(0);
  const scale3 = new Animated.Value(1);

  useEffect(() => {
    const animate = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY1, {
              toValue: 40,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(scale1, {
              toValue: 1.3,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY1, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(scale1, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY2, {
              toValue: -40,
              duration: 2500,
              useNativeDriver: true,
            }),
            Animated.timing(scale2, {
              toValue: 0.7,
              duration: 1250,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY2, {
              toValue: 0,
              duration: 2500,
              useNativeDriver: true,
            }),
            Animated.timing(scale2, {
              toValue: 1,
              duration: 1250,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(translateY3, {
              toValue: 30,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(scale3, {
              toValue: 1.2,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY3, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(scale3, {
              toValue: 1,
              duration: 1500,
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
          styles.decorativeCircle1, 
          { 
            transform: [
              { translateY: translateY1 },
              { scale: scale1 }
            ] 
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.decorativeCircle2, 
          { 
            transform: [
              { translateY: translateY2 },
              { scale: scale2 }
            ] 
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.decorativeCircle3, 
          { 
            transform: [
              { translateY: translateY3 },
              { scale: scale3 }
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
        <Card style={[styles.optionCard, styles.leftCard]}>
          <Layout style={styles.cardInnerContainer}>
            <Layout style={styles.iconTitleContainer}>
              <BusinessIcon/>
              <Button 
                size='medium'
                style={styles.cardButton} 
                status='primary'
                onPress={() => navigation.navigate('RegisterBusiness')}>
                Ir
              </Button>
            </Layout>
            <Layout style={styles.cardContent}>
              <Text style={styles.cardDescription}>
                Gestiona envíos y entregas eficientemente
              </Text>
            </Layout>
          </Layout>
        </Card>

        <Card style={[styles.optionCard, styles.rightCard]}>
          <Layout style={styles.cardInnerContainer}>
            <Layout style={styles.iconTitleContainer}>
              <DeliveryIcon/>
              <Button 
                size='medium'
                style={styles.cardButton}
                status='primary'
                onPress={() => navigation.navigate('RegisterDelivery')}>
                Ir
              </Button>
            </Layout>
            <Layout style={styles.cardContent}>
              <Text style={styles.cardDescription}>
                Únete y genera ingresos extra
              </Text>
            </Layout>
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
    justifyContent: 'space-between',
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
    color: '#8F9BB3',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  cardsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    flex: 1,
    marginVertical: 'auto',
  },
  optionCard: {
    marginVertical: 8,
    marginHorizontal: 0,
    borderRadius: 16,
    padding: 12,
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftCard: {
    marginBottom: 8,
  },
  rightCard: {
    marginTop: 8,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 134, 255, 0.1)',
    borderRadius: 12,
    height: 42,
    paddingHorizontal: 24,
    gap: 12,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#0086FF',
  },
  iconTitle: {
    color: '#0086FF',
    fontWeight: '600',
    fontSize: 16,
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
  decorativeCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 94, 112, 0.08)',
    top: '35%',
    left: -50,
    borderRadius: 75,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 94, 112, 0.05)',
    top: '55%',
    right: -30,
    borderRadius: 60,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 180,
    height: 180,
    backgroundColor: 'rgba(0, 134, 255, 0.08)',
    bottom: '15%',
    right: -60,
    borderRadius: 90,
  },
  cardTitle: {
    color: '#2E3A59',
    fontWeight: '600',
    fontSize: 20,
    marginTop: 0,
  },
  cardDescription: {
    color: '#8F9BB3',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardButton: {
    borderRadius: 12,
    minWidth: 80,
  },
  cardInnerContainer: {
    backgroundColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  iconTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: 12,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  footerText: {
    color: '#8F9BB3',
    marginBottom: 8,
  },
});

export default RegisterTypeScreen;
