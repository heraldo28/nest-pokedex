import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';

@Injectable()
export class SeedService {
  //
  //
  //
  private readonly axios: AxiosInstance = axios;
  //
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  //#region metodo Seed v4
  async executeSeed() {
    await this.pokemonModel.deleteMany({}); // delete * from pokemons;
    //
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    //
    const pokemonToInsert: { name: string; no: number }[] = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];

      pokemonToInsert.push({ name, no }); //[{name: bulbasaur, no:1}]
    });
    await this.pokemonModel.insertMany(pokemonToInsert);
    return 'Seed Executed';
  }

  //#endregion

  //#region metodo Seed v3
  /*
  async executeSeed(): Promise<string> {
    try {
      // Paso 1: Limpiar la colección
      await this.pokemonModel.deleteMany({});
      console.log('Colección de Pokémon vaciada correctamente.');

      // Paso 2: Obtener datos desde la PokeAPI
      const response = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');
      const results = response.data.results;

      // Validación básica
      if (!results || results.length === 0) {
        console.warn('No se recibieron resultados desde la PokeAPI.');
        return 'No hay datos para insertar.';
      }

      // Paso 3: Preparar los objetos a insertar
      const pokemonsToInsert = results.map(({ name, url }) => {
        const segments = url.split('/');
        const no = Number(segments[segments.length - 2]);
        return { name, no };
      });

      // Paso 4: Insertar todos los Pokémon de una vez
      await this.pokemonModel.insertMany(pokemonsToInsert);
      console.log('Pokémon insertados correctamente.');

      // Paso 5: Confirmar que se ejecutó
      return 'Seed ejecutado correctamente';
    } catch (error) {
      console.error('Error al ejecutar el seed:', error);
      throw new Error('No se pudo ejecutar el seed de Pokémon.');
    }
  }
    */
  //#endregion

  //#region metodo Seed v2
  /*
  async executeSeed() {
    await this.pokemonModel.deleteMany({}); //delete * from pokemons;

    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');

    const insertPromiseArray = [];

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];

      insertPromiseArray.push(this.pokemonModel.create({ name, no }));
    });
    await Promise.all(insertPromiseArray);
    return 'Seed Executed';
  }
    */
  //#endregion

  //#region metodo Seed v1
  /*
  async executeSeed() {
    //
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');
    //
    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];

      const pokemon = await this.pokemonModel.create({ name, no });

      // console.log({ name, no });
    });
    return 'Seed Executed';
  }
*/
  //#endregion
}
