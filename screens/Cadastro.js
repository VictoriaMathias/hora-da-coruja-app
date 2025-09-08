import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

export default function Cadastro({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [perfil, setPerfil] = useState("aluno"); // aluno ou professora

  async function handleCadastro() {
    if (!name || !email || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;

      // Atualiza displayName no Auth
      await updateProfile(userCredential.user, { displayName: name });

      // Salva no Firestore
      await setDoc(doc(db, "usuarios", uid), {
        nome: name,
        email,
        perfil,
      });

      Alert.alert("Sucesso", "Cadastro realizado!");
      navigation.navigate("Login");
    } catch (error) {
      let message = "Erro ao cadastrar. Tente novamente.";
      if (error.code === "auth/email-already-in-use") message = "Email já cadastrado.";
      else if (error.code === "auth/invalid-email") message = "Email inválido.";
      else if (error.code === "auth/weak-password") message = "Senha muito fraca.";
      Alert.alert("Erro no cadastro", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro ✏️</Text>

      <View style={styles.perfilContainer}>
        <TouchableOpacity
          style={[styles.perfilButton, perfil === "aluno" && styles.perfilButtonSelected]}
          onPress={() => setPerfil("aluno")}
          disabled={loading}
        >
          <Text style={[styles.perfilText, perfil === "aluno" && styles.perfilTextSelected]}>
            Sou Aluno(a)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.perfilButton, perfil === "professora" && styles.perfilButtonSelected]}
          onPress={() => setPerfil("professora")}
          disabled={loading}
        >
          <Text style={[styles.perfilText, perfil === "professora" && styles.perfilTextSelected]}>
            Sou Professora
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Nome"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#555"
        editable={!loading}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#555"
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#555"
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#FF8C00" }]}
        onPress={handleCadastro}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Salvar</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 15 }} onPress={() => navigation.navigate("Login")} disabled={loading}>
        <Text style={{ color: "#FF4500", fontWeight: "bold" }}>Voltar para Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#FF4500", marginBottom: 20 },
  perfilContainer: { flexDirection: "row", marginBottom: 20 },
  perfilButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: "#FFD700", borderRadius: 25, marginHorizontal: 5, alignItems: "center", backgroundColor: "#FFF" },
  perfilButtonSelected: { backgroundColor: "#FFD700" },
  perfilText: { fontSize: 16, color: "#555", fontWeight: "bold" },
  perfilTextSelected: { color: "#FFF" },
  input: { width: "100%", backgroundColor: "#FFF", padding: 15, borderRadius: 25, borderWidth: 1, borderColor: "#FFD700", marginBottom: 15, fontSize: 16 },
  button: { width: "100%", padding: 15, borderRadius: 25, alignItems: "center", marginTop: 10, elevation: 3 },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
});


