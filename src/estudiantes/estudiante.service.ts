import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEstudianteDto } from './create-estudiante.dto';
import { Estudiante } from './estudiante.entity';

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,
  ) {}

  async findAll(): Promise<Estudiante[]> {
    return this.estudianteRepository.find();
  }

  async create(dto: CreateEstudianteDto): Promise<Estudiante> {
    const existing = await this.estudianteRepository.findOneBy({
      codigo: dto.codigo,
    });
    if (existing) {
      throw new ConflictException(
        `Ya existe un estudiante con el código ${dto.codigo}`,
      );
    }

    const estudiante = this.estudianteRepository.create({
      nombre: dto.nombre,
      codigo: dto.codigo,
    });
    return this.estudianteRepository.save(estudiante);
  }
}
