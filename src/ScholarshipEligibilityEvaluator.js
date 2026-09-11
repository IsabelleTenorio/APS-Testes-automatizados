'use strict';

const Status = Object.freeze({
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
});

class EvaluationResult {
  constructor(status, reasons) {
    this.status = status;
    this.reasons = Object.freeze([...reasons]);
    Object.freeze(this);
  }

  toString() {
    return `EvaluationResult{status=${this.status}, reasons=${JSON.stringify(this.reasons)}}`;
  }
}

function evaluateScholarship(age, gpa, attendanceRate, hasRequiredCourses, disciplinaryRecord) {
  validateInputs(gpa, attendanceRate);

  const rejectionReasons = [];
  const reviewReasons = [];

  // Rule 1 - Age
  if (age < 16) {
    rejectionReasons.push('Applicant is younger than the minimum age.');
  } else if (age <= 17) {
    reviewReasons.push('Applicant is under 18 and requires manual review.');
  }

  // Rule 2 - GPA
  if (gpa < 6.0) {
    rejectionReasons.push('GPA is below the minimum required.');
  } else if (gpa < 7.0) {
    reviewReasons.push('GPA is in the manual review range.');
  }

  // Rule 3 - Attendance
  if (attendanceRate < 75.0) {
    rejectionReasons.push('Attendance rate is below the minimum required.');
  } else if (attendanceRate < 80.0) {
    reviewReasons.push('Attendance rate is in the manual review range.');
  }

  // Rule 4 - Required courses
  if (!hasRequiredCourses) {
    rejectionReasons.push('Required courses have not been completed.');
  }

  // Rule 5 - Disciplinary record
  if (disciplinaryRecord) {
    rejectionReasons.push('Applicant has a disciplinary record.');
  }

  // Final decision
  if (rejectionReasons.length > 0) {
    return new EvaluationResult(Status.REJECTED, rejectionReasons);
  }

  if (reviewReasons.length > 0) {
    return new EvaluationResult(Status.MANUAL_REVIEW, reviewReasons);
  }

  return new EvaluationResult(Status.APPROVED, ['Applicant meets all scholarship requirements.']);
}

function validateInputs(gpa, attendanceRate) {
  if (gpa < 0.0 || gpa > 10.0) {
    throw new RangeError('GPA must be between 0 and 10.');
  }

  if (attendanceRate < 0.0 || attendanceRate > 100.0) {
    throw new RangeError('Attendance rate must be between 0 and 100.');
  }
}

// Manual use example
if (require.main === module) {
  const result = evaluateScholarship(18, 8.5, 92.0, true, false);
  console.log(result.toString());
}

module.exports = { evaluateScholarship, Status, EvaluationResult };
