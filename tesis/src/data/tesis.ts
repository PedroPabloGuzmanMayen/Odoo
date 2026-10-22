// Datos tomados del documento de tesis (metodología, resultados, discusión y conclusiones).

export const proyecto = {
  titulo: 'Detección temprana del riesgo de reprobación en Pensamiento Cuantitativo',
  subtitulo: 'Modelos de aprendizaje automático supervisado con datos institucionales de la UVG (2019–2022)',
  autor: 'Pedro Pablo Guzmán Mayen',
  asesora: 'Ing. Lynette García Pérez',
  universidad: 'Universidad del Valle de Guatemala',
  carrera: 'Ingeniería en Ciencia de la Computación y Tecnologías de la Información',
}

export const meses = ['Enero', 'Febrero', 'Marzo', 'Abril'] as const
export type Mes = (typeof meses)[number]

// ---------- Conjunto de datos ----------
export const datos = {
  periodo: '2019–2022',
  filasRegistro: 2720,
  filasActividades: 61934,
  estudiantesFinal: 2325,
  mujeres: 848,
  hombres: 1477,
  tasaReprobacion: 13.5,
  tasaAprobacion: 86.5,
  variablesConstruidas: 40,
}

export const limpieza = [
  { paso: 'Validación de tipos', detalle: 'PAA, NotaFinal y VecesCurso pasaron de texto a número; Est_ID a texto; fechas a datetime.' },
  { paso: 'Validación de rangos', detalle: 'PAA tenía valores de 0 a 2,700 (escala real 200–1,600). Los valores fuera de rango se reemplazaron por la mediana.' },
  { paso: 'Normalización de texto', detalle: 'Mayúsculas, sin tildes ni espacios extra en Colegio, Título, Actividad, Género y Estado.' },
  { paso: 'Duplicados', detalle: 'Una sola fila por Año + Ciclo + Sección + Estudiante + Actividad. Se reconstruyeron intentos previos de quienes repitieron el curso.' },
  { paso: 'Valores faltantes', detalle: '318 registros sin datos (incluido el "Estudiante de prueba" de Canvas) y 112 retiros o convalidaciones se excluyeron. 395 PAA faltantes se imputaron con la mediana.' },
  { paso: 'Actividades incompletas', detalle: 'Se estimó la nota de actividades faltantes con una división ponderada que cuadra con la nota final registrada.' },
  { paso: 'Categorías poco frecuentes', detalle: 'Colegios y títulos con menos de 10 apariciones se agruparon como "OTRO".' },
]

export const excluidos = [
  { motivo: 'Registros sin información', n: 318 },
  { motivo: 'Retirados', n: 111 },
  { motivo: 'Convalidado', n: 1 },
]

// ---------- Metodología ----------
export const fases = [
  { n: 1, nombre: 'Limpieza de datos', resumen: 'Tipos, rangos, duplicados, valores faltantes y consistencia con la estructura del curso.' },
  { n: 2, nombre: 'Extracción de características', resumen: 'Variables de rendimiento, comportamiento en el LMS y contexto del curso.' },
  { n: 3, nombre: 'Análisis exploratorio', resumen: 'Mann-Whitney, correlación de Spearman, VIF y V de Cramér para elegir variables.' },
  { n: 4, nombre: 'Desarrollo de modelos', resumen: '40 modelos: 5 algoritmos × 4 meses × 2 enfoques. Optuna con 1,000 combinaciones.' },
  { n: 5, nombre: 'Evaluación de modelos', resumen: 'Sensibilidad, precisión, F2 y PR-AUC; RMSE, MAE y correlación en regresión.' },
  { n: 6, nombre: 'Prueba de concepto', resumen: 'Interfaz en Gradio desplegada en Hugging Face Spaces.' },
]

