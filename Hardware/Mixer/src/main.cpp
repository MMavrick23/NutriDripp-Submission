/////////////////////////////////////////////////////////////////////
//////////          Main Runtime & Operation Class         //////////
/////////////////////////////////////////////////////////////////////

#include "kernel.h"
#include "system.h"
#include "handlers.h"

void setup() {
  /////Boot & Startup Procedures (No Initialization)/////
  if (powerOn()) {
    loadSettings();
    if (!loadSW()) {
      Serial.println();
      Serial.println(F("---------- Boot Failed ----------"));
    }

    goto StartupComplete;
  }

  delay(100);
  Serial.println(F("-------- Boot Completed --------"));
  Serial.println();

StartupComplete:
  interrupts();
}

void loop() {
  /////Main Service Routine/////
  while (CommandQueue.size() > 0) {
    if (strcmp(CommandQueue[0].Key, "setTHM") == 0) {
      if (CommandQueue[0].Value.size() > 0) {
        ReceiveHandlerTransmissionMode = (int)CommandQueue[0].Value[0];
      } else if (strcmp(CommandQueue[0].Key, "init") == 0) {
        initialize((CommandQueue[0].Value.size() > 0 ? (bool)CommandQueue[0].Value[0] : false));
      } else if (strcmp(CommandQueue[0].Key, "reset") == 0) {
        softReset();
      }
    } else if (Booted) {
      if (strcmp(CommandQueue[0].Key, "setCONF") == 0) {
        switch (CommandQueue[0].Value.size()) {
          case 2:
            FlowMeterPercisionTolerance = (float)CommandQueue[0].Value[1];

          case 1:
            FlowMeterCalculationDuration = (int)CommandQueue[0].Value[0];
            break;
        }

        saveSettings();
      } else if (strcmp(CommandQueue[0].Key, "setCAL") == 0) {
        switch (CommandQueue[0].Value.size()) {
          case 6:
            FlowMeterOutPulseRate = (float)CommandQueue[0].Value[5];

          case 5:
            FlowMeterInPulseRate = (float)CommandQueue[0].Value[4];

          case 4:
            ValveOutAngleMax = (int)CommandQueue[0].Value[3];

          case 3:
            ValveInAngleMax = (int)CommandQueue[0].Value[2];

          case 2:
            ValveOutAngleMin = (int)CommandQueue[0].Value[1];

          case 1:
            ValveInAngleMin = (int)CommandQueue[0].Value[0];
            break;
          }

        saveSettings();
      }
    } else if (Initialized) {
      if (strcmp(CommandQueue[0].Key, "setValveIn") == 0) {
        switch (CommandQueue[0].Value.size()) {
          case 1:
            setValveIn((bool)CommandQueue[0].Value[0]);
            break;

          case 2:
            setValveIn((bool)CommandQueue[0].Value[0],(bool)CommandQueue[0].Value[1]);
            break;
        }
      } else if (strcmp(CommandQueue[0].Key, "setValveOut") == 0) {
        switch (CommandQueue[0].Value.size()) {
          case 1:
            setValveOut((bool)CommandQueue[0].Value[0]);
            break;

          case 2:
            setValveOut((bool)CommandQueue[0].Value[0],(bool)CommandQueue[0].Value[1]);
            break;
        }
      } else if (strcmp(CommandQueue[0].Key, "setPumpIn") == 0) {
        if (CommandQueue[0].Value.size() > 0) {
          setPumpInState((bool)CommandQueue[0].Value[0]);
        }
      } else if (strcmp(CommandQueue[0].Key, "setPumpOut") == 0) {
        if (CommandQueue[0].Value.size() > 0) {
          setPumpOutState((bool)CommandQueue[0].Value[0]);
        }
      } else if (strcmp(CommandQueue[0].Key, "setMixer") == 0) {
        if (CommandQueue[0].Value.size() > 0) {
          setMixerState((bool)CommandQueue[0].Value[0]);
        }
      } else if (strcmp(CommandQueue[0].Key, "setPeltier") == 0) {
        switch (CommandQueue[0].Value.size()) {
          case 1:
            setPeltierState((bool)CommandQueue[0].Value[0]);
            break;

          case 2:
            setPeltierState((bool)CommandQueue[0].Value[0],(bool)CommandQueue[0].Value[1]);
            break;
        }
      }
    }

    delay(50);
    CommandQueue.shift();
  }

  if (Booted) {
    if (Initialized) {
      readTemperature();
      readFlowRateIn();
      readFlowRateOut();
    }
    delay(100);
  } else {
    delay(1000);
  }
}
