////////////////////////////////////////////////////////////////////
//////////         Additional Functions & Methods         //////////
////////////////////////////////////////////////////////////////////

#ifndef FUNCTIONS_H
#define FUNCTIONS_H

#include <Arduino.h>
#include <EEPROM.h>

template <typename T> void readEEPROM(int address, T& target) {
  byte* p = (byte*)(void*)&target;
  for (int i = 0; i < sizeof(target); i++)
        *p++ = EEPROM.read(address++);
}

template <typename T> void writeEEPROM(int address, T const& value) {
  const byte* p = (const byte*)(const void*)&value;
  for (int i = 0; i < sizeof(value); i++)
    EEPROM.update(address++, *p++);
}

template <typename T> void loadValidEEPROM(int address, T& value, int validEEPROMs) {
  if (address < validEEPROMs) readEEPROM(address, value);
}

#endif
