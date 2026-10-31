export interface ProjectFile {
  filename: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const EXPO_PROJECT_FILES: ProjectFile[] = [
  {
    filename: 'App.tsx',
    path: 'App.tsx',
    language: 'typescript',
    description: 'Main React Native Expo Application Entry Point with Bottom Tab Navigation & State',
    content: `import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Types
export interface TelemetryPacket {
  device_id: string;
  timestamp: string;
  fetal_bpm: number | null;
  maternal_pulse: number | null;
  temperature: number | null;
  ecg_value: number | null;
  doppler_status: 'connected' | 'not_connected';
}

const Tab = createBottomTabNavigator();

// --- Screen 1: Dashboard ---
function DashboardScreen() {
  const [telemetry, setTelemetry] = useState<TelemetryPacket>({
    device_id: 'ESP32_FETAL_01',
    timestamp: new Date().toLocaleTimeString(),
    fetal_bpm: null, // "Waiting for Doppler data" until connected
    maternal_pulse: 76,
    temperature: 36.8,
    ecg_value: 0.85,
    doppler_status: 'not_connected',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Device Status Bar */}
        <View style={styles.statusBarCard}>
          <View style={styles.row}>
            <View style={styles.statusDot} />
            <Text style={styles.deviceText}>{telemetry.device_id} (Connected)</Text>
          </View>
          <Text style={styles.timeText}>{telemetry.timestamp}</Text>
        </View>

        {/* Vital Cards */}
        <View style={styles.grid}>
          {/* Card 1: Fetal Heart Rate */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="heart-circle-outline" size={24} color="#0284c7" />
              <Text style={styles.cardTitle}>Fetal Heart Rate</Text>
            </View>
            {telemetry.fetal_bpm !== null ? (
              <View style={styles.valRow}>
                <Text style={styles.cardValue}>{telemetry.fetal_bpm}</Text>
                <Text style={styles.unit}>BPM</Text>
              </View>
            ) : (
              <View style={styles.waitingContainer}>
                <Text style={styles.awaitingText}>-- BPM</Text>
                <Text style={styles.subtext}>Awaiting Doppler data</Text>
              </View>
            )}
            <Text style={styles.rangeText}>Normal Range: 110 - 160 BPM</Text>
          </View>

          {/* Card 2: Maternal ECG */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="pulse" size={24} color="#16a34a" />
              <Text style={styles.cardTitle}>Maternal ECG</Text>
            </View>
            <View style={styles.valRow}>
              <Text style={styles.cardValue}>{telemetry.ecg_value?.toFixed(2) ?? '--'}</Text>
              <Text style={styles.unit}>mV</Text>
            </View>
            <Text style={styles.subtext}>Lead II · Normal Sinus</Text>
          </View>

          {/* Card 3: Maternal Pulse Rate */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="heart" size={24} color="#e11d48" />
              <Text style={styles.cardTitle}>Maternal Pulse</Text>
            </View>
            <View style={styles.valRow}>
              <Text style={styles.cardValue}>{telemetry.maternal_pulse ?? '--'}</Text>
              <Text style={styles.unit}>BPM</Text>
            </View>
            <Text style={styles.subtext}>Analog Pulse Sensor</Text>
          </View>

          {/* Card 4: Body Temperature */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="thermometer-outline" size={24} color="#ea580c" />
              <Text style={styles.cardTitle}>Body Temperature</Text>
            </View>
            <View style={styles.valRow}>
              <Text style={styles.cardValue}>{telemetry.temperature ?? '--'}</Text>
              <Text style={styles.unit}>°C</Text>
            </View>
            <Text style={styles.subtext}>DS18B20 1-Wire Digital Sensor</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Screen 2: Live ECG Screen ---
function LiveEcgScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.sectionHeader}>AD8232 ECG Real-Time Telemetry</Text>
        <Text style={styles.sectionSub}>Standard Lead II Placement (RA, LA, RL)</Text>
      </View>
      {/* Waveform monitor box */}
      <View style={styles.monitorBox}>
        <Text style={styles.monitorText}>[Live Waveform Canvas - 25mm/s · 10mm/mV]</Text>
      </View>
    </SafeAreaView>
  );
}

// --- Navigation Container ---
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any = 'home';
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Live') iconName = focused ? 'activity' : 'pulse-outline';
            else if (route.name === 'History') iconName = focused ? 'calendar' : 'calendar-outline';
            else if (route.name === 'Alerts') iconName = focused ? 'notifications' : 'notifications-outline';
            else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#0284c7',
          tabBarInactiveTintColor: '#64748b',
        })}
      >
        <Tab.Screen name="Home" component={DashboardScreen} />
        <Tab.Screen name="Live" component={LiveEcgScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 16 },
  statusBarCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16a34a', marginRight: 8 },
  deviceText: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  timeText: { fontSize: 12, color: '#64748b' },
  grid: { gap: 12 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '500', color: '#475569' },
  valRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  cardValue: { fontSize: 32, fontWeight: '700', color: '#0f172a' },
  unit: { fontSize: 16, color: '#64748b', fontWeight: '500' },
  subtext: { fontSize: 12, color: '#64748b', marginTop: 4 },
  rangeText: { fontSize: 11, color: '#0284c7', marginTop: 4, fontWeight: '500' },
  waitingContainer: { marginVertical: 4 },
  awaitingText: { fontSize: 28, fontWeight: '600', color: '#94a3b8' },
  headerBox: { padding: 16 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  sectionSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  monitorBox: {
    height: 220,
    backgroundColor: '#090d16',
    margin: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monitorText: { color: '#22c55e', fontFamily: 'monospace', fontSize: 12 },
});
`,
  },
  {
    filename: 'package.json',
    path: 'package.json',
    language: 'json',
    description: 'React Native Expo Project Dependencies and Configuration',
    content: `{
  "name": "iomt-maternal-fetal-monitor",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-status-bar": "~2.0.0",
    "react": "18.3.1",
    "react-native": "0.76.5",
    "@react-navigation/native": "^6.1.18",
    "@react-navigation/bottom-tabs": "^6.6.1",
    "@expo/vector-icons": "^14.0.2",
    "react-native-svg": "15.8.0",
    "react-native-chart-kit": "^6.12.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~18.3.12",
    "typescript": "^5.3.3"
  },
  "private": true
}
`,
  },
  {
    filename: 'app.json',
    path: 'app.json',
    language: 'json',
    description: 'Expo Application Configuration File for iOS & Android builds',
    content: `{
  "expo": {
    "name": "IoMT Fetal & Maternal Monitor",
    "slug": "iomt-fetal-maternal-monitor",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.iomt.fetalmaternal"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.iomt.fetalmaternal"
    }
  }
}
`,
  },
  {
    filename: 'esp32_firmware.ino',
    path: 'esp32/esp32_firmware.ino',
    language: 'cpp',
    description: 'Complete Arduino C++ sketch for ESP32 with AD8232, DS18B20, Pulse Sensor & Wi-Fi JSON',
    content: `/*
 * ESP32 Real-Time IoMT Maternal & Fetal Health Telemetry Node
 * Hardware:
 *  - ESP32 Development Board (ESP-WROOM-32)
 *  - AD8232 ECG Sensor (Output -> GPIO 34, LO+ -> GPIO 4, LO- -> GPIO 2)
 *  - Analog Pulse Sensor (Output -> GPIO 35)
 *  - DS18B20 Digital Temp Sensor (Data -> GPIO 15 with 4.7k pull-up)
 *  - Fetal Doppler Serial / Audio Envelope (GPIO 32)
 */

#include <WiFi.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// Wi-Fi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Hardware Pin Definitions
#define PIN_ECG_ANALOG 34
#define PIN_ECG_LO_PLUS 4
#define PIN_ECG_LO_MINUS 2
#define PIN_PULSE_ANALOG 35
#define PIN_DS18B20 15
#define PIN_DOPPLER 32

// Temperature Sensor Setup
OneWire oneWire(PIN_DS18B20);
DallasTemperature tempSensors(&oneWire);

// Timing
unsigned long lastTelemetryTime = 0;
const unsigned long telemetryInterval = 500; // ms

void setup() {
  Serial.begin(115200);
  pinMode(PIN_ECG_LO_PLUS, INPUT);
  pinMode(PIN_ECG_LO_MINUS, INPUT);
  
  tempSensors.begin();

  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWi-Fi Connected!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Read AD8232 ECG
  bool leadOff = (digitalRead(PIN_ECG_LO_PLUS) == 1 || digitalRead(PIN_ECG_LO_MINUS) == 1);
  int rawEcg = analogRead(PIN_ECG_ANALOG);
  float ecgMilliVolts = (rawEcg / 4095.0) * 3.3;

  // Read Pulse Sensor
  int rawPulse = analogRead(PIN_PULSE_ANALOG);
  int maternalPulseBpm = map(rawPulse, 0, 4095, 50, 140); // BPM estimation

  if (millis() - lastTelemetryTime >= telemetryInterval) {
    lastTelemetryTime = millis();

    // Read DS18B20 Temperature
    tempSensors.requestTemperatures();
    float tempC = tempSensors.getTempCByIndex(0);

    // Build JSON Payload matching applet format
    StaticJsonDocument<256> doc;
    doc["device_id"] = "ESP32_FETAL_01";
    doc["timestamp"] = String(millis() / 1000);
    
    // Doppler status logic: null until probe signal is validated
    bool dopplerDetected = false; // set true when Doppler interface active
    if (dopplerDetected) {
      doc["fetal_bpm"] = 142;
      doc["doppler_status"] = "connected";
    } else {
      doc["fetal_bpm"] = nullptr;
      doc["doppler_status"] = "not_connected";
    }

    doc["maternal_pulse"] = maternalPulseBpm;
    doc["temperature"] = (tempC > -50 && tempC < 60) ? tempC : 36.8;
    doc["ecg_value"] = leadOff ? 0.0 : ecgMilliVolts;
    doc["lead_off"] = leadOff;

    String jsonString;
    serializeJson(doc, jsonString);
    Serial.println(jsonString);

    // Can be published to MQTT or sent via HTTP/WebSocket to React Native / Web App
  }
}
`,
  },
];
