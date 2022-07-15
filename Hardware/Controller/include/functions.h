////////////////////////////////////////////////////////////////////
//////////         Additional Functions & Methods         //////////
////////////////////////////////////////////////////////////////////

#ifndef FUNCTIONS_H
#define FUNCTIONS_H

#include <Arduino.h>
#include <EEPROM.h>

#include "config.h"

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

template <typename T>
bool LinkedListContains(T value, LinkedList<T>& list) {
  for (int i = 0; i < list.size(); i++)
    if (list[i] == value) return true;

  return false;
}

#endif
