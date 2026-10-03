import {
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Departamento } from '../../departamentos/entities/departamento.entity';
import { Municipio } from '../entities/municipio.entity';

@Injectable()
export class MunicipiosSeederService
  implements OnApplicationBootstrap
{
  constructor(
    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,

    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const municipiosPorDepartamento: Record<string, string[]> = {
      Guatemala: [
        'Guatemala',
        'Santa Catarina Pinula',
        'San José Pinula',
        'San José del Golfo',
        'Palencia',
        'Chinautla',
        'San Pedro Ayampuc',
        'Mixco',
        'San Pedro Sacatepéquez',
        'San Juan Sacatepéquez',
        'San Raymundo',
        'Chuarrancho',
        'Fraijanes',
        'Amatitlán',
        'Villa Nueva',
        'Villa Canales',
        'San Miguel Petapa',
      ],

      'El Progreso': [
        'Guastatoya',
        'Morazán',
        'San Agustín Acasaguastlán',
        'San Cristóbal Acasaguastlán',
        'El Jícaro',
        'Sansare',
        'Sanarate',
        'San Antonio La Paz',
      ],

      Sacatepéquez: [
        'Antigua Guatemala',
        'Jocotenango',
        'Pastores',
        'Sumpango',
        'Santo Domingo Xenacoj',
        'Santiago Sacatepéquez',
        'San Bartolomé Milpas Altas',
        'San Lucas Sacatepéquez',
        'Santa Lucía Milpas Altas',
        'Magdalena Milpas Altas',
        'Santa María de Jesús',
        'Ciudad Vieja',
        'San Miguel Dueñas',
        'Alotenango',
        'San Antonio Aguas Calientes',
        'Santa Catarina Barahona',
      ],

      Chimaltenango: [
        'Chimaltenango',
        'San José Poaquil',
        'San Martín Jilotepeque',
        'San Juan Comalapa',
        'Santa Apolonia',
        'Tecpán Guatemala',
        'Patzún',
        'San Miguel Pochuta',
        'Patzicía',
        'Santa Cruz Balanyá',
        'Acatenango',
        'San Pedro Yepocapa',
        'San Andrés Itzapa',
        'Parramos',
        'Zaragoza',
        'El Tejar',
      ],

      Escuintla: [
        'Escuintla',
        'Santa Lucía Cotzumalguapa',
        'La Democracia',
        'Siquinalá',
        'Masagua',
        'Tiquisate',
        'La Gomera',
        'Guanagazapa',
        'San José',
        'Iztapa',
        'Palín',
        'San Vicente Pacaya',
        'Nueva Concepción',
        'Sipacate',
      ],

      'Santa Rosa': [
        'Cuilapa',
        'Barberena',
        'Santa Rosa de Lima',
        'Casillas',
        'San Rafael Las Flores',
        'Oratorio',
        'San Juan Tecuaco',
        'Chiquimulilla',
        'Taxisco',
        'Santa María Ixhuatán',
        'Guazacapán',
        'Santa Cruz Naranjo',
        'Pueblo Nuevo Viñas',
        'Nueva Santa Rosa',
      ],

      Sololá: [
        'Sololá',
        'San José Chacayá',
        'Santa María Visitación',
        'Santa Lucía Utatlán',
        'Nahualá',
        'Santa Catarina Ixtahuacán',
        'Santa Clara La Laguna',
        'Concepción',
        'San Andrés Semetabaj',
        'Panajachel',
        'Santa Catarina Palopó',
        'San Antonio Palopó',
        'San Lucas Tolimán',
        'Santa Cruz La Laguna',
        'San Pablo La Laguna',
        'San Marcos La Laguna',
        'San Juan La Laguna',
        'San Pedro La Laguna',
        'Santiago Atitlán',
      ],

      Totonicapán: [
        'Totonicapán',
        'San Cristóbal Totonicapán',
        'San Francisco El Alto',
        'San Andrés Xecul',
        'Momostenango',
        'Santa María Chiquimula',
        'Santa Lucía La Reforma',
        'San Bartolo Aguas Calientes',
      ],

      Quetzaltenango: [
        'Quetzaltenango',
        'Salcajá',
        'Olintepeque',
        'San Carlos Sija',
        'Sibilia',
        'Cabricán',
        'Cajolá',
        'San Miguel Sigüilá',
        'San Juan Ostuncalco',
        'San Mateo',
        'Concepción Chiquirichapa',
        'San Martín Sacatepéquez',
        'Almolonga',
        'Cantel',
        'Huitán',
        'Zunil',
        'Colomba',
        'San Francisco La Unión',
        'El Palmar',
        'Coatepeque',
        'Génova',
        'Flores Costa Cuca',
        'La Esperanza',
        'Palestina de Los Altos',
      ],

      Suchitepéquez: [
        'Mazatenango',
        'Cuyotenango',
        'San Francisco Zapotitlán',
        'San Bernardino',
        'San José El Ídolo',
        'Santo Domingo Suchitepéquez',
        'San Lorenzo',
        'Samayac',
        'San Pablo Jocopilas',
        'San Antonio Suchitepéquez',
        'San Miguel Panán',
        'San Gabriel',
        'Chicacao',
        'Patulul',
        'Santa Bárbara',
        'San Juan Bautista',
        'Santo Tomás La Unión',
        'Zunilito',
        'Pueblo Nuevo',
        'Río Bravo',
        'San José La Máquina',
      ],

      Retalhuleu: [
        'Retalhuleu',
        'San Sebastián',
        'Santa Cruz Muluá',
        'San Martín Zapotitlán',
        'San Felipe',
        'San Andrés Villa Seca',
        'Champerico',
        'Nuevo San Carlos',
        'El Asintal',
      ],

      'San Marcos': [
        'San Marcos',
        'San Pedro Sacatepéquez',
        'San Antonio Sacatepéquez',
        'Comitancillo',
        'San Miguel Ixtahuacán',
        'Concepción Tutuapa',
        'Tacaná',
        'Sibinal',
        'Tajumulco',
        'Tejutla',
        'San Rafael Pie de la Cuesta',
        'Nuevo Progreso',
        'El Tumbador',
        'El Rodeo',
        'Malacatán',
        'Catarina',
        'Ayutla',
        'Ocós',
        'San Pablo',
        'El Quetzal',
        'La Reforma',
        'Pajapita',
        'Ixchiguán',
        'San José Ojetenam',
        'San Cristóbal Cucho',
        'Sipacapa',
        'Esquipulas Palo Gordo',
        'Río Blanco',
        'San Lorenzo',
        'La Blanca',
      ],

      Huehuetenango: [
        'Huehuetenango',
        'Chiantla',
        'Malacatancito',
        'Cuilco',
        'Nentón',
        'San Pedro Necta',
        'Jacaltenango',
        'Soloma',
        'San Ildefonso Ixtahuacán',
        'Santa Bárbara',
        'La Libertad',
        'La Democracia',
        'San Miguel Acatán',
        'San Rafael La Independencia',
        'Todos Santos Cuchumatán',
        'San Juan Atitán',
        'Santa Eulalia',
        'San Mateo Ixtatán',
        'Colotenango',
        'San Sebastián Huehuetenango',
        'Tectitán',
        'Concepción Huista',
        'San Juan Ixcoy',
        'San Antonio Huista',
        'San Sebastián Coatán',
        'Barillas',
        'Aguacatán',
        'San Rafael Petzal',
        'San Gaspar Ixchil',
        'Santiago Chimaltenango',
        'Santa Ana Huista',
        'Unión Cantinil',
        'Petatán',
      ],

      Quiché: [
        'Santa Cruz del Quiché',
        'Chiché',
        'Chinique',
        'Zacualpa',
        'Chajul',
        'Chichicastenango',
        'Patzité',
        'San Antonio Ilotenango',
        'San Pedro Jocopilas',
        'Cunén',
        'San Juan Cotzal',
        'Joyabaj',
        'Nebaj',
        'San Andrés Sajcabajá',
        'Uspantán',
        'Sacapulas',
        'San Bartolomé Jocotenango',
        'Canillá',
        'Chicamán',
        'Ixcán',
        'Pachalum',
      ],

      'Baja Verapaz': [
        'Salamá',
        'San Miguel Chicaj',
        'Rabinal',
        'Cubulco',
        'Granados',
        'Santa Cruz El Chol',
        'San Jerónimo',
        'Purulhá',
      ],

      'Alta Verapaz': [
        'Cobán',
        'Santa Cruz Verapaz',
        'San Cristóbal Verapaz',
        'Tactic',
        'Tamahú',
        'Tucurú',
        'Panzós',
        'Senahú',
        'San Pedro Carchá',
        'San Juan Chamelco',
        'Lanquín',
        'Cahabón',
        'Chisec',
        'Chahal',
        'Fray Bartolomé de las Casas',
        'Santa Catalina La Tinta',
        'Raxruhá',
      ],

      Petén: [
        'Flores',
        'San José',
        'San Benito',
        'San Andrés',
        'La Libertad',
        'San Francisco',
        'Santa Ana',
        'Dolores',
        'San Luis',
        'Sayaxché',
        'Melchor de Mencos',
        'Poptún',
        'Las Cruces',
        'El Chal',
      ],

      Izabal: [
        'Puerto Barrios',
        'Livingston',
        'El Estor',
        'Morales',
        'Los Amates',
      ],

      Zacapa: [
        'Zacapa',
        'Estanzuela',
        'Río Hondo',
        'Gualán',
        'Teculután',
        'Usumatlán',
        'Cabañas',
        'San Diego',
        'La Unión',
        'Huité',
        'San Jorge',
      ],

      Chiquimula: [
        'Chiquimula',
        'San José La Arada',
        'San Juan Ermita',
        'Jocotán',
        'Camotán',
        'Olopa',
        'Esquipulas',
        'Concepción Las Minas',
        'Quezaltepeque',
        'San Jacinto',
        'Ipala',
      ],

      Jalapa: [
        'Jalapa',
        'San Pedro Pinula',
        'San Luis Jilotepeque',
        'San Manuel Chaparrón',
        'San Carlos Alzatate',
        'Monjas',
        'Mataquescuintla',
      ],

      Jutiapa: [
        'Jutiapa',
        'El Progreso',
        'Santa Catarina Mita',
        'Agua Blanca',
        'Asunción Mita',
        'Yupiltepeque',
        'Atescatempa',
        'Jerez',
        'El Adelanto',
        'Zapotitlán',
        'Comapa',
        'Jalpatagua',
        'Conguaco',
        'Moyuta',
        'Pasaco',
        'San José Acatempa',
        'Quesada',
      ],
    };

    const departamentos =
      await this.departamentoRepository.find();

    const departamentosMap = new Map(
      departamentos.map((departamento) => [
        departamento.nombre,
        departamento,
      ]),
    );

    const municipiosExistentes =
      await this.municipioRepository.find();

    const municipiosMap = new Map(
      municipiosExistentes.map((municipio) => [
        `${municipio.id_departamento}-${municipio.nombre}`,
        municipio,
      ]),
    );

    const municipiosGuardar: Municipio[] = [];

    for (const [nombreDepartamento, municipios] of Object.entries(
      municipiosPorDepartamento,
    )) {
      const departamento = departamentosMap.get(nombreDepartamento);

      if (!departamento) {
        throw new Error(
          `No se encontró el departamento ${nombreDepartamento}`,
        );
      }

      for (const nombreMunicipio of municipios) {
        const clave =
          `${departamento.id_departamento}-${nombreMunicipio}`;

        const municipioExistente = municipiosMap.get(clave);

        if (municipioExistente) {
          if (municipioExistente.estado !== 'ACTIVO') {
            municipioExistente.estado = 'ACTIVO';
            municipiosGuardar.push(municipioExistente);
          }

          continue;
        }

        const nuevoMunicipio = this.municipioRepository.create({
          id_departamento: departamento.id_departamento,
          nombre: nombreMunicipio,
          estado: 'ACTIVO',
        });

        municipiosGuardar.push(nuevoMunicipio);
      }
    }

    if (municipiosGuardar.length > 0) {
      await this.municipioRepository.save(municipiosGuardar);
    }

    console.log(
      'Municipios base verificados correctamente',
    );
  }
}