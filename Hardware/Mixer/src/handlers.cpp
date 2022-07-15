///////////////////////////////////////////////////////////////////////////
//////////         Interrupt Service Routines & Handlers         //////////
///////////////////////////////////////////////////////////////////////////

#include <Wire.h>

#include "config.h"
#include "handlers.h"
#include "kernel.h"
#include "system.h"

void signalReceiveHandler(int bytesCount) {
  /////Handler For Commands Received Signal/////
  while (Wire.available()) {
    char c = (char)Wire.read();

    if (c == '}') {
      ReceiveHandlerBufferPT = true;
    } else if (ReceiveHandlerBufferPT) {
      if (c == ';')
        goto ReceiveSignalComplete;
      else
        ReceiveHandlerBufferPT = false;
    }

    ReceiveHandlerBuffer += c;
  }

  return;

ReceiveSignalComplete:
  if (Booted && !Busy) {
    // Initialize JSON Document
    StaticJsonDocument<75> doc;

    // Deserialize Transmition String
    DeserializationError DeserializationError = deserializeJson(doc, ReceiveHandlerBuffer);
    if (!DeserializationError) {
      CommandQueue.add(KeyValuePair<const char*, JsonArray>{doc["C"], doc["P"]});
    } else {
      Serial.println(F("[!] I2C processing failed."));
      Serial.print(F("    ---> "));
      Serial.println(DeserializationError.f_str());
      ErrorList.add(0x06);
    }
  }

  ReceiveHandlerBuffer = "";
  ReceiveHandlerBufferPT = false;
}

void signalRequestHandler() {
  /////Handler For Info Request Signal/////
  if (RequestHandlerBuffer.length() <= 0) {
    // Initialize JSON Document
    StaticJsonDocument<250> doc;

    doc["STT"] = (Halted ? -2 : (Busy ? -1 : (Initialized ? 2 : (Booted ? 1 : 0))));

    if (ReceiveHandlerTransmissionMode == PRD || ReceiveHandlerTransmissionMode == ALL) {
      JsonObject Prod = doc.createNestedObject("PRD");
      Prod["N"] = Boot_Name;
      Prod["ID"] = Boot_LCID;
      Prod["V"] = Boot_Version;
      Prod["B"] = Boot_Build;
      Prod["T"] = Boot_Type;
    }

    if (ReceiveHandlerTransmissionMode == ERR || ReceiveHandlerTransmissionMode == ALL) {
      JsonArray ERR = doc.createNestedArray("ERR");
      for (int i = 0; i < ErrorList.size(); i++)
        ERR.add(ErrorList.shift());
    }

    if (Booted) {
      if (ReceiveHandlerTransmissionMode == CONF || ReceiveHandlerTransmissionMode == ALL) {
        JsonObject Config = doc.createNestedObject("CONF");
        Config["FCD"] = FlowMeterCalculationDuration;
        Config["FPT"] = FlowMeterPercisionTolerance;
      }

      if (ReceiveHandlerTransmissionMode == CAL || ReceiveHandlerTransmissionMode == ALL) {
        JsonObject Calib = doc.createNestedObject("CAL");
        Calib["VIN"] = ValveInAngleMin;
        Calib["VON"] = ValveOutAngleMin;
        Calib["VIX"] = ValveInAngleMax;
        Calib["VOX"] = ValveOutAngleMax;
        Calib["FIR"] = FlowMeterInPulseRate;
        Calib["FOR"] = FlowMeterOutPulseRate;
      }
    }

    if (Initialized && (ReceiveHandlerTransmissionMode == DAT || ReceiveHandlerTransmissionMode == ALL)) {
      JsonObject Data = doc.createNestedObject("DAT");
      Data["FT"] = (Temperature != DEVICE_DISCONNECTED_C ? Temperature : 0);
      Data["FI"] = FlowRateIn;
      Data["FO"] = FlowRateOut;
      Data["RQ"] = ReservoirQTY;
      Data["VI"] = (ValveInState ? 1 : 0);
      Data["VO"] = (ValveOutState ? 1 : 0);
      Data["PI"] = (PumpInState ? 1 : 0);
      Data["PO"] = (PumpOutState ? 1 : 0);
      Data["MS"] = (MixerState ? 1 : 0);
      Data["PS"] = (PeltierState ? 1 : 0);
      Data["PM"] = (PeltierMode ? 1 : 0);
    }

    // Serialize The Transmission String
    serializeJson(doc, RequestHandlerBuffer);
    RequestHandlerBuffer += ';'; // <--- Termination character.

    ReceiveHandlerTransmissionMode = ALL;
  }

  // Transmit & Post-Process The Transmission String
  Wire.write(RequestHandlerBuffer.substring(0, I2C_Package_Size).c_str());
  RequestHandlerBuffer.remove(0, I2C_Package_Size);
}

void flowMeterInPulseHandler() {
  // FlowMeterInPulsesCount++;
}

void flowMeterOutPulseHandler() {
  // FlowMeterOutPulsesCount++;
}
