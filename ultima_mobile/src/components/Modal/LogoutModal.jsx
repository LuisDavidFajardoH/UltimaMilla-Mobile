import React, { useEffect } from 'react';
import { StyleSheet, Modal as RNModal, TouchableWithoutFeedback, View, Animated } from 'react-native';
import { Card, Text, Button, Layout, Icon } from '@ui-kitten/components';

export const LogoutModal = ({ visible, onConfirm, onCancel }) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 70,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  return (
    <RNModal
      visible={visible}
      transparent
      onRequestClose={onCancel}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <Animated.View style={[styles.modalContainer, {
              transform: [{ scale: scaleAnim }]
            }]}>
              <Card disabled style={styles.card}>
                <Layout style={styles.iconContainer}>
                  <Icon
                    name='log-out'
                    fill='#FF3D71'
                    style={styles.icon}
                  />
                </Layout>
                <Text category='h5' style={styles.title}>Cerrar Sesión</Text>
                <Text style={styles.message}>
                  ¿Está seguro que desea cerrar su sesión actual? Deberá iniciar sesión nuevamente para acceder.
                </Text>
                <Layout style={styles.buttonContainer}>
                  <Button
                    size='large'
                    style={[styles.button, styles.cancelButton]}
                    appearance='ghost'
                    status='basic'
                    onPress={onCancel}>
                    Cancelar
                  </Button>
                  <Button
                    size='large'
                    style={[styles.button, styles.logoutButton]}
                    status='danger'
                    onPress={onConfirm}>
                    Cerrar Sesión
                  </Button>
                </Layout>
              </Card>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  card: {
    borderRadius: 20,
    backgroundColor: 'white',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 61, 113, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  icon: {
    width: 40,
    height: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#2E3A59',
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#8F9BB3',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  logoutButton: {
    backgroundColor: '#FF3D71',
  },
});
