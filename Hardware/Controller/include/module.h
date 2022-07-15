////////////////////////////////////////////////////////////////////
//////////       Hardware Module Library & Handlers       //////////
////////////////////////////////////////////////////////////////////

#ifndef MODULE_H
#define MODULE_H

#include <Arduino.h>

#include "config.h"
#include "handlers.h"

class HardwareModule {
  private:
    byte I2C_Address;

  public:
    String Name;
    String LCID;
    String Version;
    int Build;
    int Type;

    int Status;

    LinkedList<int> Errors;
    JsonObject Data;

    ///////////////////////////////////////

    bool sendCommand(const char* command, JsonArray parameters = JsonArray());
    JsonObject requestData(TransmissionHandlingMode dataType);
    void pollNewData(TransmissionHandlingMode dataType);

    ///////////////////////////////////////

    static bool scanForModules();
};

inline LinkedList<HardwareModule> SubModules;

#endif
