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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rol_entity_1 = require("./entities/rol.entity");
let RolesService = class RolesService {
    rolRepository;
    constructor(rolRepository) {
        this.rolRepository = rolRepository;
    }
    async create(createRolDto) {
        try {
            const rol = this.rolRepository.create(createRolDto);
            return await this.rolRepository.save(rol);
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    async findAll() {
        return this.rolRepository.find({
            order: {
                id: 'ASC',
            },
        });
    }
    async findOne(id) {
        const rol = await this.rolRepository.findOne({
            where: { id },
        });
        if (!rol) {
            throw new common_1.NotFoundException(`El rol con ID ${id} no existe`);
        }
        return rol;
    }
    async update(id, updateRolDto) {
        const rol = await this.rolRepository.preload({
            id,
            ...updateRolDto,
        });
        if (!rol) {
            throw new common_1.NotFoundException(`El rol con ID ${id} no existe`);
        }
        try {
            return await this.rolRepository.save(rol);
        }
        catch (error) {
            this.handleDatabaseError(error);
        }
    }
    async remove(id) {
        const rol = await this.findOne(id);
        await this.rolRepository.remove(rol);
    }
    handleDatabaseError(error) {
        if (error instanceof typeorm_2.QueryFailedError &&
            error.driverError?.code === '23505') {
            throw new common_1.ConflictException('Ya existe un rol con ese nombre');
        }
        throw error;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rol_entity_1.Rol)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RolesService);
