import React, { useState, useEffect } from "react";
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, query, where, doc, deleteDoc } from "firebase/firestore";
import { Calendar } from "react-native-calendars";

export default function MeusAgendamentos() {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const q = query(
          collection(db, "studentAppointments"),
          where("studentId", "==", auth.currentUser.uid)
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
              // Remove o agendamento do aluno
              await deleteDoc(doc(db, "studentAppointments", id));

              // Atualiza a lista local
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
      <Text style={styles.title}>Meus Agendamentos 🦉</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={selectedDate ? { [selectedDate]: { selected: true, selectedColor: "#FF8C00" } } : {}}
      />

      <FlatList
        data={filteredAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemText}>
              {item.time} - Prof. {item.teacherName}
            </Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteAppointment(item.id)}>
              <Text style={styles.deleteText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {selectedDate ? "Nenhum agendamento para esta data." : "Você ainda não possui agendamentos."}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF3E0", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", color: "#FF4500", marginBottom: 20, textAlign: "center" },
  card: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ffdf2bff", borderRadius: 15, padding: 12, marginTop: 10 },
  itemText: { fontSize: 17, color: "#fff", fontWeight: "bold" },
  deleteButton: { paddingHorizontal: 12, paddingVertical: 5, backgroundColor: "#FF4500", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  deleteText: { color: "#fff", fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#555", fontSize: 16 },
});


