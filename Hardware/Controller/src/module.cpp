////////////////////////////////////////////////////////////////////
//////////       Hardware Module Library & Handlers       //////////
////////////////////////////////////////////////////////////////////

#include <Wire.h>

#include "module.h"
#include "kernel.h"
#include "functions.h"

static bool HardwareModule::scanForModules() {
  for (byte currentAddress = 1; currentAddress < 127; ++currentAddress) {
    Wire.beginTransmission(currentAddress);
    byte error = Wire.endTransmission();

    switch (error) {
      case 0:
        HardwareModule tempModule = HardwareModule();
        tempModule.I2C_Address = currentAddress;

        tempModule.pollNewData(PRD);
        tempModule.pollNewData(ERR);
        tempModule.pollNewData(DAT);

        SubModules.add(tempModule);
        break;

      case 1:
      case 3:
      case 4:
        SubModules.clear();
        return false;

      case 2:
      case 5:
      default:
        Wire.clearWireTimeoutFlag();
        break;
    }
  }

  return true;
}

bool HardwareModule::sendCommand(const char* command, JsonArray parameters) {
  String tempBuffer;

  StaticJsonDocument<150> writeDoc;
  writeDoc["C"] = command;

  JsonArray writeP = writeDoc.createNestedArray("P");
  for (int i = 0; i < parameters.size(); i++) {
    writeP.add(parameters[i]);
  }

  serializeJson(writeDoc, tempBuffer);
  tempBuffer += ';';

  while (tempBuffer.length() > 0) {
    Wire.beginTransmission(I2C_Address);
    Wire.write(tempBuffer.substring(0, I2C_Package_Size).c_str());
    byte error = Wire.endTransmission();

    if (error == 2 || error == 5) {
      Status = -3;
      return false;
    }

    tempBuffer.remove(0, I2C_Package_Size);
    delay(50);
  }

  return true;
}

JsonObject HardwareModule::requestData(TransmissionHandlingMode dataType) {
  String tempBuffer = "";
  bool tempBufferPT = false;

  JsonArray writeP;
  writeP.add((int)dataType);

  if (!sendCommand("setTHM", writeP)) goto tempSignalFailed;

  delay(I2C_Timeout);

  long waitMillis = millis();
  while (waitMillis + 3000 > millis()) {
    Wire.requestFrom(I2C_Address, I2C_Package_Size);
    while (Wire.available()) {
      char c = (char)Wire.read(); // receive a byte as character

      if (c == '}') {
        tempBufferPT = true;
      } else if (tempBufferPT) {
        if (c == ';') {
          goto tempSignalComplete;
        } else {
           tempBufferPT = false;
        }
      }

      tempBuffer += c;
    }

    delay(50);
  }

  tempSignalFailed:
  return JsonObject();

  tempSignalComplete:
  // Initialize JSON Document
  StaticJsonDocument<400> readDoc;

  // Deserialize Transmition String
  DeserializationError DeserializationError = deserializeJson(readDoc, tempBuffer);
  if (!DeserializationError) {
    return readDoc.as<JsonObject>();
  } else {
    if (!CPConnected) {
      Serial.println(F("[!] I2C processing failed."));
      Serial.print(F("    ---> "));
      Serial.println(DeserializationError.f_str());
    }

    ErrorList.add(0x001);
    return JsonObject();
  }
}

void HardwareModule::pollNewData(TransmissionHandlingMode dataType) {
  JsonObject tempBuffer = requestData(dataType);
  if (tempBuffer.size() > 0) {
    if (tempBuffer.containsKey("STT")) {
      Status = (int)tempBuffer["STT"];
    } else {
      //Error//
    }

    switch (dataType) {
      case PRD:
        if (tempBuffer.containsKey("PRD")) {
          JsonObject tempPRD = tempBuffer["PRD"];

          Name = (char*)tempPRD["N"];
          LCID = (char*)tempPRD["ID"];
          Version = (char*)tempPRD["V"];
          Build = (int)tempPRD["B"];
          Type = (int)tempPRD["T"];
        }
        break;

      case ERR:
        if (tempBuffer.containsKey("ERR")) {
          JsonArray tempERR = (JsonArray)tempBuffer["ERR"];
          for (int i = 0; i < tempERR.size(); i++) {
            int tempError = (int)tempERR[i];
            if (!LinkedListContains(tempError, Errors))
              Errors.add(tempError);
          }
        }
        break;

      case DAT:
        if (tempBuffer.containsKey("DAT")) {
          Data = (JsonObject)tempBuffer["DAT"];
        }
        break;

      default:
        break;
    }
  }
}
