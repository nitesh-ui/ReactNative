// components/UserDropdown.tsx

import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

type Props = {
  username?: string;
};

function UserDropdownComponent({ username = 'USER9801' }: Props) {
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleMyAccount = () => {
    closeMenu();
    navigation.navigate('MyAccount');
  };
  const handleDeposit = () => {
    closeMenu();
    navigation.navigate('DepositScreen');
  };
  const handleWithdraw = () => {
    closeMenu();
    navigation.navigate('WithdrawlScreen');
  };
  const handleDepositHistory = () => {
    closeMenu();
    navigation.navigate('DepositHistoryScreen');
  };

  const handleWithdrawHistory = () => {
    closeMenu();
    navigation.navigate('WithdrawHistoryScreen');
  };
  const handleLogout = async () => {
    closeMenu();
    try {
      await logout();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (e) {
      Alert.alert('Logout failed', 'Please try again.');
      console.error(e);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Anchor button that triggers the menu */}
      {/* <TouchableOpacity style={styles.anchor} onPress={openMenu}>
        <MaterialIcons name="person" size={20} color="#fff" />
        <Text style={styles.username}>{username}</Text>
        <MaterialIcons name={visible ? 'expand-less' : 'expand-more'} size={20} color="#fff" />
      </TouchableOpacity> */}

      {/* The Menu itself */}
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          /* We reuse the anchor in case the library needs a reference, but it won't re-render because of React.memo */
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

        <TouchableOpacity style={styles.item} onPress={handleDeposit}>
          <MaterialIcons name="account-balance" size={20} color="#fff" />
          <Text style={styles.itemText}>Deposit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={handleDepositHistory}>
          <MaterialIcons name="money-off" size={20} color="#fff" />
          <Text style={styles.itemText}>Deposit History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={handleWithdraw}>
          <MaterialIcons name="money-off" size={20} color="#fff" />
          <Text style={styles.itemText}>Withdraw</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={handleWithdrawHistory}>
          <MaterialIcons name="money-off" size={20} color="#fff" />
          <Text style={styles.itemText}>Withdraw History</Text>
        </TouchableOpacity>

        <Divider style={styles.divider} />

        <TouchableOpacity style={styles.item} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.itemText}>Logout</Text>
        </TouchableOpacity>
      </Menu>
    </View>
  );
}

// Wrap with React.memo so that parent re-renders (like countdown ticks) won’t force this component to close
export default React.memo(UserDropdownComponent);

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
  divider: {
    backgroundColor: '#444',
    marginVertical: 4,
  },
});
