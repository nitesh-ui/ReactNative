// components/UserDropdown.tsx

import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Menu } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from 'context/AuthContext';

export default function UserDropdown({ username = 'USER9801' }) {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleMyAccount = () => {
    closeMenu();
    navigation.navigate('MyAccount');
  };

  const handleLogout = async () => {
    closeMenu();
    try {
      await logout();
      // reset the nav stack to Login
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (e) {
      Alert.alert('Logout failed', 'Please try again.');
      console.error('Logout error', e);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity style={styles.anchor} onPress={openMenu}>
            <MaterialIcons name="person" size={20} color="#fff" />
            <Text style={styles.username}>{username}</Text>
            <MaterialIcons name={visible ? 'expand-less' : 'expand-more'} size={20} color="#fff" />
          </TouchableOpacity>
        }
        contentStyle={styles.menu}>
        <TouchableOpacity style={styles.item} onPress={handleMyAccount}>
          <MaterialIcons name="account-circle" size={20} color="#fff" />
          <Text style={styles.itemText}>My Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.itemText}>Logout</Text>
        </TouchableOpacity>
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
  },
  anchor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff22',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  username: {
    color: '#fff',
    fontWeight: '500',
    marginHorizontal: 8,
  },
  menu: {
    backgroundColor: '#2c2c4d',
    borderRadius: 12,
    paddingVertical: 4,
    elevation: 6,
    minWidth: 180,
    marginTop: 40,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  itemText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 12,
  },
});
