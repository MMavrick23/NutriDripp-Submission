/////////////////////////////////////////////////////////////////////
//////////         System Backbone & Basic Methods         //////////
/////////////////////////////////////////////////////////////////////

#ifndef KERNEL_H
#define KERNEL_H

#include <Servo.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#include "config.h"

inline OneWire OneWire(OneWirePin);
inline DallasTemperature OneWireSensors(&OneWire);

inline Servo ValveIn;
inline Servo ValveOut;
inline DeviceAddress TemperatureSensor;

inline bool Busy;
inline bool Halted;
inline bool Booted;
inline bool Initialized;

bool powerOn();
bool loadSW();
bool initialize(bool skipDiagnosis = false);
void loadSettings();
void saveSettings();
void softReset();

#endif
