import React from 'react';
import { StyleSheet, Modal as RNModal, Pressable } from 'react-native';
import { Card, Text, Button, Layout } from '@ui-kitten/components';

export const CustomAlert = ({ 
  visible = false, 
  title = '', 
  message = '', 
  onBackdropPress = () => {}, 
  confirmText = 'OK',
}) => {
  return (
    <RNModal
      transparent
      visible={visible}
      onRequestClose={onBackdropPress}
      animationType="fade"
    >
      <Pressable 
        style={styles.backdrop} 
        onPress={onBackdropPress}
      >
        <Pressable>
          <Card disabled style={styles.card}>
            <Text category='h6' style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <Layout style={styles.buttonContainer}>
              <Button 
                style={styles.button}
                onPress={onBackdropPress}
              >
                {confirmText}
              </Button>
            </Layout>
          </Card>
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 12,
    margin: 24,
    width: '80%',
    maxWidth: 400,
    borderTopWidth: 4,
    borderTopColor: '#FF5E70', // Línea superior roja
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  message: {
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  button: {
    minWidth: 120,
    backgroundColor: '#0086FF', // Botón azul
    borderColor: '#0086FF',
  },
});
