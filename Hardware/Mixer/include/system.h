///////////////////////////////////////////////////////////////////////////////////
//////////         System Executable Functions & Complex Methods         //////////
///////////////////////////////////////////////////////////////////////////////////

#ifndef SYSTEM_H
#define SYSTEM_H

inline float Temperature;
inline float FlowRateIn;
inline float FlowRateOut;
inline float ReservoirQTY;

inline bool ValveInState;
inline bool ValveOutState;
inline bool PumpInState;
inline bool PumpOutState;
inline bool MixerState;
inline bool PeltierState;
inline bool PeltierMode;

inline long FlowMeterInCalcularionStartTime;
inline long FlowMeterOutCalcularionStartTime;

bool readTemperature(bool silent = false, bool noError = false);
void readFlowRateIn();
void readFlowRateOut();
bool setValveIn(bool newState, bool usePump = false, bool silent = false, bool noError = false);
bool setValveOut(bool newState, bool usePump = true, bool silent = false, bool noError = false);
bool setPumpInState(bool newState);
bool setPumpOutState(bool newState);
bool setMixerState(bool newState);
bool setPeltierState(bool newState, bool newMode = false);

#endif
