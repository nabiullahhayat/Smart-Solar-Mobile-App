import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Linking,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import Angle from "./Angle";
import Sensors from "./Sensors";
import Setting from "./Setting";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import WifiManager from "react-native-wifi-reborn";

const screenWidth = Dimensions.get("window").width;

const colors = {
  primary: "#0B1220",
  accent: "#F59E0B",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
  card: "#111827",
  success: "#22C55E",
};

export default function Dashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [wifiOn, setWifiOn] = useState(false);
  const [liveDataInterval, setLiveDataInterval] = useState(null);

  const [liveData, setLiveData] = useState({
    light: 0,
    temp: 0,
    curr: 0,
    angle: 0,
  });

  const sensors = [
    {
      key: "light",
      name: t("sensors.light"),
      icon: "sunny-outline",
      color: "#F59E0B",
    },
    {
      key: "temp",
      name: t("sensors.temp"),
      icon: "thermometer-outline",
      color: "#FF6384",
    },
    {
      key: "curr",
      name: t("sensors.curr"),
      icon: "battery-charging-outline",
      color: "#4BC0C0",
    },
    {
      key: "angle",
      name: t("sensors.angle"),
      icon: "sunny-outline",
      color: "#FACC15",
    },
  ];

  const storeTwoSecondsData = async (newData) => {
    try {
      const old = await AsyncStorage.getItem("sensor_stream");
      let arr = old ? JSON.parse(old) : [];

      arr.push(newData);

      if (arr.length > 2) {
        arr = arr.slice(arr.length - 2);
      }

      await AsyncStorage.setItem("sensor_stream", JSON.stringify(arr));
    } catch (e) {
      console.log("Storage error:", e);
    }
  };

  const requestLocationPermission = async () => {
  if (Platform.OS !== "android") return true;

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: "Location Permission",
      message: "This app needs location permission to connect to WiFi.",
      buttonPositive: "OK",
    }
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

const openWifiSettings = async () => {
  try {
    if (Platform.OS === "android") {
      await Linking.sendIntent("android.settings.WIFI_SETTINGS");
    } else {
      await Linking.openURL("App-Prefs:WIFI");
    }
  } catch (e) {
    console.log("WiFi open error:", e);
    await Linking.openSettings();
  }
};

const startLiveData = async () => {
  try {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      console.log("Location permission denied");
      return;
    }

    // await WifiManager.connectToProtectedSSID(
    //   "ESP32_HOTSPOT",
    //   "solar1234",
    //   false,
    //   false
    // );

    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get("http://192.168.4.1/data");
        setLiveData(data);
        await storeTwoSecondsData(data);
      } catch (err) {
        console.log("Fetch error:", err);
      }
    }, 1000);

    setLiveDataInterval(interval);
  } catch (error) {
    console.log("WiFi error:", error);

    if (String(error).includes("Location service is turned off")) {
      await openLocationSettings();
    }
  }
};

  const stopLiveData = () => {
    if (liveDataInterval) {
      clearInterval(liveDataInterval);
      setLiveDataInterval(null);
    }
  };
  const handleWifiToggle = async () => {
    const newState = !wifiOn;

    try {


    if (newState) {
      const isEnabled = await WifiManager.isEnabled();

      if (isEnabled) {
        setWifiOn(true);
        await startLiveData();
      } else {
        setWifiOn(false);
        await openWifiSettings();
      }
    } else {
      setWifiOn(false);
      stopLiveData();
    }
        
    } catch (error) {
      Alert.alert("Press The wifi button again and allow location permission to connect to the device.");
      console.log("WiFi toggle error:", error);
    }
  }
const openLocationSettings = async () => {
  try {
    if (Platform.OS === "android") {
      await Linking.sendIntent("android.settings.LOCATION_SOURCE_SETTINGS");
      setWifiOn(false);
      stopLiveData();

    }
  } catch (e) {
    console.log("Location settings open error:", e);
  }
};


  const graphData = {
    labels: ["1", "2"],
    datasets: [
      { data: [liveData.light], color: () => "#F59E0B" },
      { data: [liveData.temp], color: () => "#FF6384" },
      { data: [liveData.curr], color: () => "#4BC0C0" },
    ],
    legend: ["Light", "Temp", "Curr"],
  };

  const tabs = ["overview", "sensors", "angle", "setting"];

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>{t(`tabs.${activeTab}`)}</Text>
      </View>

      {/* BODY */}
      {activeTab === "overview" && (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* WIFI */}
          <View style={styles.wifiContainer}>
            <TouchableOpacity
              style={[
                styles.wifiBtn,
                { backgroundColor: wifiOn ? "#052e1f" : "#1f2937" },
              ]}
              onPress={handleWifiToggle}
            >
              <Ionicons
                name="wifi"
                size={18}
                color={wifiOn ? colors.success : colors.textSecondary}
              />
              <Text
                style={{
                  marginLeft: 6,
                  color: wifiOn ? colors.success : colors.textSecondary,
                }}
              >
                {t("wifi.wifi")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* CARDS */}
          <View style={styles.cardGrid}>
            {sensors.map((s) => (
              <View key={s.key} style={styles.sensorCard}>
                <Ionicons name={s.icon} size={28} color={s.color} />
                <Text style={styles.sensorValue}>{liveData[s.key]}</Text>
                <Text style={styles.sensorName}>{s.name}</Text>
              </View>
            ))}
          </View>

          {/* CHART */}
          <View style={styles.chartCard}>
<LineChart
  data={graphData}
  width={screenWidth - 32}
  height={300}
  bezier
  withDots={true}
  withInnerLines={true}
  withOuterLines={true}
  chartConfig={{
    backgroundGradientFrom: "#0B1220",
    backgroundGradientTo: "#0B1220",
    decimalPlaces: 0,

    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    labelColor: () => "#94A3B8",

    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#fff",
    },
  }}
  getDotColor={(dataPoint, index) => {
    if (index === 0) return "#FF6384"; // previous
    return "#22C55E"; // current
  }}
/>
          </View>
        </ScrollView>
      )}

      {activeTab === "sensors" && <Sensors />}
      {activeTab === "angle" && <Angle />}
      {activeTab === "setting" && <Setting />}

      {/* BOTTOM NAV */}
      <View style={styles.bottomBar}>
        {tabs.map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveTab(key)}
            style={styles.tabItem}
          >
            <Ionicons
              name={
                key === "overview"
                  ? "home-outline"
                  : key === "sensors"
                    ? "pulse-outline"
                    : key === "angle"
                      ? "sunny-outline"
                      : "settings-outline"
              }
              size={24}
              color={activeTab === key ? colors.accent : colors.textSecondary}
            />

            <Text
              style={{
                color: activeTab === key ? colors.accent : colors.textSecondary,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {t(`tabs.${key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  topBar: {
    padding: 16,
    backgroundColor: colors.card,
    alignItems: "center",
  },

  topTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  wifiContainer: {
    alignItems: "center",
    marginTop: 10,
  },

  wifiBtn: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
  },

  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 12,
  },

  sensorCard: {
    width: "48%",
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 10,
  },

  sensorValue: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "700",
  },

  sensorName: {
    color: colors.textSecondary,
  },

  chartCard: {
    margin: 12,
    backgroundColor: colors.card,
    borderRadius: 18,
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingBottom: 25,
    backgroundColor: colors.card,
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
});