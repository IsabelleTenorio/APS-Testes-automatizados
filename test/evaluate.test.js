'use strict';

const { evaluateScholarship, Status } = require('../src/ScholarshipEligibilityEvaluator');

// Base values
const BASE = {
  age: 20,
  gpa: 8.0,
  attendanceRate: 90.0,
  hasRequiredCourses: true,
  disciplinaryRecord: false,
};

function evaluate(overrides = {}) {
  const p = { ...BASE, ...overrides };
  return evaluateScholarship(p.age, p.gpa, p.attendanceRate, p.hasRequiredCourses, p.disciplinaryRecord);
}

// ---------------------------------------------------------------------------
// APPROVED (>= 1 exigido)
// ---------------------------------------------------------------------------
describe('APPROVED', () => {
  test('candidato que atende a todos os critérios é aprovado', () => {
    const result = evaluate();
    expect(result.status).toBe(Status.APPROVED);
    expect(result.reasons).toEqual(['Applicant meets all scholarship requirements.']);
  });
});

// ---------------------------------------------------------------------------
// MANUAL_REVIEW (>= 1)
// ---------------------------------------------------------------------------
describe('MANUAL_REVIEW', () => {
  test('idade entre 16 e 17 gera revisão manual', () => {
    const result = evaluate({ age: 17 });
    expect(result.status).toBe(Status.MANUAL_REVIEW);
    expect(result.reasons).toEqual(['Applicant is under 18 and requires manual review.']);
  });

  test('múltiplos motivos de revisão são acumulados (idade + GPA)', () => {
    const result = evaluate({ age: 16, gpa: 6.5 });
    expect(result.status).toBe(Status.MANUAL_REVIEW);
    expect(result.reasons).toEqual([
      'Applicant is under 18 and requires manual review.',
      'GPA is in the manual review range.',
    ]);
  });
});

// ---------------------------------------------------------------------------
// REJECTED (>= 3)
// ---------------------------------------------------------------------------
describe('REJECTED', () => {
  test('idade abaixo do mínimo é rejeitada', () => {
    const result = evaluate({ age: 15 });
    expect(result.status).toBe(Status.REJECTED);
    expect(result.reasons).toEqual(['Applicant is younger than the minimum age.']);
  });

  test('GPA abaixo do mínimo é rejeitado', () => {
    const result = evaluate({ gpa: 5.9 });
    expect(result.status).toBe(Status.REJECTED);
    expect(result.reasons).toEqual(['GPA is below the minimum required.']);
  });

  test('frequência abaixo do mínimo é rejeitada', () => {
    const result = evaluate({ attendanceRate: 70.0 });
    expect(result.status).toBe(Status.REJECTED);
    expect(result.reasons).toEqual(['Attendance rate is below the minimum required.']);
  });

  test('cursos obrigatórios não concluídos são rejeitados', () => {
    const result = evaluate({ hasRequiredCourses: false });
    expect(result.status).toBe(Status.REJECTED);
    expect(result.reasons).toEqual(['Required courses have not been completed.']);
  });

  test('registro disciplinar é rejeitado', () => {
    const result = evaluate({ disciplinaryRecord: true });
    expect(result.status).toBe(Status.REJECTED);
    expect(result.reasons).toEqual(['Applicant has a disciplinary record.']);
  });

  test('rejeição tem prioridade sobre revisão quando ambas ocorrem', () => {
    // idade em faixa de revisão (17) + GPA em faixa de rejeição (5.5)
    const result = evaluate({ age: 17, gpa: 5.5 });
    expect(result.status).toBe(Status.REJECTED);
    expect(result.reasons).toEqual(['GPA is below the minimum required.']);
  });

  test('múltiplos motivos de rejeição são acumulados', () => {
    const result = evaluate({ age: 15, disciplinaryRecord: true, hasRequiredCourses: false });
    expect(result.status).toBe(Status.REJECTED);
    expect(result.reasons).toEqual([
      'Applicant is younger than the minimum age.',
      'Required courses have not been completed.',
      'Applicant has a disciplinary record.',
    ]);
  });
});

