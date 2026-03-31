"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPORTES_ACTIONS = exports.CONSEJO_ACTIONS = exports.TAREAS_ACTIONS = exports.MIEMBROS_ACTIONS = exports.JERARQUIA_ACTIONS = void 0;
exports.JERARQUIA_ACTIONS = [
    'validar_acceso',
    'obtener_subordinados',
    'calcular_nivel',
];
exports.MIEMBROS_ACTIONS = ['crear', 'actualizar', 'listar', 'obtener_por_id'];
exports.TAREAS_ACTIONS = ['crear', 'asignar', 'completar', 'listar', 'obtener_por_id'];
exports.CONSEJO_ACTIONS = ['crear_acta', 'listar_acuerdos', 'seguimiento'];
exports.REPORTES_ACTIONS = ['resumen_organizacion', 'indicadores', 'alertas'];
