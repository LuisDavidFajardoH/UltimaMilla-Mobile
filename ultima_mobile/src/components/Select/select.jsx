import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Text, Layout, Icon, Button } from '@ui-kitten/components'; // Import Button

const CustomSelect = React.memo(({
  label,
  placeholder = 'Seleccione una opción',
  value,
  onSelect,
  options = [],
  style,
  status,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);

  const selectedValue = options.find(option => option.value === value)?.label || placeholder;

  return (
    <Layout style={[styles.container, style]}>
      {label && (
        <Text
          category='label'
          style={[
            styles.label,
            status === 'danger' && styles.labelDanger
          ]}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setVisible(true)}
        disabled={disabled}
      >
        <Text style={styles.selectText}>{selectedValue}</Text>
        <Icon name="chevron-down-outline" style={styles.icon} fill="#8F9BB3" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={`${option.value}-${index}`}
                  style={styles.option}
                  onPress={() => {
                    onSelect(option.value);
                    setVisible(false);
                  }}
                >
                  <Text>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button appearance='ghost' onPress={() => setVisible(false)}>
              Cerrar
            </Button>
          </View>
        </View>
      </Modal>
    </Layout>
  );
});

CustomSelect.displayName = 'CustomSelect';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  label: {
    color: '#2E3A59',
    marginBottom: 4,
    fontWeight: '500',
  },
  labelDanger: {
    color: '#FF3D71',
  },
  selectButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E9F2',
  },
  selectText: {
    color: '#2E3A59',
    fontSize: 16,
  },
  icon: {
    width: 24,
    height: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    maxHeight: '60%',
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F2',
  },
});

export default CustomSelect;
