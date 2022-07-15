/////////////////////////////////////////////////////////////////////
//////////         System Backbone & Basic Methods         //////////
/////////////////////////////////////////////////////////////////////

#include <Wire.h>

#include "kernel.h"
#include "handlers.h"
#include "system.h"
#include "functions.h"

bool powerOn() {
  return true;
}

bool loadSW() {
  /////Startup Procedures/////

  // Starting Up Serial
  Serial.begin(Serial_Baud);

  Serial.print(Boot_Name);
  Serial.print(F(" V"));
  Serial.println(Boot_Version);
  Serial.print(F("SN:"));
  Serial.println(Boot_LCID);
  Serial.println();
  delay(100);

  delay(100);
  Serial.print(F("----- Loading Firmware B"));
  Serial.print(Boot_Build);
  Serial.println(F(" -----"));
  delay(50);
  ////////////////////////////////////////////////

  noInterrupts();

  // Initializing Critical Variables
  delay(100);
  Serial.print(F("> Initializing Variables..."));

  Busy = true;
  Halted = false;
  Booted = false;
  Initialized = false;
  ErrorList = LinkedList<int>();
  ReceiveHandlerTransmissionMode = ALL;
  CommandQueue = LinkedList<KeyValuePair<const char*, JsonArray>>();

  Serial.println(F(" [DONE]"));
  delay(50);
  ////////////////////////////////////////////////

  // Starting I2C Network
  delay(100);
  Serial.print(F("> Starting I2C..."));

  Wire.begin(I2C_Address);
  Wire.onReceive(signalReceiveHandler);
  Wire.onRequest(signalRequestHandler);

  Serial.println(F(" [DONE]"));
  delay(50);
  ////////////////////////////////////////////////

  // Setting Up Pins
  delay(100);
  Serial.print(F("> Setting IO Ports..."));

  pinMode(ValveInPin, OUTPUT);
  pinMode(ValveOutPin, OUTPUT);
  pinMode(PumpOutPin, OUTPUT);
  pinMode(MixerPin, OUTPUT);
  pinMode(PeltierPin, OUTPUT);
  pinMode(PeltierModePin, OUTPUT);
  pinMode(FlowMeterInPin, INPUT);
  pinMode(FlowMeterOutPin, INPUT);
  pinMode(SoftResetPin, OUTPUT);

  Serial.println(F(" [DONE]"));
  delay(50);
  ////////////////////////////////////////////////

  // Initailzing Actuators
  delay(100);
  Serial.print(F("> Starting Actuators..."));

  // ---> Valve In
  ValveIn.attach(ValveInPin);
  ValveIn.write(ValveInAngleMin);

  delay(50);

  // ---> Valve Out
  ValveOut.attach(ValveOutPin);
  ValveOut.write(ValveOutAngleMin);

  delay(50);

  // ---> Mixer
  digitalWrite(MixerPin, false);

  Serial.println(F(" [DONE]"));
  delay(50);
  ////////////////////////////////////////////////

  // Initailzing Sensors
  delay(100);
  Serial.print(F("> Starting Sensors..."));

  // ---> Temperature
  OneWireSensors.begin();
  if (!OneWireSensors.getAddress(TemperatureSensor, 0)) {
    Serial.println(F(" [FAIL]\n    ---> No temperature sensor."));
    ErrorList.add(0x01);
    goto FailedBoot;
  }

  delay(50);

  // ---> FLow Sensor In
  FlowMeterInCalcularionStartTime = 0;
  FlowMeterInPulsesCount = 0;
  attachInterrupt(digitalPinToInterrupt(FlowMeterInPin), flowMeterInPulseHandler, CHANGE);

  delay(50);

  // ---> FLow Sensor Out
  FlowMeterOutCalcularionStartTime = 0;
  FlowMeterOutPulsesCount = 0;
  attachInterrupt(digitalPinToInterrupt(FlowMeterOutPin), flowMeterOutPulseHandler, CHANGE);

  Serial.println(F(" [DONE]"));
  delay(50);
  ////////////////////////////////////////////////

  delay(100);
  Serial.println();

  interrupts();
  Busy = false;
  Booted = true;
  return true;

FailedBoot:
  interrupts();
  Busy = false;
  Booted = false;
  return false;
}

