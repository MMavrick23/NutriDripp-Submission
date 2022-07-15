///////////////////////////////////////////////////////////////////////////////////
//////////         System Executable Functions & Complex Methods         //////////
///////////////////////////////////////////////////////////////////////////////////

#include "system.h"
#include "kernel.h"
#include "handlers.h"

bool readTemperature(bool silent, bool noError) {
  OneWireSensors.requestTemperatures();
  Temperature = OneWireSensors.getTempC(TemperatureSensor);

  if (Temperature == DEVICE_DISCONNECTED_C) {
    if (!silent) Serial.println(F("[!] Bad temperature sensor."));
    if (!noError) ErrorList.add(0x01);
    return false;
  }

  return true;
}

void readFlowRateIn() {
  delay(100);

  int CurrentFlowMeterCalculationDuration = millis() - FlowMeterInCalcularionStartTime;
  if (CurrentFlowMeterCalculationDuration >= FlowMeterCalculationDuration) {
    FlowRateIn = FlowMeterInPulsesCount / (2 * FlowMeterInPulseRate * (FlowMeterCalculationDuration / 1000));
    FlowMeterInCalcularionStartTime = millis();
    FlowMeterInPulsesCount = 0;

    ReservoirQTY += (FlowRateIn / 60000 * CurrentFlowMeterCalculationDuration);
  }
}

void readFlowRateOut() {
  delay(100);

  int CurrentFlowMeterCalculationDuration = millis() - FlowMeterOutCalcularionStartTime;
  if (CurrentFlowMeterCalculationDuration >= FlowMeterCalculationDuration) {
    FlowRateIn = FlowMeterOutPulsesCount / (2 * FlowMeterOutPulseRate * (FlowMeterCalculationDuration / 1000));
    FlowMeterOutCalcularionStartTime = millis();
    FlowMeterOutPulsesCount = 0;

    ReservoirQTY -= (FlowRateIn / 60000 * CurrentFlowMeterCalculationDuration);
  }
}

bool setValveIn(bool newState, bool usePump, bool silent, bool noError) {
  if (newState != ValveInState) {
    if (usePump) setPumpInState(newState);
    ValveIn.write((newState ? ValveInAngleMax : ValveInAngleMin));
    ValveInState = newState;
  }

  if (!noError) {
    bool TBusy = Busy;
    Busy = true;

    delay(FlowMeterCalculationDuration);
    readFlowRateIn();

    if ((FlowRateIn >= FlowMeterPercisionTolerance && !newState) || (FlowRateIn < FlowMeterPercisionTolerance && newState)) {
      if (!silent) Serial.println(F("[!] Bad valve 1."));
      ErrorList.add(0x04);
      return false;
    }

    Busy = TBusy;
  }
}

bool setValveOut(bool newState, bool usePump, bool silent, bool noError) {
  if (newState != ValveOutState) {
    if (usePump) setPumpOutState(newState);
    ValveOut.write((newState ? ValveOutAngleMax : ValveOutAngleMin));
    ValveOutState = newState;
  }

  if (!noError) {
    bool TBusy = Busy;
    Busy = true;

    delay(FlowMeterCalculationDuration);
    readFlowRateOut();

    if ((FlowRateOut >= FlowMeterPercisionTolerance && !newState) || (FlowRateOut < FlowMeterPercisionTolerance && newState)) {
      if (!silent) Serial.println(F("[!] Bad valve 2."));
      ErrorList.add(0x05);
      return false;
    }

    Busy = TBusy;
  }
}

bool setPumpInState(bool newState) {
  if (newState != PumpInState) {
    digitalWrite(PumpInPin, newState);
    PumpInState = newState;
  }
}

bool setPumpOutState(bool newState) {
  if (newState != PumpOutState) {
    digitalWrite(PumpOutPin, newState);
    PumpOutState = newState;
  }
}

bool setMixerState(bool newState) {
  if (newState != MixerState) {
    digitalWrite(MixerPin, newState);
    MixerState = newState;
  }
}

bool setPeltierState(bool newState, bool newMode) {
  if (newState != PeltierState) {
    digitalWrite(PeltierPin, newState);
    PeltierState = newState;
  }

  if (newMode != PeltierMode) {
    digitalWrite(PeltierModePin, newMode);
    PeltierMode = newMode;
  }
}
