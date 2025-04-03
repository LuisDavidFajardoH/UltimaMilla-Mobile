import React, { useState } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Layout, Text, Button, Icon } from '@ui-kitten/components';

export const Sidebar = ({ isOpen, onClose, navigation, rol_id }) => {
  const [isAdminMenuOpen, setAdminMenuOpen] = useState(false);
  const [isPedidosMenuOpen, setIsPedidosMenuOpen] = useState(false);

  if (!isOpen) return null;

  const renderMenuItem = (title, icon, onPress, isSubmenu = false) => (
    <Button
      appearance='ghost'
      status='basic'
      style={[styles.menuItem, isSubmenu && styles.submenuItem]}
      accessoryLeft={(props) => <Icon {...props} name={icon}/>}
      onPress={onPress}>
      {title}
    </Button>
  );

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      
      <Layout style={styles.sidebar}>
        <Layout style={styles.header}>
          <Layout style={styles.logoContainer}>
            <Icon name='menu' style={styles.logo} fill="#0086FF"/>
            <Text category='h6'>99 Envíos</Text>
          </Layout>
        </Layout>

        <Layout style={styles.menuContainer}>
          {rol_id === '3' && (
            <>
              {renderMenuItem('Tablero', 'grid-outline', () => {
                navigation.navigate('Tablero');
                onClose();
              })}

              {renderMenuItem('Reportes', 'bar-chart-outline', () => {
                navigation.navigate('Reportes');
                onClose();
              })}

              <Button
                appearance='ghost'
                status='basic'
                style={styles.menuHeader}
                accessoryLeft={(props) => <Icon {...props} name='briefcase-outline'/>}
                accessoryRight={(props) => (
                  <Icon {...props} name={isAdminMenuOpen ? 'chevron-down' : 'chevron-right'}/>
                )}
                onPress={() => setAdminMenuOpen(!isAdminMenuOpen)}>
                Administrar Sucursal
              </Button>

              {isAdminMenuOpen && (
                <>
                  {renderMenuItem('Reportes', 'bar-chart-outline', () => {
                    navigation.navigate('Reportes');
                    onClose();
                  }, true)}
                  {renderMenuItem('Pedidos', 'file-text-outline', () => {
                    navigation.navigate('Pedidos');
                    onClose();
                  }, true)}
                  {renderMenuItem('Crear Conductor', 'person-add-outline', () => {
                    navigation.navigate('CrearConductor');
                    onClose();
                  }, true)}
                  {renderMenuItem('Inventario', 'archive-outline', () => {
                    navigation.navigate('Inventario');
                    onClose();
                  }, true)}
                  {renderMenuItem('Dropshipping', 'shopping-bag-outline', () => {
                    navigation.navigate('Dropshipping');
                    onClose();
                  }, true)}
                </>
              )}

              <Button
                appearance='ghost'
                status='basic'
                style={styles.menuHeader}
                accessoryLeft={(props) => <Icon {...props} name='shopping-cart-outline'/>}
                accessoryRight={(props) => (
                  <Icon {...props} name={isPedidosMenuOpen ? 'chevron-down' : 'chevron-right'}/>
                )}
                onPress={() => setIsPedidosMenuOpen(!isPedidosMenuOpen)}>
                Pedidos
              </Button>

              {isPedidosMenuOpen && (
                <>
                  {renderMenuItem('Pedido individual', 'pin-outline', () => {
                    navigation.navigate('PedidoIndividual');
                    onClose();
                  }, true)}
                  {renderMenuItem('Pedido masivo', 'layers-outline', () => {
                    navigation.navigate('PedidoMasivo');
                    onClose();
                  }, true)}
                  {renderMenuItem('Editar pedidos', 'edit-2-outline', () => {
                    navigation.navigate('EditarPedidos');
                    onClose();
                  }, true)}
                </>
              )}
            </>
          )}

          {renderMenuItem('Cerrar Sesión', 'log-out', () => {
            navigation.replace('99 Envios');
          })}
        </Layout>
      </Layout>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: 280,
    backgroundColor: 'white',
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F2',
  },
  menuContainer: {
    padding: 4,
  },
  menuItem: {
    justifyContent: 'flex-start',
    marginVertical: 1,
    minHeight: 36,
    paddingVertical: 4,
  },
  menuHeader: {
    justifyContent: 'space-between',
    marginVertical: 1,
    backgroundColor: '#F7F9FC',
    minHeight: 36,
    paddingVertical: 4,
  },
  submenuItem: {
    paddingLeft: 32,
    backgroundColor: 'transparent',
    minHeight: 32,
    paddingVertical: 2,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 20,
    height: 20,
  },
});

export default Sidebar;
