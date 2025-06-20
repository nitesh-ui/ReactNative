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
import LandingScreen from 'screens/LandinScreen';
import DepositHistoryScreen from 'screens/DepositHistoryScreen';
import WithdrawHistoryScreen from 'screens/WithdrawHistoryScreen';
import HelpScreen from 'screens/HelpScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerificationCode: { email: string };
  ResetPassword: { email: string; otp: string };
  HomeScreen: undefined;
  DepositScreen: undefined;
  WithdrawlScreen: undefined;
  MyAccount: undefined;
  Landing: undefined;
  HomeScreen2: undefined;
  DepositHistoryScreen: undefined;
  WithdrawHistoryScreen: undefined;
  HelpScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  initialRouteName?: keyof RootStackParamList;
};

export default function AppNavigator({ initialRouteName = 'Landing' }: Props) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="VerificationCode" component={VerificationCodeScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="DepositScreen" component={DepositScreen} />
      <Stack.Screen name="WithdrawlScreen" component={WithdrawalScreen} />
      <Stack.Screen name="MyAccount" component={MyAccountScreen} />
      <Stack.Screen name="DepositHistoryScreen" component={DepositHistoryScreen} />
      <Stack.Screen name="WithdrawHistoryScreen" component={WithdrawHistoryScreen} />
      <Stack.Screen name="HelpScreen" component={HelpScreen} />
    </Stack.Navigator>
  );
}
