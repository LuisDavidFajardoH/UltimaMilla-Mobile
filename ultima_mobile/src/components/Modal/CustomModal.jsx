import React from 'react';
import { StyleSheet, Modal, View, TouchableWithoutFeedback } from 'react-native';

const CustomModal = ({ 
  visible = false,
  onBackdropPress = () => {},
  children = null,
  backdropStyle = {},
  contentStyle = {}
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onBackdropPress}
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={onBackdropPress}>
        <View style={[styles.backdrop, backdropStyle]}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={[styles.content, contentStyle]}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    minWidth: 300,
  }
});

export default CustomModal;
