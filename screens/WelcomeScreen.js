import { View, Text, Image, TouchableOpacity, ImageBackground } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themeColors } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView className="flex-1">
            <ImageBackground source={require('../assets/images/bg-image.jpg')} className="bg-repeat h-full" >
                <View className="flex-1 flex justify-around my-4">
                    <Text 
                        className="text-white font-bold text-4xl text-center">
                        Flip To Win
                    </Text>
                    <View className="flex-row justify-center">
                        <Image source={require("../assets/images/wl.png")}
                            style={{width: 250, height: 250}} />
                    </View>
                    <View className="space-y-4">
                        <TouchableOpacity
                            onPress={()=> navigation.navigate('SignUp')}
                            className="py-3 bg-blue-900 mx-7 rounded-xl">
                                <Text 
                                    className="text-xl font-bold text-center text-white" >
                                    Sign Up
                                </Text>
                        </TouchableOpacity>
                        <View className="flex-row justify-center">
                            <Text className="text-white font-semibold">Already have an account?</Text>
                            <TouchableOpacity onPress={()=> navigation.navigate('Login')}>
                                <Text className="font-semibold text-red-500"> Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    )
}