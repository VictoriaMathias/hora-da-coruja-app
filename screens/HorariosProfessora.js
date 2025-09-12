import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList, TextInput } from "react-native";
import { Calendar } from "react-native-calendars";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

// Formatar horários
function formatTime(timeStr) {
  if (!timeStr) return "";
  let [h, m] = timeStr.split(":");
  h = h.padStart(2, "0");
  m = (m || "00").padStart(2, "0");
  return `${h}:${m}`;
}

export default function HorariosProfessora({ navigation }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [horariosDoDia, setHorariosDoDia] = useState([]);

  const carregarHorarios = async (date) => {
    try {
      const q = query(collection(db, "professorSchedule"), where("date", "==", date));
      const snapshot = await getDocs(q);
      setHorariosDoDia(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (error) {
      console.log("Erro ao carregar horários:", error);
    }
  };

  const handleAddHorario = async () => {
    if (!selectedDate) return Alert.alert("Atenção", "Selecione uma data!");
    if (!selectedTime) return Alert.alert("Atenção", "Digite um horário!");

    setLoading(true);
    try {
      await addDoc(collection(db, "professorSchedule"), {
        teacherId: auth.currentUser.uid,
        teacherName: auth.currentUser.displayName || "Professora",
        date: selectedDate,
        time: formatTime(selectedTime),
      });
      Alert.alert("Sucesso", "Horário adicionado!");
      setSelectedTime("");
      carregarHorarios(selectedDate);
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHorario = async (id) => {
    Alert.alert(
      "Excluir Horário",
      "Deseja realmente excluir este horário?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "professorSchedule", id));
              Alert.alert("Sucesso", "Horário excluído!");
              carregarHorarios(selectedDate);
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o horário.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horários Disponíveis 🦉</Text>

      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          carregarHorarios(day.dateString);
        }}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: "#FF8C00" } }}
      />

      <Text style={styles.subtitle}>
        {selectedDate ? `Horários em ${selectedDate}` : "Selecione uma data"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o horário (ex: 16:00)"
        value={selectedTime}
        onChangeText={setSelectedTime}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#32CD32" }]}
        onPress={handleAddHorario}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Adicionar Horário</Text>}
      </TouchableOpacity>

      <FlatList
        data={horariosDoDia}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.horarioItem}>
            <Text style={styles.horarioText}>{item.time}</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteHorario(item.id)}>
              <Text style={styles.deleteText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum horário para este dia ainda.</Text>}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#1E90FF" }]}
        onPress={() => navigation.navigate("AgendamentosProfessora")}
      >
        <Text style={styles.buttonText}>Ver Agendamentos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF3E0", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#FF4500", marginBottom: 20, textAlign: "center" },
  subtitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#FFD700", borderRadius: 10, padding: 10, marginBottom: 15, backgroundColor: "#FFF" },
  button: { width: "100%", padding: 15, borderRadius: 25, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
  horarioItem: { flexDirection: "row", justifyContent: "space-between", padding: 12, backgroundColor: "#FFD700", borderRadius: 10, marginVertical: 5, alignItems: "center" },
  horarioText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  deleteButton: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: "#FF4500", borderRadius: 8 },
  deleteText: { color: "#FFF", fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 10, color: "#555" },
});










