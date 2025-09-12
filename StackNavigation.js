import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Importar as telas
import Login from './screens/Login';
import Cadastro from './screens/Cadastro';
import HorariosProfessora from './screens/HorariosProfessora';
import HorariosAluno from './screens/HorariosAluno';
import MeusAgendamentos from './screens/MeusAgendamentos';
import AgendamentosProfessora from './screens/AgendamentosProfessora';

const Stack = createNativeStackNavigator();

export default function StackNavigation() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Buscar perfil no Firestore
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
          const perfil = (userDoc.data().perfil || "aluno").toLowerCase();
          setInitialRoute(perfil === "professora" || perfil === "professor" ? "HorariosProfessora" : "HorariosAluno");
        } else {
          setInitialRoute('Login');
        }
      } else {
        setInitialRoute('Login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: '#FF4500' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Login" component={Login} options={{ title: 'Hora da Coruja' }} />
        <Stack.Screen name="Cadastro" component={Cadastro} options={{ title: 'Cadastrar' }} />
        <Stack.Screen name="HorariosProfessora" component={HorariosProfessora} options={{ title: 'Horários Professora' }} />
        <Stack.Screen name="HorariosAluno" component={HorariosAluno} options={{ title: 'Agendar Aula' }} />
        <Stack.Screen name="MeusAgendamentos" component={MeusAgendamentos} options={{ title: 'Meus Agendamentos' }} />
        <Stack.Screen name="AgendamentosProfessora" component={AgendamentosProfessora} options={{ title: 'Agendamentos' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
  },
});