// ---------------------------------------------------------------------------
// Entradas inválidas (>= 2)
// ---------------------------------------------------------------------------
describe('Entradas inválidas', () => {
  test('GPA negativo lança erro de validação', () => {
    expect(() => evaluate({ gpa: -0.1 })).toThrow(Error);
    expect(() => evaluate({ gpa: -0.1 })).toThrow('GPA must be between 0 and 10.');
  });

  test('GPA acima de 10 lança erro de validação', () => {
    expect(() => evaluate({ gpa: 10.1 })).toThrow('GPA must be between 0 and 10.');
  });

  test('frequência negativa lança erro de validação', () => {
    expect(() => evaluate({ attendanceRate: -1 })).toThrow('Attendance rate must be between 0 and 100.');
  });

  test('frequência acima de 100 lança erro de validação', () => {
    expect(() => evaluate({ attendanceRate: 100.1 })).toThrow('Attendance rate must be between 0 and 100.');
  });
});

// ---------------------------------------------------------------------------
// Valores de fronteira (>= 4 exigidos) — classes: idade, GPA, frequência
// ---------------------------------------------------------------------------
describe('Valores de fronteira', () => {
  describe('Idade (limiares: 16, 18)', () => {
    test('age=15 -> rejeitado (último valor abaixo do limite)', () => {
      expect(evaluate({ age: 15 }).status).toBe(Status.REJECTED);
    });
    test('age=16 -> revisão (primeiro valor válido para revisão)', () => {
      expect(evaluate({ age: 16 }).status).toBe(Status.MANUAL_REVIEW);
    });
    test('age=17 -> revisão (último valor antes de virar aprovável)', () => {
      expect(evaluate({ age: 17 }).status).toBe(Status.MANUAL_REVIEW);
    });
    test('age=18 -> não gera motivo de idade (aprovável)', () => {
      expect(evaluate({ age: 18 }).status).toBe(Status.APPROVED);
    });
  });

  describe('GPA (limiares: 6.0, 7.0, 0, 10)', () => {
    test('gpa=5.99 -> rejeitado', () => {
      expect(evaluate({ gpa: 5.99 }).status).toBe(Status.REJECTED);
    });
    test('gpa=6.0 -> revisão (limite inferior inclusivo da faixa de revisão)', () => {
      expect(evaluate({ gpa: 6.0 }).status).toBe(Status.MANUAL_REVIEW);
    });
    test('gpa=6.99 -> revisão (último valor antes de aprovar)', () => {
      expect(evaluate({ gpa: 6.99 }).status).toBe(Status.MANUAL_REVIEW);
    });
    test('gpa=7.0 -> não gera motivo de GPA (aprovável)', () => {
      expect(evaluate({ gpa: 7.0 }).status).toBe(Status.APPROVED);
    });
    test('gpa=0 (limite mínimo válido) não lança erro', () => {
      expect(() => evaluate({ gpa: 0 })).not.toThrow();
    });
    test('gpa=10 (limite máximo válido) não lança erro', () => {
      expect(() => evaluate({ gpa: 10 })).not.toThrow();
    });
  });

  describe('Frequência (limiares: 75, 80, 0, 100)', () => {
    test('attendanceRate=74.99 -> rejeitado', () => {
      expect(evaluate({ attendanceRate: 74.99 }).status).toBe(Status.REJECTED);
    });
    test('attendanceRate=75 -> revisão (limite inferior inclusivo)', () => {
      expect(evaluate({ attendanceRate: 75 }).status).toBe(Status.MANUAL_REVIEW);
    });
    test('attendanceRate=79.99 -> revisão (último valor antes de aprovar)', () => {
      expect(evaluate({ attendanceRate: 79.99 }).status).toBe(Status.MANUAL_REVIEW);
    });
    test('attendanceRate=80 -> não gera motivo de frequência (aprovável)', () => {
      expect(evaluate({ attendanceRate: 80 }).status).toBe(Status.APPROVED);
    });
    test('attendanceRate=0 e attendanceRate=100 (limites válidos) não lançam erro', () => {
      expect(() => evaluate({ attendanceRate: 0 })).not.toThrow();
      expect(() => evaluate({ attendanceRate: 100 })).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// Additional structural paths (independent Boolean decisions)
// ---------------------------------------------------------------------------
describe('Caminhos estruturais - regras booleanas', () => {
  test.each([
    [true, false, Status.APPROVED],
    [false, false, Status.REJECTED],
    [true, true, Status.REJECTED],
    [false, true, Status.REJECTED],
  ])('hasRequiredCourses=%s, disciplinaryRecord=%s -> %s', (hasRequiredCourses, disciplinaryRecord, expected) => {
    const result = evaluate({ hasRequiredCourses, disciplinaryRecord });
    expect(result.status).toBe(expected);
  });
});
