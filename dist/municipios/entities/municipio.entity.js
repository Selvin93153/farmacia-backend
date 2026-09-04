"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Municipio = void 0;
const typeorm_1 = require("typeorm");
const departamento_entity_1 = require("../../departamentos/entities/departamento.entity");
let Municipio = class Municipio {
    id_municipio;
    id_departamento;
    nombre;
    estado;
    departamento;
};
exports.Municipio = Municipio;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Municipio.prototype, "id_municipio", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Municipio.prototype, "id_departamento", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
    }),
    __metadata("design:type", String)
], Municipio.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 10,
        default: 'ACTIVO',
    }),
    __metadata("design:type", String)
], Municipio.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => departamento_entity_1.Departamento, {
        nullable: false,
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({
        name: 'id_departamento',
    }),
    __metadata("design:type", departamento_entity_1.Departamento)
], Municipio.prototype, "departamento", void 0);
exports.Municipio = Municipio = __decorate([
    (0, typeorm_1.Entity)('municipios'),
    (0, typeorm_1.Unique)(['id_departamento', 'nombre'])
], Municipio);
