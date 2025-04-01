#include "ACS712.h"
#include <ArduinoJson.h>

// Déclaration des capteurs de courant sur les broches A0 à A5
ACS712 sensors[] = {
  ACS712(ACS712_05B, A0),
  ACS712(ACS712_05B, A1),
  ACS712(ACS712_05B, A2),
  ACS712(ACS712_05B, A3),
  ACS712(ACS712_05B, A4),
  ACS712(ACS712_05B, A5)
};

const int numSensors = 6;
const int flameSensorPin = 2;  // Broche du capteur de flamme

void setup() {
  Serial.begin(115200);
  
  pinMode(flameSensorPin, INPUT_PULLUP);  // Activer la résistance de pull-up
  for (int i = 0; i < numSensors; i++) {
    sensors[i].calibrate();
  }
}

void loop() {
  StaticJsonDocument<256> jsonDoc;
  JsonArray data = jsonDoc.createNestedArray("sensors");

  for (int i = 0; i < numSensors; i++) {
    float I = sensors[i].getCurrentAC();
    if (I < 0.09 || I > 1) {
      I = 0;
    }
    data.add(I);
  }

  int flameDetected = digitalRead(flameSensorPin) == LOW ? 1 : 0; // Détection de flamme

  jsonDoc["flame"] = flameDetected; // Ajouter l'état du capteur au JSON

  serializeJson(jsonDoc, Serial);
  Serial.println();

  delay(1000);
}
