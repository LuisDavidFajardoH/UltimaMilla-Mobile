import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native'; // Assuming you use react-navigation

const { width } = Dimensions.get('window');

const EntregaCancelada = () => {
    const navigation = useNavigation(); // Hook for navigation

    const handleDetailsClick = () => {
        // Navigate back to the dashboard
        navigation.navigate('ConductorDashboard');
        console.log("Volver al tablero presionado");
    };

    return (
        <View style={styles.container}>
            <LottieView
                source={require('./animations/failure_animation.json')} // UPDATED: Path to failure animation
                autoPlay
                loop={false}
                style={styles.lottie}
            />
            <Text style={styles.titulosE}>Entrega Fallida</Text> {/* UPDATED: Title text */}
            <Text style={styles.subTituloFinal}>Lo sentimos,</Text> {/* UPDATED: Subtitle text */}
            <TouchableOpacity style={styles.button} onPress={handleDetailsClick}>
                <Text style={styles.buttonText}>¡Vayamos a la siguiente entrega!</Text> {/* UPDATED: Button text */}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff', // Or your desired background color
        padding: 20,
    },
    lottie: {
        width: width * 0.7, // Adjust size as needed
        height: width * 0.7, // Adjust size as needed
        marginBottom: 20,
    },
    titulosE: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#dc3545', // Example failure color (Bootstrap danger red)
        textAlign: 'center',
        marginBottom: 10,
    },
    subTituloFinal: {
        fontSize: 18,
        color: '#555', // Adjust color as needed
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#007bff', // Example primary color
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25, // Make it rounded
        elevation: 3, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default EntregaCancelada;
