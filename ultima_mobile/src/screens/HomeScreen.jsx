import React, { useState } from 'react';
import { StyleSheet, Image, Alert } from 'react-native';
import { Button, Text, Layout, Input, Icon, Spinner } from '@ui-kitten/components';

function HomeScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const EmailIcon = (props) => (
    <Icon {...props} name='email'/>
  );

  const LockIcon = (props) => (
    <Icon {...props} name='lock'/>
  );

  const PasswordIcon = (props) => (
    <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'} onPress={toggleSecureEntry}/>
  );

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor complete todos los campos');
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
      Alert.alert(
        'Error de inicio de sesión',
        'Credenciales incorrectas. Por favor intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={styles.container}>
      <Layout style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text category="h1" style={styles.title}>¡Bienvenido!</Text>
        <Text category="s1" style={styles.subtitle}>Inicia sesión para continuar</Text>
      </Layout>

      <Layout style={styles.formContainer}>
        <Input
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          accessoryLeft={EmailIcon}
          disabled={loading}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          placeholder="Contraseña"
          value={password}
          secureTextEntry={secureTextEntry}
          onChangeText={setPassword}
          accessoryRight={PasswordIcon}
          accessoryLeft={LockIcon}
          style={styles.input}
          disabled={loading}
        />

        <Button 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
          accessoryLeft={loading ? (props) => <Spinner size="small"/> : null}>
          {loading ? 'CARGANDO' : 'INICIAR SESIÓN'}
        </Button>

        <Button
          appearance="ghost"
          status="basic"
          style={styles.forgotPassword}
          disabled={loading}>
          ¿Olvidaste tu contraseña?
        </Button>
      </Layout>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 50, // Añadimos este marginTop
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#8F9BB3',
    marginBottom: 30,
  },
  formContainer: {
    flex: 2,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  input: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e8ecef',
  },
  loginButton: {
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 15,
    backgroundImage: 'linear-gradient(135deg, #639aff 0%, #5468ff 100%)',
  },
  forgotPassword: {
    marginTop: 10,
  },
});

export default HomeScreen;
