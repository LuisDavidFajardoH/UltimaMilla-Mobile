import React, { useState } from 'react';
import { StyleSheet, Image, Alert, KeyboardAvoidingView, ScrollView, Platform, Linking } from 'react-native';
import { Button, Text, Layout, Input, Icon, Spinner } from '@ui-kitten/components';
import { CustomAlert } from '../components/Alert/CustomAlert';

function HomeScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    status: 'primary'
  });

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const EmailIcon = (props) => (
    <Icon {...props} name='email' style={[props.style, { tintColor: emailFocused ? '#FF5E70' : '#8F9BB3' }]}/>
  );

  const LockIcon = (props) => (
    <Icon {...props} name='lock' style={[props.style, { tintColor: passwordFocused ? '#FF5E70' : '#8F9BB3' }]}/>
  );

  const PasswordIcon = (props) => (
    <Icon {...props} 
      name={secureTextEntry ? 'eye-off' : 'eye'} 
      style={[props.style, { tintColor: passwordFocused ? '#FF5E70' : '#8F9BB3' }]}
      onPress={toggleSecureEntry}
    />
  );

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

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Error', 'Por favor complete todos los campos', 'danger');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://api.99envios.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const userData = await response.json();

      if (!response.ok) {
        throw new Error(userData.message || 'Error en el servidor');
      }

      // Navegar según el rol
      switch(userData.user.id_rol) {
        case 1:
          navigation.navigate('Admin');
          break;
        case 2:
        case 4:
          navigation.navigate('Conductor');
          break;
        case 3:
          navigation.navigate('Tablero');
          break;
        default:
          Alert.alert('Error', 'Rol no reconocido');
      }
    } catch (error) {
      console.error('Error details:', error);
      showAlert(
        'Error de inicio de sesión',
        'Credenciales incorrectas. Por favor intente nuevamente.',
        'danger'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Linking.openURL('https://api.99envios.app/formulario-recuperar-contrasenia');
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Layout style={styles.container}>
          <Layout style={styles.topSection}>
            <Layout style={styles.logoContainer}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text category="h1" style={styles.title}>¡Hola! 👋</Text>
              <Text category="s1" style={styles.subtitle}>Gestiona tus envíos de forma fácil y segura</Text>
            </Layout>
          </Layout>

          <Layout style={styles.bottomSection}>
            <Layout style={styles.formContainer}>
              <Text category="h6" style={styles.sectionTitle}>Iniciar Sesión</Text>
              
              <Input
                placeholder="usuario@ejemplo.com"
                value={email}
                onChangeText={setEmail}
                style={[styles.input, styles.emailInput]}
                accessoryLeft={EmailIcon}
                disabled={loading}
                keyboardType="email-address"
                autoCapitalize="none"
                label="Correo electrónico"
                caption={email ? '' : 'Ingresa tu correo registrado'}
                status='basic'
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />

              <Input
                placeholder="••••••••"
                value={password}
                secureTextEntry={secureTextEntry}
                onChangeText={setPassword}
                accessoryRight={PasswordIcon}
                accessoryLeft={LockIcon}
                style={[styles.input, styles.passwordInput]}
                disabled={loading}
                label="Contraseña"
                caption={password ? '' : 'Ingresa tu contraseña'}
                status='basic'
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />

              <Button 
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={loading}
                accessoryLeft={loading ? (props) => <Spinner size="small"/> : null}
                size="large">
                {loading ? 'INICIANDO SESIÓN...' : 'CONTINUAR'}
              </Button>

              <Button
                appearance="ghost"
                status="basic"
                style={styles.forgotPassword}
                onPress={handleForgotPassword}>
                ¿Olvidaste tu contraseña? Recupérala aquí
              </Button>

              <Layout style={styles.registerContainer}>
                <Text appearance="hint">¿No tienes una cuenta?</Text>
                <Button
                  appearance="ghost"
                  status="primary"
                  onPress={() => navigation.navigate('Register')}
                  style={styles.registerButton}>
                  Regístrate aquí
                </Button>
              </Layout>

              <Layout style={styles.footer}>
                <Text appearance="hint" category="c1" style={styles.footerText}>
                  © 2024 99 Envíos - Todos los derechos reservados
                </Text>
              </Layout>
            </Layout>
          </Layout>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  topSection: {
    flex: 0.4,
    backgroundColor: '#f8f9fc',
    justifyContent: 'center',
  },
  bottomSection: {
    flex: 0.6,
    backgroundColor: 'transparent',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#0086FF',
    fontSize: 28,
  },
  subtitle: {
    color: '#8F9BB3',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontSize: 14,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16, // Añadir padding extra en iOS
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.84,
    elevation: 5,
  },
  sectionTitle: {
    marginBottom: 24,
    color: '#2E3A59',
    fontWeight: '600',
    fontSize: 20,
  },
  input: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#E4E9F2',
  },
  emailInput: {
    marginBottom: 16,
  },
  passwordInput: {
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#639aff',
    borderColor: 'transparent',
    padding: 12,
  },
  forgotPassword: {
    marginTop: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 16,
  },
  registerButton: {
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 12,
    color: '#8F9BB3',
  },
});

export default HomeScreen;
