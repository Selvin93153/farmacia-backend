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
exports.MunicipiosController = void 0;
const common_1 = require("@nestjs/common");
const municipios_service_1 = require("./municipios.service");
const create_municipio_dto_1 = require("./dto/create-municipio.dto");
const update_municipio_dto_1 = require("./dto/update-municipio.dto");
let MunicipiosController = class MunicipiosController {
    municipiosService;
    constructor(municipiosService) {
        this.municipiosService = municipiosService;
    }
    create(createMunicipioDto) {
        return this.municipiosService.create(createMunicipioDto);
    }
    findAll() {
        return this.municipiosService.findAll();
    }
    findOne(id) {
        return this.municipiosService.findOne(id);
    }
    update(id, updateMunicipioDto) {
        return this.municipiosService.update(id, updateMunicipioDto);
    }
    async remove(id) {
        await this.municipiosService.remove(id);
    }
};
exports.MunicipiosController = MunicipiosController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_municipio_dto_1.CreateMunicipioDto]),
    __metadata("design:returntype", void 0)
], MunicipiosController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MunicipiosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], MunicipiosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_municipio_dto_1.UpdateMunicipioDto]),
    __metadata("design:returntype", void 0)
], MunicipiosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MunicipiosController.prototype, "remove", null);
exports.MunicipiosController = MunicipiosController = __decorate([
    (0, common_1.Controller)('municipios'),
    __metadata("design:paramtypes", [municipios_service_1.MunicipiosService])
], MunicipiosController);