export const division = [
  { conjunto: 'Entrenamiento', pct: 70, uso: 'Entrenar los modelos y hacer el análisis exploratorio.' },
  { conjunto: 'Validación', pct: 15, uso: 'Ajustar hiperparámetros y elegir el umbral de decisión.' },
  { conjunto: 'Prueba', pct: 15, uso: 'Medir el desempeño con datos que el modelo nunca vio.' },
]

export const variablesPorMes: Array<{ variable: string; meses: [boolean, boolean, boolean, boolean] }> = [
  { variable: 'Puntaje PAA', meses: [true, true, true, true] },
  { variable: 'Título de nivel medio', meses: [true, true, true, true] },
  { variable: 'Colegio de procedencia', meses: [true, true, true, true] },
  { variable: 'Número de intento', meses: [true, true, true, true] },
  { variable: '% acumulado en actividades', meses: [true, true, true, true] },
  { variable: 'Notas de parciales hasta el mes', meses: [false, true, true, true] },
]

export const tecnologias = ['Python 3.10', 'Pandas', 'Scikit-learn', 'XGBoost', 'LightGBM', 'Optuna', 'Seaborn', 'Gradio', 'Hugging Face Spaces', 'Jupyter', 'GitHub']

// ---------- Variables ----------
export const gruposVariables = [
  {
    grupo: 'Rendimiento en el curso',
    items: ['% acumulado en actividades al cierre de cada mes', 'Nota del parcial de cada mes', 'Cambio mensual del % acumulado', 'Puntuación Z respecto a la sección'],
  },
  {
    grupo: 'Comportamiento en el LMS',
    items: ['Entregas tardías acumuladas', 'Cantidad de comentarios', 'Velocidad de calificación (días)'],
  },
  {
    grupo: 'Contexto del curso',
    items: ['Modalidad: virtual (2020–2021) o presencial'],
  },
]

export const seleccion = [
  { variable: 'Porcentaje acumulado en actividades', decision: true, motivo: 'Distribución distinta entre clases y correlación fuerte con el resultado.' },
  { variable: 'Notas en exámenes parciales', decision: true, motivo: 'Distribución distinta entre clases y correlación fuerte con el resultado.' },
  { variable: 'Número de intento', decision: true, motivo: 'p = 9.65 × 10⁻¹⁷⁸; correlación fuerte con Aprobado.' },
  { variable: 'Puntaje PAA', decision: true, motivo: 'p = 8.58 × 10⁻²⁷; correlación moderada con la nota final.' },
  { variable: 'Colegio', decision: true, motivo: 'V de Cramér = 0.304, asociación moderada.' },
  { variable: 'Título de nivel medio', decision: true, motivo: 'V de Cramér = 0.228; se conservó para medir su efecto.' },
  { variable: 'Puntuaciones Z', decision: false, motivo: 'Multicolinealidad con las variables originales (VIF hasta 13.8).' },
  { variable: 'Cambio en el % acumulado', decision: false, motivo: 'Correlación débil con el resultado.' },
  { variable: 'Entregas tardías', decision: false, motivo: 'Sin diferencia significativa en ningún mes.' },
  { variable: 'Cantidad de comentarios', decision: false, motivo: 'p = 0.329, sin diferencia significativa.' },
  { variable: 'Velocidad de calificación', decision: false, motivo: 'p = 0.049, pero correlación débil.' },
  { variable: 'Modalidad y año', decision: false, motivo: 'Reflejan la pandemia, condición que no se repetirá.' },
  { variable: 'Género', decision: false, motivo: 'V de Cramér = 0.062, asociación débil.' },
]

// ---------- Hallazgos del análisis exploratorio ----------
export const reprobacionPorIntento = [
  { intento: '1.er intento', tasa: 5.3, n: 2083 },
  { intento: '2.º intento', tasa: 83.0, n: 224 },
  { intento: '3 o más', tasa: 100, n: 18 },
]

// Cuartiles de la nota final por intento (Figura 6.2)
export const notaPorIntento = [
  { intento: '1', q1: 70, mediana: 80, q3: 85 },
  { intento: '2', q1: 40, mediana: 52, q3: 58 },
  { intento: '3', q1: 22, mediana: 30, q3: 35 },
  { intento: '4', q1: 45, mediana: 55, q3: 57 },
]