bool initialize(bool skipDiagnosis) {
  if (!Initialized) {
    if (Booted) {
      /////Initializing Result Variables & Functions/////

      // Starting Up Init
      delay(100);
      Serial.println(F("--------- Initializing ---------"));
      delay(50);
      ////////////////////////////////////////////////

      Busy = true;

      // Initializing Variables
      delay(100);
      Serial.print(F("> Initializing Variables..."));

      Temperature = 0;
      FlowRateIn = 0;
      FlowRateOut = 0;
      ReservoirQTY = 0;

      ValveInState = false;
      ValveOutState = false;

      Serial.println(F(" [DONE]"));
      delay(50);
      ////////////////////////////////////////////////

      // Initializing Sensors
      delay(100);
      Serial.print(F("> Starting Sensors..."));

      // ---> Tempreature
      OneWireSensors.setResolution(TemperatureSensor, 9);
      if (!readTemperature(true, true) && !skipDiagnosis) {
        Serial.println(F(" [FAIL]\n    ---> Bad temperature sensor."));
        ErrorList.add(0x01);
        goto FailedInitialization;
      }

      delay(50);

      // ---> Flow Sensor In
      delay(FlowMeterCalculationDuration);
      readFlowRateIn();
      if (!skipDiagnosis && FlowRateIn >= FlowMeterPercisionTolerance) {
        Serial.println(F(" [FAIL]\n    ---> Bad flow meter 1."));
        ErrorList.add(0x02);
        goto FailedInitialization;
      }

      delay(50);

      // ---> Flow Sensor Out
      delay(FlowMeterCalculationDuration);
      readFlowRateOut();
      if (!skipDiagnosis && FlowRateOut >= FlowMeterPercisionTolerance) {
        Serial.println(F(" [FAIL]\n    ---> Bad flow meter 2."));
        ErrorList.add(0x03);
        goto FailedInitialization;
      }

      Serial.println(F(" [DONE]"));
      delay(50);
      ////////////////////////////////////////////////

      if (!skipDiagnosis) {
        // Initailzing Actuators
        delay(100);
        Serial.print(F("> Testing Actuators..."));

        // ---> Valve In
        if (!setValveIn(false, true, true, true)) {
          Serial.println(F(" [FAIL]\n    ---> Bad valve 1."));
          ErrorList.add(0x04);
          goto FailedInitialization;
        }

        delay(2500);

        if (!setValveIn(false, true, true, true)) {
          Serial.println(F(" [FAIL]\n    ---> Bad valve 1."));
          ErrorList.add(0x04);
          goto FailedInitialization;
        }

        delay(50);

        // ---> Valve Out
        if (!setValveOut(true, true, true, true)) {
          Serial.println(F(" [FAIL]\n    ---> Bad valve 2."));
          ErrorList.add(0x05);
          goto FailedInitialization;
        }

        delay(2500);

        if (!setValveOut(false, true, true, true)) {
          Serial.println(F(" [FAIL]\n    ---> Bad valve 2."));
          ErrorList.add(0x05);
          goto FailedInitialization;
        }

        Serial.println(F(" [DONE]"));
        delay(50);
        ////////////////////////////////////////////////

        // Test Reservoir Calculations
        delay(100);
        Serial.print(F("> Testing Reservoir..."));

        while (ReservoirQTY < (2 - FlowMeterPercisionTolerance)) {
          if (!setValveIn(true))
            goto FailedInitialization;

          delay(50);
        }

        if (!setValveIn(false))
          goto FailedInitialization;

        delay(250);

        while (ReservoirQTY > (0 + FlowMeterPercisionTolerance)) {
          if (!setValveOut(true))
            goto FailedInitialization;

          delay(50);
        }

        if (!setValveOut(false))
          goto FailedInitialization;

        delay(1000);

        if (setValveOut(true)) {
          setValveOut(false);

          Serial.println(F(" [FAIL]\n    ---> Bad reservoir reading."));
          ErrorList.add(0x07);
          goto FailedInitialization;
        }

        Serial.println(F(" [DONE]"));
        delay(50);
      }

      ////////////////////////////////////////////////

      delay(100);
      Serial.println();
      Serial.println(F("--- Initialization Completed ---"));
      Serial.println();

      Busy = false;
      Initialized = true;
      return true;
    } else {
      ErrorList.add(0x00);
    }

  FailedInitialization:
    delay(100);
    Serial.println();
    Serial.println(F("---- Initialization Failed ----"));
    Serial.println();

    Busy = false;
    Initialized = false;
    return false;
  } else {
    return true;
  }
}

void loadSettings() {
  int Valid_EEPROMs;
  int Old_Boot_Build;

  readEEPROM(Valid_EEPROMs_Addr, Valid_EEPROMs);
  readEEPROM(Boot_Build_Addr, Old_Boot_Build);

  bool First_Boot = (Valid_EEPROMs <= 0);

  if (!(First_Boot || (EEPROM_Reset && Old_Boot_Build != Boot_Build))) {
    loadValidEEPROM(FlowMeterCalculationDurationAddr, FlowMeterCalculationDuration, Valid_EEPROMs);
    loadValidEEPROM(FlowMeterPercisionToleranceAddr, FlowMeterPercisionTolerance, Valid_EEPROMs);

    loadValidEEPROM(ValveInAngleMinAddr, ValveInAngleMin, Valid_EEPROMs);
    loadValidEEPROM(ValveOutAngleMinAddr, ValveOutAngleMin, Valid_EEPROMs);
    loadValidEEPROM(ValveInAngleMaxAddr, ValveInAngleMax, Valid_EEPROMs);
    loadValidEEPROM(ValveOutAngleMaxAddr, ValveOutAngleMax, Valid_EEPROMs);
    loadValidEEPROM(FlowMeterInPulseRateAddr, FlowMeterInPulseRate, Valid_EEPROMs);
    loadValidEEPROM(FlowMeterOutPulseRateAddr, FlowMeterOutPulseRate, Valid_EEPROMs);
  }

  saveSettings();
}

void saveSettings() {
  writeEEPROM(Valid_EEPROMs_Addr, EEPROM_Bytes);
  writeEEPROM(Boot_Build_Addr, Boot_Build);

  writeEEPROM(FlowMeterCalculationDurationAddr, FlowMeterCalculationDuration);
  writeEEPROM(FlowMeterPercisionToleranceAddr, FlowMeterPercisionTolerance);

  writeEEPROM(ValveInAngleMinAddr, ValveInAngleMin);
  writeEEPROM(ValveOutAngleMinAddr, ValveOutAngleMin);
  writeEEPROM(ValveInAngleMaxAddr, ValveInAngleMax);
  writeEEPROM(ValveOutAngleMaxAddr, ValveOutAngleMax);
  writeEEPROM(FlowMeterInPulseRateAddr, FlowMeterInPulseRate);
  writeEEPROM(FlowMeterOutPulseRateAddr, FlowMeterOutPulseRate);
}

void softReset() {
  digitalWrite(SoftResetPin, HIGH);
}
