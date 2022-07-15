/////////////////////////////////////////////////////////////////////
//////////         System Backbone & Basic Methods         //////////
/////////////////////////////////////////////////////////////////////

#ifndef KERNEL_H
#define KERNEL_H

#include <Arduino.h>

inline bool Busy;
inline bool Halted;
inline bool Booted;
inline bool Initialized;
inline bool CPConnected;

bool powerOn();
bool loadSW();
bool initialize(bool skipDiagnosis = false);
void loadSettings();
void saveSettings();

#endif
