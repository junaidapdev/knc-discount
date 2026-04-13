import { useMemo } from 'react'
import type { ICreditNoteWithSupplier } from '../interfaces/ICreditNote'
import { CREDIT_NOTE_STATUS } from '../constants/appConstants'

export interface AuditSummary {
  totalExpected: number
  totalReceived: number
  netLeakage: number
  countPending: number
  countDisputed: number
}

export function useAuditSummary(creditNotes: ICreditNoteWithSupplier[]): AuditSummary {
  return useMemo(() => {
    let totalExpected = 0
    let totalReceived = 0
    let countPending = 0
    let countDisputed = 0

    for (const note of creditNotes) {
      totalExpected += note.expected_amount
      totalReceived += note.received_amount
      if (note.status === CREDIT_NOTE_STATUS.PENDING) countPending++
      if (note.status === CREDIT_NOTE_STATUS.DISPUTED) countDisputed++
    }

    return {
      totalExpected,
      totalReceived,
      netLeakage: totalExpected - totalReceived,
      countPending,
      countDisputed,
    }
  }, [creditNotes])
}