export const reprobacionPorGenero = [
  { genero: 'Femenino', tasa: 10.8, reprobados: 92, total: 848 },
  { genero: 'Masculino', tasa: 15.1, reprobados: 223, total: 1477 },
]

// Medianas aproximadas por clase (boxplots de la metodología)
export const acumuladoPorMes = [
  { mes: 'Ene', aprobado: 91, reprobado: 60 },
  { mes: 'Feb', aprobado: 85, reprobado: 54 },
  { mes: 'Mar', aprobado: 85, reprobado: 53 },
  { mes: 'Abr', aprobado: 85, reprobado: 52 },
  { mes: 'May', aprobado: 85, reprobado: 51 },
]

export const parcialesPorClase = { aprobado: { q1: 66, mediana: 80, q3: 90 }, reprobado: { q1: 17, mediana: 33, q3: 45 } }
export const paaPorClase = { aprobado: { q1: 1180, mediana: 1234, q3: 1350 }, reprobado: { q1: 1050, mediana: 1130, q3: 1234 } }

// ---------- Resultados: clasificación (Tabla 6.1) ----------
export const modelos = ['Random Forest', 'XGBoost', 'LightGBM', 'Árbol de decisión', 'Regresión logística'] as const
export const modelosReg = ['Random Forest', 'XGBoost', 'LightGBM', 'Árbol de decisión', 'Regresión lineal'] as const

type FilaClf = { modelo: string; mes: Mes; umbral: number; sens: number; prec: number; f2: number; prauc: number }
export const clasificacion: FilaClf[] = [
  { modelo: 'Random Forest', mes: 'Enero', umbral: 0.209, sens: 0.896, prec: 0.705, f2: 0.85, prauc: 0.842 },
  { modelo: 'XGBoost', mes: 'Enero', umbral: 0.188, sens: 0.896, prec: 0.717, f2: 0.853, prauc: 0.832 },
  { modelo: 'LightGBM', mes: 'Enero', umbral: 0.131, sens: 0.896, prec: 0.683, f2: 0.843, prauc: 0.849 },
  { modelo: 'Árbol de decisión', mes: 'Enero', umbral: 0.255, sens: 0.896, prec: 0.694, f2: 0.846, prauc: 0.764 },
  { modelo: 'Regresión logística', mes: 'Enero', umbral: 0.464, sens: 0.729, prec: 0.854, f2: 0.751, prauc: 0.85 },
  { modelo: 'Random Forest', mes: 'Febrero', umbral: 0.234, sens: 0.917, prec: 0.815, f2: 0.894, prauc: 0.951 },
  { modelo: 'XGBoost', mes: 'Febrero', umbral: 0.136, sens: 0.979, prec: 0.758, f2: 0.925, prauc: 0.951 },
  { modelo: 'LightGBM', mes: 'Febrero', umbral: 0.192, sens: 0.958, prec: 0.807, f2: 0.924, prauc: 0.958 },
  { modelo: 'Árbol de decisión', mes: 'Febrero', umbral: 0.2, sens: 0.979, prec: 0.681, f2: 0.9, prauc: 0.906 },
  { modelo: 'Regresión logística', mes: 'Febrero', umbral: 0.258, sens: 0.979, prec: 0.691, f2: 0.904, prauc: 0.942 },
  { modelo: 'Random Forest', mes: 'Marzo', umbral: 0.222, sens: 1.0, prec: 0.814, f2: 0.956, prauc: 0.978 },
  { modelo: 'XGBoost', mes: 'Marzo', umbral: 0.137, sens: 1.0, prec: 0.727, f2: 0.93, prauc: 0.984 },
  { modelo: 'LightGBM', mes: 'Marzo', umbral: 0.338, sens: 0.958, prec: 0.852, f2: 0.935, prauc: 0.974 },
  { modelo: 'Árbol de decisión', mes: 'Marzo', umbral: 0.075, sens: 1.0, prec: 0.615, f2: 0.889, prauc: 0.967 },
  { modelo: 'Regresión logística', mes: 'Marzo', umbral: 0.277, sens: 1.0, prec: 0.814, f2: 0.956, prauc: 0.974 },
  { modelo: 'Random Forest', mes: 'Abril', umbral: 0.422, sens: 1.0, prec: 0.96, f2: 0.992, prauc: 0.987 },
  { modelo: 'XGBoost', mes: 'Abril', umbral: 0.303, sens: 0.979, prec: 0.959, f2: 0.975, prauc: 0.981 },
  { modelo: 'LightGBM', mes: 'Abril', umbral: 0.345, sens: 0.979, prec: 0.94, f2: 0.971, prauc: 0.986 },
  { modelo: 'Árbol de decisión', mes: 'Abril', umbral: 0.8, sens: 0.979, prec: 0.94, f2: 0.971, prauc: 0.993 },
  { modelo: 'Regresión logística', mes: 'Abril', umbral: 0.392, sens: 0.979, prec: 0.94, f2: 0.971, prauc: 0.985 },
]

