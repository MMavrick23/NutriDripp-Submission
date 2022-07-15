/////////////////////////////////////////////////////////////////////
////////// Generic Variables & Constants Definitions Class //////////
/////////////////////////////////////////////////////////////////////

#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>
#include <LinkedList.h>
#include <ArduinoJson.h>

// Custom Structs
template <typename T1, typename T2>
struct KeyValuePair {
  T1 Key;
  T2 Value;
};

// GPIO Pin Mapping Definitions


// Parameters Configuration
#define Boot_Name                     "NexusDripp"
#define Boot_LCID               "8UqRNSn5f23GHsLP"
#define Boot_Version                       "0.0.0"
#define Boot_Build                               1
#define Boot_Type                                0
#define EEPROM_Reset                          true
#define EEPROM_Bytes                             4

// Serial Configuration
#define Serial_Baud                         115200
#define Serial_Package_Size                     60
#define Serial_Package_Delay                   250
#define Serial_Handshake_TimeOut              3000

// I2C Network Configuration
#define I2C_Package_Size                        30
#define I2C_Timeout                           1000

// Settings and Calibrarions


inline LinkedList<int> ErrorList;
inline LinkedList<KeyValuePair<const char*, JsonArray>> CommandQueue;

// EEPROM Addresses
#define Valid_EEPROMs_Addr                      0 //Int   = 2 byte(s).
#define Boot_Build_Addr                         2 //Int   = 2 byte(s).

#endif
