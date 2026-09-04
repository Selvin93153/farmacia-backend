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
exports.MunicipiosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const municipio_entity_1 = require("./entities/municipio.entity");
const departamento_entity_1 = require("../departamentos/entities/departamento.entity");
let MunicipiosService = class MunicipiosService {
    municipioRepository;
    departamentoRepository;
    constructor(municipioRepository, departamentoRepository) {
        this.municipioRepository = municipioRepository;
        this.departamentoRepository = departamentoRepository;
    }
    async create(createMunicipioDto) {
        await this.validarDepartamento(createMunicipioDto.id_departamento);
        try {
            const municipio = this.municipioRepository.create(createMunicipioDto);
            return await this.municipioRepository.save(municipio);
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    async findAll() {
        return this.municipioRepository.find({
            relations: {
                departamento: true,
            },
            order: {
                id_municipio: 'ASC',
            },
        });
    }
    async findOne(id) {
        const municipio = await this.municipioRepository.findOne({
            where: {
                id_municipio: id,
            },
            relations: {
                departamento: true,
            },
        });
        if (!municipio) {
            throw new common_1.NotFoundException(`El municipio con ID ${id} no existe`);
        }
        return municipio;
    }
    async update(id, updateMunicipioDto) {
        if (updateMunicipioDto.id_departamento !== undefined) {
            await this.validarDepartamento(updateMunicipioDto.id_departamento);
        }
        const municipio = await this.municipioRepository.preload({
            id_municipio: id,
            ...updateMunicipioDto,
        });
        if (!municipio) {
            throw new common_1.NotFoundException(`El municipio con ID ${id} no existe`);
        }
        try {
            await this.municipioRepository.save(municipio);
            return this.findOne(id);
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    async remove(id) {
        const municipio = await this.findOne(id);
        try {
            await this.municipioRepository.remove(municipio);
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    async validarDepartamento(id) {
        const existe = await this.departamentoRepository.exists({
            where: {
                id_departamento: id,
            },
        });
        if (!existe) {
            throw new common_1.NotFoundException(`El departamento con ID ${id} no existe`);
        }
    }
    handleDatabaseError(error) {
        if (error instanceof typeorm_2.QueryFailedError) {
            const code = error.driverError?.code;
            if (code === '23505') {
                throw new common_1.ConflictException('El municipio ya existe en ese departamento');
            }
            if (code === '23503') {
                throw new common_1.ConflictException('No se puede realizar la operación porque existen registros relacionados');
            }
        }
        throw error;
    }
};
exports.MunicipiosService = MunicipiosService;
exports.MunicipiosService = MunicipiosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(municipio_entity_1.Municipio)),
    __param(1, (0, typeorm_1.InjectRepository)(departamento_entity_1.Departamento)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MunicipiosService);
