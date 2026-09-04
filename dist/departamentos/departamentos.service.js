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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartamentosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const departamento_entity_1 = require("./entities/departamento.entity");
let DepartamentosService = class DepartamentosService {
    departamentoRepository;
    constructor(departamentoRepository) {
        this.departamentoRepository = departamentoRepository;
    }
    async create(createDepartamentoDto) {
        try {
            const departamento = this.departamentoRepository.create(createDepartamentoDto);
            return await this.departamentoRepository.save(departamento);
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    async findAll() {
        return this.departamentoRepository.find({
            order: {
                id_departamento: 'ASC',
            },
        });
    }
    async findOne(id) {
        const departamento = await this.departamentoRepository.findOne({
            where: {
                id_departamento: id,
            },
        });
        if (!departamento) {
            throw new common_1.NotFoundException(`El departamento con ID ${id} no existe`);
        }
        return departamento;
    }
    async update(id, updateDepartamentoDto) {
        const departamento = await this.departamentoRepository.preload({
            id_departamento: id,
            ...updateDepartamentoDto,
        });
        if (!departamento) {
            throw new common_1.NotFoundException(`El departamento con ID ${id} no existe`);
        }
        try {
            return await this.departamentoRepository.save(departamento);
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    async remove(id) {
        const departamento = await this.findOne(id);
        try {
            await this.departamentoRepository.remove(departamento);
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    handleDatabaseError(error) {
        if (error instanceof typeorm_2.QueryFailedError) {
            const code = error.driverError?.code;
            if (code === '23505') {
                throw new common_1.ConflictException('Ya existe un departamento con ese nombre');
            }
            if (code === '23503') {
                throw new common_1.ConflictException('No se puede eliminar el departamento porque tiene registros relacionados');
            }
        }
        throw error;
    }
};
exports.DepartamentosService = DepartamentosService;
exports.DepartamentosService = DepartamentosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(departamento_entity_1.Departamento)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DepartamentosService);
