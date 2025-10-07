/**
 * Shared code between client and server for the Defect Management System
 */

export const DefectStatus = {
  new: 'new',
  in_progress: 'in_progress',
  in_review: 'in_review',
  closed: 'closed',
  cancelled: 'cancelled',
};

export const Priority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
};

export const Role = {
  manager: 'manager',
  engineer: 'engineer',
  observer: 'observer',
};