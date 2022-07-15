/////////////////////////////////////////////////////////////////////
//////////         System Backbone & Basic Methods         //////////
/////////////////////////////////////////////////////////////////////

#include <Wire.h>
#include <ArduinoJson.h>

#include "config.h"
#include "kernel.h"
#include "handlers.h"
#include "module.h"
#include "functions.h"

bool powerOn() {
  return true;
}

bool loadSW() {
  /////Startup Procedures/////

  // Starting Up Serial
  Serial.begin(Serial_Baud);

  long bootInitStart = millis();
  while (bootInitStart + Serial_Handshake_TimeOut > millis()) {
    serialEvent();
    if (CommandQueue.size() > 0) {
      if (strcmp(CommandQueue[0].Key, "setCP") == 0) {
        if (CommandQueue[0].Value.size() > 0) {
          CPToken = (const char*)CommandQueue[0].Value[0];
          CPConnected = true;
          break;
        }

        CommandQueue.shift();
      }
    }
  }

  if (!CPConnected) {
    Serial.print(Boot_Name);
    Serial.print(F(" V"));
    Serial.println(Boot_Version);
    Serial.print(F("SN:"));
    Serial.println(Boot_LCID);
    Serial.println();
  } else {
    sendRequestedSignal(PRD);
  }
  delay(100);

  delay(100);
  if (!CPConnected) {
    Serial.print(F("----- Loading Firmware B"));
    Serial.print(Boot_Build);
    Serial.println(F(" -----"));
  }
  delay(50);
  ////////////////////////////////////////////////

  noInterrupts();

  // Initializing Critical Variables
  delay(100);
  if (!CPConnected) Serial.print(F("> Initializing Variables..."));

  Busy = true;
  Halted = false;
  Booted = false;
  Initialized = false;
  ErrorList = LinkedList<int>();
  CommandQueue = LinkedList<KeyValuePair<const char*, JsonArray>>();
  SubModules = LinkedList<HardwareModule>();

  if (!CPConnected) Serial.println(F(" [DONE]"));
  delay(50);
  ////////////////////////////////////////////////

  // Starting I2C Network
  delay(100);
  if (!CPConnected) Serial.print(F("> Starting I2C..."));

  Wire.begin();
  Wire.setWireTimeout(I2C_Timeout * 1000, true);
  delay(250);

  if (!CPConnected) Serial.println(F(" [DONE]"));
  delay(50);
  ////////////////////////////////////////////////

  // Setting Up Pins
  delay(100);
  if (!CPConnected) Serial.print(F("> Setting Up IO Ports..."));

  //pinMode(Pin_Number, Mode);

  if (!CPConnected) Serial.println(F(" [DONE]"));
  delay(50);
  ////////////////////////////////////////////////

  delay(100);
  if (!CPConnected) Serial.println();

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
      if (!CPConnected) Serial.println(F("--------- Initializing ---------"));
      delay(50);
      ////////////////////////////////////////////////

      Busy = true;

      // Initializing Variables
      delay(100);
      if (!CPConnected) Serial.print(F("> Initializing Variables..."));

      ///// Some code here that is not decided yet.

      if (!CPConnected) Serial.println(F(" [DONE]"));
      delay(50);
      ////////////////////////////////////////////////

      // Getting modules
      delay(100);
      if (!CPConnected) Serial.print(F("> Connecting sub-modules..."));

      if (!HardwareModule().scanForModules()) {
        if (!CPConnected) Serial.println(F(" [FAIL]\n    ---> Could not connect to one or more sub-modules."));
        ErrorList.add(0x01);
        goto FailedInitialization;
      }

      if (!CPConnected) Serial.println(F(" [DONE]"));
      delay(50);

      ////////////////////////////////////////////////

      delay(100);
      if (!CPConnected) {
        Serial.println();
        Serial.println(F("--- Initialization Completed ---"));
        Serial.println();
      }

      Busy = false;
      Initialized = true;
      return true;
    } else {
      ErrorList.add(0x00);
    }

  FailedInitialization:
    delay(100);
    if (!CPConnected) {
      Serial.println();
      Serial.println(F("---- Initialization Failed ----"));
      Serial.println();
    }

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
    // loadValidEEPROM(Address, Variable, Valid_EEPROMs);
  }

  saveSettings();
}

void saveSettings() {
  writeEEPROM(Valid_EEPROMs_Addr, EEPROM_Bytes);
  writeEEPROM(Boot_Build_Addr, Boot_Build);
}