// Tabla 6.2
export const promediosClf = [
  { modelo: 'Random Forest', sens: 0.953, prec: 0.824, f2: 0.923, prauc: 0.94 },
  { modelo: 'XGBoost', sens: 0.964, prec: 0.79, f2: 0.921, prauc: 0.937 },
  { modelo: 'LightGBM', sens: 0.948, prec: 0.821, f2: 0.918, prauc: 0.942 },
  { modelo: 'Árbol de decisión', sens: 0.964, prec: 0.733, f2: 0.902, prauc: 0.908 },
  { modelo: 'Regresión logística', sens: 0.922, prec: 0.825, f2: 0.896, prauc: 0.938 },
]

// ---------- Resultados: regresión (Tabla 6.3 y 6.4) ----------
type FilaReg = { modelo: string; mes: Mes; rmse: number; mae: number; r: number }
export const regresion: FilaReg[] = [
  { modelo: 'Random Forest', mes: 'Enero', rmse: 14.543, mae: 9.951, r: 0.782 },
  { modelo: 'XGBoost', mes: 'Enero', rmse: 14.477, mae: 10.736, r: 0.778 },
  { modelo: 'LightGBM', mes: 'Enero', rmse: 14.714, mae: 10.714, r: 0.772 },
  { modelo: 'Árbol de decisión', mes: 'Enero', rmse: 15.229, mae: 10.509, r: 0.758 },
  { modelo: 'Regresión lineal', mes: 'Enero', rmse: 14.856, mae: 11.545, r: 0.766 },
  { modelo: 'Random Forest', mes: 'Febrero', rmse: 9.942, mae: 7.515, r: 0.909 },
  { modelo: 'XGBoost', mes: 'Febrero', rmse: 9.387, mae: 7.21, r: 0.914 },
  { modelo: 'LightGBM', mes: 'Febrero', rmse: 9.597, mae: 7.463, r: 0.911 },
  { modelo: 'Árbol de decisión', mes: 'Febrero', rmse: 13.098, mae: 9.256, r: 0.828 },
  { modelo: 'Regresión lineal', mes: 'Febrero', rmse: 8.958, mae: 6.743, r: 0.922 },
  { modelo: 'Random Forest', mes: 'Marzo', rmse: 7.932, mae: 6.134, r: 0.94 },
  { modelo: 'XGBoost', mes: 'Marzo', rmse: 7.537, mae: 5.603, r: 0.945 },
  { modelo: 'LightGBM', mes: 'Marzo', rmse: 7.783, mae: 5.969, r: 0.941 },
  { modelo: 'Árbol de decisión', mes: 'Marzo', rmse: 8.625, mae: 6.415, r: 0.928 },
  { modelo: 'Regresión lineal', mes: 'Marzo', rmse: 6.97, mae: 5.388, r: 0.953 },
  { modelo: 'Random Forest', mes: 'Abril', rmse: 4.836, mae: 3.551, r: 0.983 },
  { modelo: 'XGBoost', mes: 'Abril', rmse: 4.327, mae: 3.184, r: 0.984 },
  { modelo: 'LightGBM', mes: 'Abril', rmse: 4.655, mae: 3.412, r: 0.982 },
  { modelo: 'Árbol de decisión', mes: 'Abril', rmse: 7.721, mae: 5.93, r: 0.949 },
  { modelo: 'Regresión lineal', mes: 'Abril', rmse: 4.076, mae: 3.015, r: 0.985 },
]

