/////////////////////////////////////////////////////////////////////
//////////          Main Runtime & Operation Class         //////////
/////////////////////////////////////////////////////////////////////

#include "config.h"
#include "kernel.h"
#include "handlers.h"
#include "module.h"

void setup() {
  /////Boot & Startup Procedures (No Initialization)/////
  if (powerOn()) {
    loadSettings();
    if (!loadSW()) {
      if (!CPConnected) {
        Serial.println();
        Serial.println(F("---------- Boot Failed ----------"));
      }

      goto StartupComplete;
    }
  }

  delay(100);
  if (!CPConnected) {
    Serial.println(F("-------- Boot Completed --------"));
    Serial.println();
  }

StartupComplete:
  interrupts();
}

void loop() {
  /////Main Service Routine/////
  while (CommandQueue.size() > 0) {
    if (strcmp(CommandQueue[0].Key, "get") == 0) {
      if (CommandQueue[0].Value.size() > 0) {
        sendRequestedSignal((TransmissionHandlingMode)((int)CommandQueue[0].Value[0]));
      }
    } else if (strcmp(CommandQueue[0].Key, "init") == 0) {
      initialize((CommandQueue[0].Value.size() > 0 ? (bool)CommandQueue[0].Value[0] : false));
    } else if (strcmp(CommandQueue[0].Key, "initModule") == 0) {
      if (CommandQueue[0].Value.size() > 0) {
        digitalWrite(52, true);
        for (int i = 0; i < SubModules.size(); i++) {
          if (SubModules[i].LCID == CommandQueue[0].Value[0]) {
            digitalWrite(53, true);
            JsonArray tP;
            if (CommandQueue[0].Value.size() > 1) tP.add(CommandQueue[0].Value[1]);
            SubModules[i].sendCommand("init", tP);
          }
        }
      }
    }

    delay(50);
    CommandQueue.shift();
  }

  if (Booted) {
    if (Initialized) {
      for (int i = 0; i < SubModules.size(); i++) {
        SubModules[i].pollNewData(ERR);
        SubModules[i].pollNewData(DAT);
      }
    }

    delay(100);
  } else {
    delay(1000);
  }
}
