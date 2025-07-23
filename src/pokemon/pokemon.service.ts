import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase(); // Grabar en minusculas.
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return { msg: 'Creado correctamente.', bd_pokemon: pokemon };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  /*
  findAll() {
    return `This action returns all pokemon`;
  }
*/

  async findAll() {
    try {
      // Realiza la consulta a la base de datos y espera el resultado
      const pokemons: Pokemon[] = await this.pokemonModel.find();

      // Si no hay registros, podrías retornar un array vacío o lanzar una advertencia (opcional)
      if (!pokemons || pokemons.length === 0) {
        console.warn('No se encontraron Pokémon en la base de datos.');
        return [];
      }

      // Retorna los registros obtenidos
      return { msg: 'Pokemons en bd', cdpokemons: pokemons.length, data: pokemons };
    } catch (error) {
      // Imprime el error en consola (útil para debugging)
      console.error('Error al consultar los Pokémon:', error);

      // Lanza una excepción HTTP 500 para que el cliente sepa que hubo un problema en el servidor
      throw new InternalServerErrorException('Error interno al obtener los Pokémon.');
    }
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null = null;

    // Número
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    // MongoID
    if (!pokemon && isValidObjectId(term)) {
      //Si no exist pokemon + validar objeto.
      pokemon = await this.pokemonModel.findById(term);
    }

    // Nombre
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() });
    }

    if (!pokemon) {
      //Excepcion controlada.
      throw new NotFoundException(`Pokemon con id, nombre o número "${term}" no fue encontrado.`);
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      // await pokemon.updateOne(updatePokemonDto, { new: true }); //No funciona bien.
      await pokemon.updateOne(updatePokemonDto);

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  //Excepciones no controladas.
  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon existe en la bd ${JSON.stringify(error.keyValue)} `,
        // `Pokemon existe en la bd ${JSON.stringify(error.keyValue)} y su numero: ${JSON.stringify(error.keyPattern)}`,
      );
    }

    console.log(error);
    throw new InternalServerErrorException(`No puede crear Pokemon - Chequea Los Log de los Servidores.`);
  }

  async remove(id: string) {
    // Este remove csta diseñado para eliminar por nombre, numero y mongoid.
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // return `Esta accion elimino a #${id} pokemon`;
    // return `Esta accion ara algo con #${id}`;
    // const result = await this.pokemonModel.findByIdAndDelete(id);
    const result = await this.pokemonModel.deleteOne({ _id: id });
    const { deletedCount } = result;

    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon con el id "${id}" no fue encontrado.`);
    }

    return { msg: 'Eliminacion efectuada.', _idEliminado: id, result };
  }
}