export const promediosReg = [
  { modelo: 'Random Forest', rmse: 9.313, mae: 6.788, r: 0.904 },
  { modelo: 'XGBoost', rmse: 8.932, mae: 6.683, r: 0.905 },
  { modelo: 'LightGBM', rmse: 9.187, mae: 6.89, r: 0.902 },
  { modelo: 'Árbol de decisión', rmse: 11.168, mae: 8.028, r: 0.866 },
  { modelo: 'Regresión lineal', rmse: 8.715, mae: 6.673, r: 0.907 },
]

// ---------- Importancia de variables (Figuras 6.6–6.15) ----------
// Valores normalizados leídos de las gráficas de la tesis (aproximados a dos decimales).
// Orden: [intentos, % acumulado, examen del mes, exámenes previos, PAA, colegio, título]
export const variablesImp = ['Número de intento', '% acumulado actividades', 'Examen del mes', 'Exámenes previos', 'PAA', 'Colegio', 'Título nivel medio'] as const

type Imp = Record<string, number[][]>
export const importanciaClf: Imp = {
  'Random Forest': [[0.57, 0.31, 0, 0, 0.06, 0.04, 0.02], [0.37, 0.45, 0.13, 0, 0.02, 0.015, 0.015], [0.21, 0.36, 0.21, 0.15, 0.04, 0.02, 0.01], [0.19, 0.37, 0.26, 0.17, 0.01, 0, 0]],
  XGBoost: [[0.84, 0.1, 0, 0, 0.02, 0.02, 0.01], [0.57, 0.18, 0.09, 0, 0.05, 0.05, 0.05], [0.6, 0.16, 0.08, 0.06, 0.04, 0.03, 0.03], [0.29, 0.44, 0.19, 0.09, 0, 0, 0]],
  LightGBM: [[0.55, 0.33, 0, 0, 0.07, 0.04, 0.01], [0.32, 0.43, 0.23, 0, 0.01, 0.01, 0.01], [0.18, 0.62, 0.08, 0.1, 0.02, 0.01, 0.01], [0.15, 0.48, 0.31, 0.07, 0, 0, 0]],
  'Árbol de decisión': [[0.65, 0.3, 0, 0, 0.02, 0.02, 0.01], [0.55, 0.34, 0.1, 0, 0.005, 0, 0.005], [0.25, 0.64, 0, 0.1, 0, 0, 0], [0.11, 0.57, 0.28, 0.04, 0, 0, 0]],
  'Regresión logística': [[0.43, 0.39, 0, 0, 0.1, 0.06, 0.03], [0.42, 0.47, 0.11, 0, 0, 0, 0], [0.38, 0.44, 0.06, 0.13, 0, 0, 0], [0.18, 0.38, 0.24, 0.2, 0, 0, 0]],
}
export const importanciaReg: Imp = {
  'Random Forest': [[0.16, 0.48, 0, 0, 0.17, 0.12, 0.08], [0.1, 0.43, 0.29, 0, 0.08, 0.06, 0.05], [0.02, 0.75, 0.08, 0.12, 0.01, 0.01, 0.01], [0.02, 0.43, 0.25, 0.29, 0, 0, 0]],
  XGBoost: [[0.24, 0.47, 0, 0, 0.11, 0.1, 0.07], [0.05, 0.62, 0.23, 0, 0.04, 0.04, 0.03], [0.05, 0.57, 0.2, 0.12, 0.03, 0.02, 0.02], [0.04, 0.5, 0.29, 0.14, 0.01, 0.01, 0.01]],
  LightGBM: [[0.14, 0.65, 0, 0, 0.1, 0.09, 0.03], [0.01, 0.75, 0.21, 0, 0.01, 0.01, 0.01], [0, 0.75, 0.12, 0.12, 0, 0, 0], [0, 0.77, 0.15, 0.08, 0, 0, 0]],
  'Árbol de decisión': [[0.38, 0.52, 0, 0, 0.06, 0.03, 0.01], [0.07, 0.77, 0.14, 0, 0.01, 0, 0.01], [0.01, 0.82, 0.02, 0.14, 0.01, 0, 0], [0, 0.85, 0.15, 0, 0, 0, 0]],
  'Regresión lineal': [[0.12, 0.47, 0, 0, 0.21, 0.14, 0.05], [0.01, 0.52, 0.36, 0, 0.02, 0.05, 0.03], [0, 0.52, 0.16, 0.25, 0.04, 0, 0.02], [0, 0.49, 0.22, 0.26, 0, 0, 0.01]],
}

