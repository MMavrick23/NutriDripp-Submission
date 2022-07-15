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
  DAT,
  DEVS
};

inline bool ReceiveHandlerBufferPT;
inline String ReceiveHandlerBuffer;
inline String RequestHandlerBuffer;
inline String CPToken;

void serialEvent();
void sendRequestedSignal(TransmissionHandlingMode mode = ALL, bool sendAll = true);

#endif
