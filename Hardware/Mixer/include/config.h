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
#define FlowMeterInPin                           2
#define FlowMeterOutPin                          3
#define OneWirePin                               4

#define ValveInPin                               5
#define ValveOutPin                              6
#define PumpInPin                                7
#define PumpOutPin                               8
#define MixerPin                                 9
#define PeltierPin                              10
#define PeltierModePin                          11

#define SoftResetPin                            12

// Parameters Configuration
#define Boot_Name                    "NutriFusion"
#define Boot_LCID               "p6BkhD8aBnJFvhta"
#define Boot_Version                      "1.1.23"
#define Boot_Build                              18
#define Boot_Type                                1
#define Serial_Baud                           9600
#define EEPROM_Reset                         false
#define EEPROM_Bytes                            36

// I2C Network Configuration
#define I2C_Address                           0x09
#define I2C_Package_Size                        30

// Settings and Calibrarions
inline int FlowMeterCalculationDuration    = 1000;
inline float FlowMeterPercisionTolerance   =  0.2;

inline int ValveInAngleMin                 =    0;
inline int ValveOutAngleMin                =    0;
inline int ValveInAngleMax                 =   90;
inline int ValveOutAngleMax                =   90;
inline float FlowMeterInPulseRate          =  5.5;
inline float FlowMeterOutPulseRate         =  5.5;

inline LinkedList<int> ErrorList;
inline LinkedList<KeyValuePair<const char*, JsonArray>> CommandQueue;

// EEPROM Addresses
#define Valid_EEPROMs_Addr                      0 //Int   = 2 byte(s).
#define Boot_Build_Addr                         2 //Int   = 2 byte(s).

#define FlowMeterCalculationDurationAddr       10 //Int   = 2 byte(s).
#define FlowMeterPercisionToleranceAddr        12 //Float = 4 byte(s).

#define ValveInAngleMinAddr                    20 //Int   = 2 byte(s).
#define ValveOutAngleMinAddr                   22 //Int   = 2 byte(s).
#define ValveInAngleMaxAddr                    24 //Int   = 2 byte(s).
#define ValveOutAngleMaxAddr                   26 //Int   = 2 byte(s).
#define FlowMeterInPulseRateAddr               28 //Float = 4 byte(s).
#define FlowMeterOutPulseRateAddr              32 //Float = 4 byte(s).

#endif