// Reprobados en el conjunto de prueba (15 % de los datos). Se deduce de la sensibilidad: 0.896 = 43/48.
export const reprobadosPrueba = 48

// ---------- Cierre ----------
export const conclusiones = [
  'Se desarrolló un modelo de aprendizaje automático capaz de identificar de forma temprana el riesgo de reprobación en Pensamiento Cuantitativo. Desde el primer mes detectó al menos el 89.6 % de los estudiantes reprobados del conjunto de prueba.',
  'Se construyeron modelos de clasificación y de regresión con cinco algoritmos (Árbol de Decisión, Random Forest, XGBoost, LightGBM y Regresión Logística o Lineal), uno para cada mes del semestre.',
  'Un proceso de limpieza exhaustivo garantizó la calidad de los datos usados para entrenar los modelos.',
  'El análisis exploratorio mostró que quienes reprueban suelen tener bajo rendimiento en actividades y parciales, menor nota en la PAA y más intentos del curso.',
  'Random Forest fue el modelo con mejor desempeño: detectó más del 89.6 % de los casos de reprobación en todos los meses, con alta precisión y pocas falsas alarmas.',
  'Los modelos de regresión son menos confiables en los primeros meses (error de más de 10 puntos), pero sirven como complemento de la clasificación.',
  'Se desarrolló una interfaz en Gradio que usa el modelo Random Forest, muestra sus predicciones y permite exportarlas en .csv.',
]

export const recomendaciones = [
  { titulo: 'Más tipos de variables', texto: 'Reentrenar con factores socioeconómicos y demográficos, con las autorizaciones correspondientes y verificando que no haya sesgos.' },
  { titulo: 'Datos recientes', texto: 'Evaluar los modelos con semestres más recientes para confirmar que conservan su capacidad predictiva.' },
  { titulo: 'Entorno productivo', texto: 'Analizar la viabilidad de integrar los modelos para que los use el personal docente.' },
  { titulo: 'Otros cursos clave', texto: 'Replicar el proceso en Física, Programación Básica, Álgebra Lineal, Ecuaciones Diferenciales o Química.' },
  { titulo: 'Efecto de las tutorías', texto: 'Medir el efecto de las tutorías institucionales en el rendimiento de los estudiantes.' },
  { titulo: 'IA institucional', texto: 'Explorar si los LLM que provee la institución pueden personalizar el aprendizaje.' },
  { titulo: 'Un modelo por departamento', texto: 'Evaluar si los cursos de primer año de Matemática comparten patrones y pueden usar un solo modelo.' },
  { titulo: 'Interacción con el LMS', texto: 'Usar años recientes para capturar mejor los tiempos de entrega y la interacción en Canvas.' },
]
