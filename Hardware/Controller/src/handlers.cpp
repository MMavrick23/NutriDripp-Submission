///////////////////////////////////////////////////////////////////////////
//////////         Interrupt Service Routines & Handlers         //////////
///////////////////////////////////////////////////////////////////////////

#include <ArduinoJson.h>

#include "config.h"
#include "handlers.h"
#include "kernel.h"
#include "module.h"

void serialEvent() {
  /////Handler For Commands Received Signal/////
  while (Serial.available()) {
    char c = (char)Serial.read();

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
  // Initialize JSON Document
  StaticJsonDocument<200> doc;

  // Deserialize Transmition String
  DeserializationError DeserializationError = deserializeJson(doc, ReceiveHandlerBuffer);
  if (!DeserializationError) {
    CommandQueue.add(KeyValuePair<const char*, JsonArray>{doc["C"], doc["P"]});
    if (doc.containsKey("R") && (int)doc["R"] == 1) Serial.print("{\"R\":1};");
  } else {
    if (!CPConnected) {
      Serial.println(F("[!] Serial processing failed."));
      Serial.print(F("    ---> "));
      Serial.println(DeserializationError.f_str());
    }
    ErrorList.add(0x001);
  }

  ReceiveHandlerBuffer = "";
  ReceiveHandlerBufferPT = false;
}

void sendRequestedSignal(TransmissionHandlingMode mode, bool sendAll) {
  /////Handler For Info Request Signal/////
  if (RequestHandlerBuffer.length() <= 0) {
    // Initialize JSON Document
    StaticJsonDocument<1024> doc;

    doc["CPT"] = CPToken;
    doc["STT"] = (Halted ? -2 : (Busy ? -1 : (Initialized ? 2 : (Booted ? 1 : 0))));

    if (mode == PRD || mode == ALL) {
      JsonObject Prod = doc.createNestedObject("PRD");
      Prod["N"] = Boot_Name;
      Prod["ID"] = Boot_LCID;
      Prod["V"] = Boot_Version;
      Prod["B"] = Boot_Build;
      Prod["T"] = Boot_Type;
    }

    if (mode == ERR || mode == ALL) {
      JsonArray Errors = doc.createNestedArray("ERR");

      JsonObject selfEntry = Errors.createNestedObject();
      selfEntry["ID"] = Boot_LCID;

      JsonArray tempErrors = selfEntry.createNestedArray("DT");;
      for (int i = 0; i < ErrorList.size(); i++)
        tempErrors.add(ErrorList.shift());

      for (int i = 0; i < SubModules.size(); i++) {
        JsonObject tempEntry = Errors.createNestedObject();
        tempEntry["ID"] = SubModules[i].LCID;
        tempEntry["STT"] = SubModules[i].Status;

        JsonArray tempErrors = tempEntry.createNestedArray("DT");
        for (int i = 0; i < SubModules[i].Errors.size(); i++)
          tempErrors.add(SubModules[i].Errors.shift());
      }
    }

    if (Initialized && (mode == DEVS || mode == ALL)) {
      JsonArray Devices = doc.createNestedArray("DEVS");

      for (int i = 0; i < SubModules.size(); i++) {
        JsonObject tempEntry = Devices.createNestedObject();
        tempEntry["STT"] = SubModules[i].Status;

        JsonObject tempDeviceData = tempEntry.createNestedObject("PRD");
        tempDeviceData["N"] = SubModules[i].Name;
        tempDeviceData["ID"] = SubModules[i].LCID;
        tempDeviceData["V"] = SubModules[i].Version;
        tempDeviceData["B"] = SubModules[i].Build;
        tempDeviceData["T"] = SubModules[i].Type;
      }
    }

    if (Initialized && (mode == DAT || mode == ALL)) {
      JsonArray Data = doc.createNestedArray("DAT");

      JsonObject selfEntry = Data.createNestedObject();
      selfEntry["ID"] = Boot_LCID;
      selfEntry["DT"] = JsonObject();

      for (int i = 0; i < SubModules.size(); i++) {
        JsonObject tempEntry = Data.createNestedObject();
        tempEntry["ID"] = SubModules[i].LCID;
        tempEntry["STT"] = SubModules[i].Status;
        tempEntry["DT"] = SubModules[i].Data;
      }
    }

    // Serialize The Transmission String
    serializeJson(doc, RequestHandlerBuffer);
    RequestHandlerBuffer += ';'; // <--- Termination character.
  }

  do {
    // Transmit & Post-Process The Transmission String
    Serial.print(RequestHandlerBuffer.substring(0, Serial_Package_Size));
    RequestHandlerBuffer.remove(0, Serial_Package_Size);

    delay(Serial_Package_Delay);
  } while (sendAll && RequestHandlerBuffer.length() > 0);
}
