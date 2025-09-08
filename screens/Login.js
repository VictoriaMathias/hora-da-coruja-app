import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !senha) { 
      Alert.alert("Atenção", "Preencha todos os campos!"); 
      return; 
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "usuarios", user.uid));

      if (!userDoc.exists()) {
        Alert.alert("Erro", "Usuário não encontrado no banco de dados.");
        setLoading(false);
        return;
      }

      const perfil = (userDoc.data().perfil || "aluno").toLowerCase();
      navigation.navigate(perfil === "professora" || perfil === "professor" ? "HorariosProfessora" : "HorariosAluno");
    } catch (error) {
      let message = "Erro ao entrar. Tente novamente.";
      if (error.code === "auth/user-not-found") message = "Usuário não encontrado.";
      else if (error.code === "auth/wrong-password") message = "Senha incorreta.";
      else if (error.code === "auth/invalid-email") message = "Email inválido.";
      Alert.alert("Erro ao entrar", message);
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hora da Coruja 🦉</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#555"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#555"
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: "#FF8C00" }]} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { backgroundColor: "#1E90FF" }]} onPress={() => navigation.navigate("Cadastro")} disabled={loading}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#FF4500", marginBottom: 20 },
  input: { width: "100%", backgroundColor: "#FFF", padding: 15, borderRadius: 25, borderWidth: 1, borderColor: "#FFD700", marginBottom: 15, fontSize: 16 },
  button: { width: "100%", padding: 15, borderRadius: 25, alignItems: "center", marginTop: 10, elevation: 3 },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
});
