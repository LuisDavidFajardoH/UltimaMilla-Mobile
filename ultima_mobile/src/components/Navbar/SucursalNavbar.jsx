import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Layout, Text, Icon, Avatar } from '@ui-kitten/components';
import { Sidebar } from '../Sidebar/Sidebar';

export const SucursalNavbar = ({ 
  navigation,
  rol_id = '3',
  title = 'Tablero de Control',
  userName = 'Usuario',
  onProfilePress,
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Layout style={styles.container}>
      <Layout style={styles.content}>
        <TouchableOpacity 
          onPress={() => setSidebarOpen(true)}
          style={styles.menuButton}
        >
          <Icon
            name='menu-outline'
            fill='#2E3A59'
            style={styles.icon}
          />
        </TouchableOpacity>

        <Layout style={styles.titleContainer}>
          <Text category='h6' style={styles.title}>{title}</Text>
        </Layout>

        <TouchableOpacity 
          onPress={onProfilePress}
          style={styles.profileButton}
        >
          <Layout style={styles.profileInfo}>
            <Icon
              name='person-outline'
              fill='#8F9BB3'
              style={styles.profileIcon}
            />
            <Text category='s1' style={styles.userName}>{userName}</Text>
          </Layout>
        </TouchableOpacity>
      </Layout>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigation={navigation}
        rol_id={rol_id}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F2',
    backgroundColor: '#fff',
    zIndex: 1,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  menuButton: {
    padding: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    color: '#2E3A59',
  },
  profileButton: {
    padding: 8,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: 8,
  },
  profileIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  userName: {
    color: '#2E3A59',
    fontWeight: '500',
  },
  avatar: {
    backgroundColor: '#E4E9F2',
  },
});
