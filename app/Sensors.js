import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LineChart } from "react-native-gifted-charts";

const screenWidth = Dimensions.get("window").width;

const colors = {
  primary: "#0B1220",
  accent: "#F59E0B",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
  cardBg: "#111827",
};

export default function Sensors() {
  const { t } = useTranslation();
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [hoverAnim] = useState(new Animated.Value(1));
  const [storageData, setStorageData] = useState([]);

  // =========================
  // LOAD STORAGE LIVE
  // =========================
  const loadStorage = async () => {
    try {
      const old = await AsyncStorage.getItem("sensor_stream");
      const arr = old ? JSON.parse(old) : [];
      setStorageData(arr);
    } catch (e) {
      console.log("Load error:", e);
    }
  };

  useEffect(() => {
    loadStorage();
    const interval = setInterval(loadStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  // =========================
  // SENSOR LIST (DYNAMIC)
  // =========================
  const sensors = [
    { key: "light", name: t("sensors.light"), icon: "sunny-outline", color: "#F59E0B" },
    { key: "temp", name: t("sensors.temp"), icon: "thermometer-outline", color: "#FF6384" },
    { key: "curr", name: t("sensors.curr"), icon: "battery-charging-outline", color: "#4BC0C0" },
    { key: "angle", name: t("sensors.angle"), icon: "sunny-outline", color: "#FFCE56" },
  ];

  // =========================
  // SPLIT CURRENT / PREVIOUS
  // =========================
const getSensorData = (key) => {
  if (!storageData || storageData.length === 0) {
    return { current: [0], previous: [0] };
  }

  const previousValue = storageData[0]?.[key] ?? 0;
  const currentValue = storageData[storageData.length - 1]?.[key] ?? 0;

  return {
    previous: [previousValue],
    current: [currentValue],
  };
};

  const toLineData = (arr) =>
    arr.map((val, index) => ({
      value: val,
      label: `${index + 1}`,
    }));

  const onPressIn = () =>
    Animated.spring(hoverAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();

  const onPressOut = () =>
    Animated.spring(hoverAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

    const modalData = selectedSensor
  ? getSensorData(selectedSensor.key)
  : { current: [0], previous: [0] };

  return (
    <View style={styles.container}>
      {/* =========================
          CARDS
      ========================= */}
      <ScrollView>
      {sensors.map((s) => {
        const data = getSensorData(s.key);
        const lastValue = data.current[0] || 0;

        return (
          <Animated.View
            key={s.key}
            style={[
              styles.sensorCard,
              {
                transform: [{ scale: hoverAnim }],
                shadowColor: s.color,
                borderLeftColor: s.color,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              // onPress={() => setSelectedSensor({ ...s, ...data })}
              onPress={() => setSelectedSensor(s)}
              style={styles.sensorTouchable}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBlock, { borderColor: s.color + "33" }]}>
                  <Ionicons name={s.icon} size={28} color={s.color} />
                </View>

                <View style={[styles.badge, { backgroundColor: s.color + "18" }]}>
                  <Text style={[styles.badgeText, { color: s.color }]}>
                    {t("sensors.live")}
                  </Text>
                </View>
              </View>

              <Text style={styles.sensorLabel}>{s.name}</Text>

              <Text style={[styles.sensorValue, { color: s.color }]}>
                {lastValue}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.sensorMeta}>{t("sensors.current")}</Text>

                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>
                    {t("sensors.operational")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
      </ScrollView>


      {/* =========================
          MODAL
      ========================= */}
      <Modal
        visible={!!selectedSensor}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSensor(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSensor && (
              <>
                <TouchableOpacity
                  style={styles.topRightClose}
                  onPress={() => setSelectedSensor(null)}
                >
                  <Ionicons name="close" size={26} color={colors.accent} />
                </TouchableOpacity>

                <Ionicons
                  name={selectedSensor.icon}
                  size={46}
                  color={selectedSensor.color}
                />

                <Text style={styles.modalSensorName}>
                  {selectedSensor.name}
                </Text>

                <View style={styles.chartCard}>
                  <LineChart
                    // data={toLineData(selectedSensor.previous)}
                    // data2={toLineData(selectedSensor.current)}
                      data={[
                        { value: modalData.previous[0], label: "Previous", dataPointColor: "#3B82F6" },
                        { value: modalData.current[0], label: "Current", dataPointColor: "#FACC15" },
                      ]}
                    width={screenWidth * 0.6}
                    height={200}
                    curved
                    color="#3B82F6"
                    color2="#FACC15"
                    hideDataPoints={false}
                    thickness={3}
                    thickness2={3}
                  />

                  <View style={styles.legend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: "#FACC15" }]} />
                      <Text style={styles.legendText}>
                        {t("sensors.current")}
                      </Text>
                    </View>

                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
                      <Text style={styles.legendText}>
                        {t("sensors.previous")}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.primary,
  },
  sensorCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 5,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sensorTouchable: {
    padding: 5
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBlock: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sensorLabel: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sensorValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sensorMeta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  topRightClose: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalSensorName: {
    fontSize: 22,
    color: colors.textPrimary,
    marginVertical: 16,
  },
  chartCard: {
    width: '100%',
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});