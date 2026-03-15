import { Visit, OutcomeStatus } from '../types';

export interface ValidationErrors {
  customerName?: string;
  contactPerson?: string;
  location?: string;
  visitDateTime?: string;
  rawNotes?: string;
  outcomeStatus?: string;
  followUpDate?: string;
}

export function validateVisit(visit: Partial<Visit>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!visit.customerName?.trim()) {
    errors.customerName = 'Customer name is required';
  }

  if (!visit.contactPerson?.trim()) {
    errors.contactPerson = 'Contact person is required';
  }

  if (!visit.location?.trim()) {
    errors.location = 'Location is required';
  }

  if (!visit.visitDateTime) {
    errors.visitDateTime = 'Visit date/time is required';
  }

  if (!visit.rawNotes?.trim()) {
    errors.rawNotes = 'Meeting notes are required';
  }

  if (!visit.outcomeStatus) {
    errors.outcomeStatus = 'Outcome status is required';
  }

  // Follow-up date is required only when outcome is "follow-up needed"
  if (visit.outcomeStatus === 'follow-up needed' && !visit.followUpDate) {
    errors.followUpDate = 'Follow-up date is required when outcome is "follow-up needed"';
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
