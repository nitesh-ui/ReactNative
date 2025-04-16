import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const UserDropdown = ({ username = 'USER9801' }) => {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleNavigate = (target: 'Login' | 'MyAccount') => {
    closeMenu();
    navigation.navigate(target);
  };

  return (
    // <View
    //   style={{
    //     flexDirection: 'row',
    //     justifyContent: 'flex-end',
    //     paddingHorizontal: 16,
    //     paddingTop: 8,
    //     zIndex: 10,
    //   }}>
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        // ✅ Touchable as anchor directly inside View works fine
        <TouchableOpacity
          onPress={openMenu}
          style={{
            backgroundColor: '#ffffff22',
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <MaterialIcons name="person" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '500', marginHorizontal: 8 }}>{username}</Text>
          <MaterialIcons name={visible ? 'expand-less' : 'expand-more'} size={20} color="#fff" />
        </TouchableOpacity>
      }
      contentStyle={{
        backgroundColor: '#2c2c4d',
        borderRadius: 12,
        paddingVertical: 4,
        elevation: 6,
        minWidth: 180,
        marginTop: 40, // Adjust for better spacing if needed
      }}>
      {/* Menu Options */}
      <TouchableOpacity
        onPress={() => handleNavigate('MyAccount')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 16,
        }}>
        <MaterialIcons name="account-circle" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 15, marginLeft: 12 }}>My Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleNavigate('Login')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 16,
        }}>
        <MaterialIcons name="logout" size={20} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 15, marginLeft: 12 }}>Logout</Text>
      </TouchableOpacity>
    </Menu>
    // </View>
  );
};

export default UserDropdown;
