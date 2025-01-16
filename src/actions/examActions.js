export const saveExam = async (exam) => {
    // Implementar lógica para guardar el examen
    console.log('Guardando examen:', exam);
    return { success: true, message: 'Examen guardado exitosamente' };
  };
  
  export const saveQuestion = async (question) => {
    // Implementar lógica para guardar una pregunta
    console.log('Guardando pregunta:', question);
    return { success: true, message: 'Pregunta guardada exitosamente' };
  };
  
  export const loadSavedExam = async () => {
    // Implementar lógica para cargar un examen guardado
    console.log('Cargando examen guardado');
    return null; // Retorna null si no hay examen guardado
  };