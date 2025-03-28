import React from 'react';
import { StyleSheet } from 'react-native';
import { Layout, Text, Datepicker } from '@ui-kitten/components';

const CustomDatePicker = ({ 
  date, 
  onSelect, 
  max, 
  min, 
  label, 
  style 
}) => (
  <Layout style={[styles.datePickerWrapper, style]}>
    <Text category='label' style={styles.dateLabel}>{label}</Text>
    <Datepicker
      date={date}
      onSelect={onSelect}
      max={max}
      min={min}
      style={styles.datePicker}
      renderHeader={() => (
        <Text category='s1'>{date.toLocaleDateString()}</Text>
      )}
    />
  </Layout>
);

const styles = StyleSheet.create({
  datePickerWrapper: {
    backgroundColor: 'transparent',
  },
  dateLabel: {
    marginBottom: 4,
    color: '#2E3A59',
  },
  datePicker: {
    marginBottom: 8,
  },
});

export default CustomDatePicker;
