///////////////////////////////////////////////////////////////////////////
//////////         Interrupt Service Routines & Handlers         //////////
///////////////////////////////////////////////////////////////////////////

#ifndef HANDLERS_H
#define HANDLERS_H

#include <Arduino.h>

enum TransmissionHandlingMode {
  ALL,
  PRD,
  ERR,
  CONF,
  CAL,
  DAT
};

inline TransmissionHandlingMode ReceiveHandlerTransmissionMode;
inline bool ReceiveHandlerBufferPT;
inline String ReceiveHandlerBuffer;
inline String RequestHandlerBuffer;
inline volatile int FlowMeterInPulsesCount;
inline volatile int FlowMeterOutPulsesCount;

void signalReceiveHandler(int bytesCount);
void signalRequestHandler();
void flowMeterInPulseHandler();
void flowMeterOutPulseHandler();

#endif
