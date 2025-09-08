import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from "react-native";
import { Calendar } from "react-native-calendars";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";

export default function AgendamentosProfessora() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const q = query(
          collection(db, "studentAppointments"),
          where("teacherId", "==", auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        setAppointments(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      } catch (error) {
        console.log("Erro ao carregar agendamentos:", error);
      }
    };
    fetchAppointments();
  }, []);

  const filteredAppointments = selectedDate
    ? appointments.filter(a => a.date === selectedDate)
    : appointments;

  const handleDeleteAppointment = async (id) => {
    Alert.alert(
      "Excluir agendamento",
      "Deseja realmente excluir este agendamento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "studentAppointments", id));
              setAppointments(prev => prev.filter(a => a.id !== id));
              Alert.alert("Sucesso", "Agendamento excluído!");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o agendamento.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agendamentos Confirmados 🦉</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: "#FF8C00" } } : {}}
      />

      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.appointmentItem}>
            <Text style={styles.appointmentText}>
              {item.time} - {item.studentName}
            </Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteAppointment(item.id)}>
              <Text style={styles.deleteText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum agendamento para esta data.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF3E0", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#FF4500", marginBottom: 15, textAlign: "center" },
  appointmentItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "#ffdf2bff", borderRadius: 10, marginVertical: 8 },
  appointmentText: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
  deleteButton: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: "#FF4500", borderRadius: 8 },
  deleteText: { color: "#FFF", fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#555" },
});







