import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const colors = {
  primary: "#0F172A",
  textPrimary: "#FFFFFF",
  textSecondary: "#CBD5E1",
  accent: "#F59E0B",
  bgCard: "rgba(255,255,255,0.08)",
};

export default function Setting() {
  const { t, i18n } = useTranslation();

  const [wifiModal, setWifiModal] = useState(false);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const currentLanguage = i18n.language || "en";

  // =========================
  // CHANGE PASSWORD
  // =========================
  const handleChangePassword = async () => {
    try {

      // EMPTY CHECK
      if (!oldPass || !newPass || !confirmPass) {
        Alert.alert("Error", "Please fill all fields");
        return;
      }

      // PASSWORD LENGTH
      if (newPass.length < 8) {
        Alert.alert(
          "Error",
          "New password must be at least 8 characters"
        );
        return;
      }

      // CONFIRM PASSWORD
      if (newPass !== confirmPass) {
        Alert.alert(
          "Error",
          "Confirm password does not match"
        );
        return;
      }

      // SEND JSON TO ESP32
      const response = await axios.post(
        "http://192.168.4.1/change-password",
        {
          oldPassword: oldPass,
          newPassword: newPass,
        }
      );

      // SUCCESS
      if (response.data.success) {

        Alert.alert(
          "Success",
          "Password Changed Successfully"
        );

        setOldPass("");
        setNewPass("");
        setConfirmPass("");

        setWifiModal(false);

      } else {

        Alert.alert(
          "Error",
          "Your old password is not correct"
        );
      }

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Error",
        "Connection Failed"
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: colors.textPrimary,
            marginTop: 10,
          },
        ]}
      >
        {t("setting.title")}
      </Text>

      {/* LANGUAGE */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
            },
          ]}
        >
          {t("setting.changeLanguage")}
        </Text>

        <View style={styles.languageButtons}>
          {[
            {
              key: "en",
              label: t("setting.languages.en"),
            },
            {
              key: "ps",
              label: t("setting.languages.ps"),
            },
            {
              key: "dr",
              label: t("setting.languages.dr"),
            },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.langButton,
                currentLanguage === key &&
                  styles.langButtonActive,
              ]}
              onPress={() =>{
                try {
                  
                  i18n.changeLanguage(key)
                } catch (error) {
                  console.log(error.message);
                  Alert.alert(
                    "Faild",
                    error.message
                  );
                }
              }}
            >
              <Text
                style={
                  currentLanguage === key
                    ? styles.langTextActive
                    : styles.langText
                }
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* WIFI PASSWORD */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.textPrimary,
            },
          ]}
        >
          {t("setting.wifiPassword")}
        </Text>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => setWifiModal(true)}
        >
          <Text style={styles.updateButtonText}>
            {t("setting.wifiPassword")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal
        visible={wifiModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>

            <TouchableOpacity
              style={styles.topRightClose}
              onPress={() =>
                setWifiModal(false)
              }
            >
              <Ionicons
                name="close"
                size={24}
                color={colors.accent}
              />
            </TouchableOpacity>

            <Text
              style={[
                styles.modalTitle,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              {t("setting.wifiPassword")}
            </Text>

            <TextInput
              placeholder={t("setting.oldPassword")}
              placeholderTextColor={
                colors.textSecondary
              }
              style={styles.input}
              secureTextEntry
              value={oldPass}
              onChangeText={setOldPass}
            />

            <TextInput
              placeholder={t("setting.newPassword")}
              placeholderTextColor={
                colors.textSecondary
              }
              style={styles.input}
              secureTextEntry
              value={newPass}
              onChangeText={setNewPass}
            />

            <TextInput
              placeholder={t("setting.confirmPassword")}
              placeholderTextColor={
                colors.textSecondary
              }
              style={styles.input}
              secureTextEntry
              value={confirmPass}
              onChangeText={setConfirmPass}
            />

            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.updateButtonText}>
                {t("setting.updatePassword")}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  languageButtons: {
    flexDirection: "row",
  },

  langButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#1E293B",
    marginRight: 10,
  },

  langButtonActive: {
    backgroundColor: "#F59E0B",
  },

  langText: {
    color: "#CBD5E1",
    fontWeight: "500",
  },

  langTextActive: {
    color: "#0F172A",
    fontWeight: "700",
  },

  updateButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },

  updateButtonText: {
    color: "#0F172A",
    fontWeight: "700",
    textAlign: "center",
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "85%",
    backgroundColor: "#1E293B",
    borderRadius: 15,
    padding: 20,
  },

  topRightClose: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 6,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#fff",
    marginBottom: 10,
  },
});