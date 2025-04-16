// navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import Register from '../screens/Register';
import ForgotPassword from '../screens/ForgotPassword';
import VerificationCodeScreen from 'screens/VerificationCodeScreen';
import ResetPasswordScreen from 'screens/ResetPasswordScreen';
import HomeScreen from 'screens/HomeScreen';
import DepositScreen from 'screens/DepositScreen';
import WithdrawalScreen from 'screens/WithdrawlScreen';
import MyAccountScreen from 'screens/MyAccountScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="VerificationCode" component={VerificationCodeScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="DepositScreen" component={DepositScreen} />
      <Stack.Screen name="WithdrawlScreen" component={WithdrawalScreen} />
      <Stack.Screen name="MyAccount" component={MyAccountScreen} />
    </Stack.Navigator>
  );
}
