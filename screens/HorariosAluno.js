import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, query, where, addDoc, doc, getDoc } from "firebase/firestore";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export default function HorariosAluno({ navigation }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [availableTimes, setAvailableTimes] = useState([]);
  const [reservedTimes, setReservedTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    if (selectedDate) {
      loadAvailableTimes(selectedDate);
      loadReservedTimes(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableTimes = async (date) => {
    try {
      const q = query(collection(db, "professorSchedule"), where("date", "==", date));
      const snapshot = await getDocs(q);
      setAvailableTimes(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.log("Erro ao carregar horários:", error);
    }
  };

  const loadReservedTimes = async (date) => {
    try {
      const q = query(collection(db, "studentAppointments"), where("date", "==", date));
      const snapshot = await getDocs(q);
      setReservedTimes(snapshot.docs.map((doc) => doc.data().time));
    } catch (error) {
      console.log("Erro ao carregar horários reservados:", error);
    }
  };

  const handleAgendar = async () => {
    if (!selectedDate) return Alert.alert("Atenção", "Selecione uma data!");
    if (!selectedTime) return Alert.alert("Atenção", "Selecione um horário!");

    try {
      // Buscar o nome do aluno no Auth 
      const studentName = auth.currentUser.displayName || "Aluno";

      await addDoc(collection(db, "studentAppointments"), {
        studentId: auth.currentUser.uid,
        studentName,
        date: selectedDate,
        time: selectedTime,
        teacherId: availableTimes.find(t => t.time === selectedTime)?.teacherId || "",
        teacherName: availableTimes.find(t => t.time === selectedTime)?.teacherName || "",
      });

      Alert.alert("Sucesso", "Agendamento realizado!");
      setSelectedTime("");
      loadReservedTimes(selectedDate);
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendar Horário 🦉</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: "#FF8C00" } }}
      />

      <Text style={styles.subtitle}>
        {selectedDate ? `Horários em ${formatDate(selectedDate)}` : "Selecione uma data"}
      </Text>

      <FlatList
        data={availableTimes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isReserved = reservedTimes.includes(item.time);
          return (
            <TouchableOpacity
              style={[
                styles.horaButton,
                isReserved && styles.horaIndisponivel,
                selectedTime === item.time && !isReserved && styles.horaSelecionada,
              ]}
              disabled={isReserved}
              onPress={() => setSelectedTime(item.time)}
            >
              <Text style={[styles.horaText, isReserved && { color: "#999" }]}>{item.time}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum horário disponível.</Text>}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: "#32CD32" }]} onPress={handleAgendar}>
        <Text style={styles.buttonText}>Confirmar Agendamento</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#1E90FF" }]}
        onPress={() => navigation.navigate("MeusAgendamentos")}
      >
        <Text style={styles.buttonText}>Meus Agendamentos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF3E0", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#FF4500", marginBottom: 20, textAlign: "center" },
  subtitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10, textAlign: "center" },
  horaButton: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#FFD700", margin: 5, backgroundColor: "#FFF", minWidth: 80, alignItems: "center" },
  horaSelecionada: { backgroundColor: "#FFD700" },
  horaIndisponivel: { backgroundColor: "#EEE" },
  horaText: { color: "#333", fontWeight: "bold" },
  button: { width: "100%", padding: 15, borderRadius: 25, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
  emptyText: { textAlign: "center", marginTop: 15, color: "#555" },
});









