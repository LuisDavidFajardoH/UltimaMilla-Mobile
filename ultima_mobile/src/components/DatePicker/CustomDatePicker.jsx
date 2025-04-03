import React, { useState } from 'react';
import { StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Layout, Text, Icon } from '@ui-kitten/components';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

const CustomDatePicker = ({ 
  date = new Date(), 
  onSelect = () => {}, 
  max = new Date(2050, 11, 31),
  min = new Date(1900, 0, 1),
  label = 'Fecha', 
  style = {} 
}) => {
  const [selectedDate, setSelectedDate] = useState(date);
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, newDate) => {
    if (event.type === 'set' && newDate) {
      setSelectedDate(newDate);
      onSelect(newDate);
    }
    setShowPicker(false);
  };

  const openPickerAndroid = () => {
    DateTimePickerAndroid.open({
      value: selectedDate,
      mode: 'date',
      display: 'default',
      maximumDate: max,
      minimumDate: min,
      onChange: handleDateChange,
    });
  };

  const onPressPicker = () => {
    if (Platform.OS === 'android') {
      openPickerAndroid();
    } else {
      setShowPicker(true);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout style={[styles.container, style]}>
      <Text category="label" style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.button} onPress={onPressPicker}>
        <Text style={styles.buttonText}>{formatDate(selectedDate)}</Text>
        <Icon name="calendar-outline" style={styles.icon} fill="#8F9BB3" />
      </TouchableOpacity>
      {showPicker && Platform.OS === 'ios' && (
        <DateTimePicker
          testID="dateTimePicker"
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={max}
          minimumDate={min}
        />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    padding: 8,
  },
  label: {
    marginBottom: 6,
    color: '#2E3A59',
    fontWeight: '600',
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E9F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    color: '#2E3A59',
  },
  icon: {
    width: 22,
    height: 22,
  },
});

export default CustomDatePicker;
