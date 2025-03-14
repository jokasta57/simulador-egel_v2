export const validateStudentForm = (formData) => {
  const errors = {};

  // Número de cuenta validation (6 digits)
  if (!/^\d{6}$/.test(formData.numero_cuenta)) {
    errors.numero_cuenta = 'El número de cuenta debe tener 6 dígitos';
  }

  // Name validations
  if (formData.nombre.trim().length < 2) {
    errors.nombre = 'El nombre es requerido';
  }
  if (formData.apellido_paterno.trim().length < 2) {
    errors.apellido_paterno = 'El apellido paterno es requerido';
  }
  if (formData.apellido_materno.trim().length < 2) {
    errors.apellido_materno = 'El apellido materno es requerido';
  }

  // Email validation
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
    errors.email = 'Email inválido';
  }
  // NIP validation (minimum 6 characters)
  if (!formData.nip || formData.nip.length < 6) {
    errors.nip = 'El NIP debe tener al menos 6 caracteres';
  }

  // Required fields
  ['carrera', 'semestre', 'grupo', 'ciclo_escolar'].forEach(field => {
    if (!formData[field]) {
      errors[field] = 'Este campo es requerido';
    }
  });

  return errors;
};
