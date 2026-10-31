import { AnimalModel, memoryAnimals, IAnimal } from './animal.model.js';
import { dbManager } from '../../bootstrap/database.js';
import { redisManager } from '../../bootstrap/redis.js';
import { NotFoundError, ConflictError } from '../../shared/errors/AppError.js';
import { ErrorCodes } from '../../shared/constants/errorCodes.js';
import { parsePagination, formatPaginatedResult, PaginatedResult } from '../../shared/utils/pagination.js';

export class AnimalService {
  private async clearCache(): Promise<void> {
    await redisManager.del('cache:animals:all');
  }

  public async getAll(query: any): Promise<PaginatedResult<any>> {
    const pagination = parsePagination(query);
    const search = (query.search || '').trim().toLowerCase();
    const type = query.type && query.type !== 'ALL' ? query.type : undefined;
    const healthStatus = query.healthStatus && query.healthStatus !== 'ALL' ? query.healthStatus : undefined;

    if (dbManager.isUsingFallback()) {
      let filtered = [...memoryAnimals];

      if (search) {
        filtered = filtered.filter(
          (a) =>
            a.tagNumber.toLowerCase().includes(search) ||
            a.name.toLowerCase().includes(search) ||
            a.breed.toLowerCase().includes(search)
        );
      }

      if (type) filtered = filtered.filter((a) => a.type === type);
      if (healthStatus) filtered = filtered.filter((a) => a.healthStatus === healthStatus);

      const total = filtered.length;
      const paginated = filtered.slice(pagination.skip, pagination.skip + pagination.limit);
      return formatPaginatedResult(paginated, total, pagination);
    }

    const filterCriteria: any = {};
    if (search) {
      filterCriteria.$or = [
        { tagNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
      ];
    }
    if (type) filterCriteria.type = type;
    if (healthStatus) filterCriteria.healthStatus = healthStatus;

    const [data, total] = await Promise.all([
      AnimalModel.find(filterCriteria)
        .sort({ [query.sortBy === 'capacity' ? 'milkCapacity' : 'createdAt']: query.sortOrder === 'asc' ? 1 : -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      AnimalModel.countDocuments(filterCriteria),
    ]);

    return formatPaginatedResult(data, total, pagination);
  }

  public async getById(idOrTag: string): Promise<any> {
    if (dbManager.isUsingFallback()) {
      const match = memoryAnimals.find(
        (a) => a._id === idOrTag || a.id === idOrTag || a.tagNumber.toLowerCase() === idOrTag.toLowerCase()
      );
      if (!match) throw new NotFoundError(`Animal '${idOrTag}' not found.`, ErrorCodes.ANIMAL_NOT_FOUND);
      return match;
    }

    const query = idOrTag.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrTag } : { tagNumber: idOrTag.toUpperCase() };
    const animal = await AnimalModel.findOne(query).lean();
    if (!animal) {
      throw new NotFoundError(`Animal '${idOrTag}' not found.`, ErrorCodes.ANIMAL_NOT_FOUND);
    }
    return animal;
  }

  public async create(data: any): Promise<any> {
    const tag = data.tagNumber.toUpperCase().trim();

    if (dbManager.isUsingFallback()) {
      const exists = memoryAnimals.find((a) => a.tagNumber.toUpperCase() === tag);
      if (exists) {
        throw new ConflictError(`Animal with Tag ID '${tag}' already exists.`, ErrorCodes.ANIMAL_DUPLICATE_TAG);
      }

      const newAnimal = {
        _id: `a-${Date.now()}`,
        id: `a-${Date.now()}`,
        ...data,
        tagNumber: tag,
        vaccinations: [],
        vetVisits: [],
        createdAt: new Date(),
      };
      memoryAnimals.unshift(newAnimal);
      await this.clearCache();
      return newAnimal;
    }

    const existing = await AnimalModel.findOne({ tagNumber: tag });
    if (existing) {
      throw new ConflictError(`Animal with Tag ID '${tag}' already exists.`, ErrorCodes.ANIMAL_DUPLICATE_TAG);
    }

    const animal = new AnimalModel({
      ...data,
      tagNumber: tag,
    });
    const saved = await animal.save();
    await this.clearCache();
    return saved;
  }

  public async update(idOrTag: string, updateData: any): Promise<any> {
    if (dbManager.isUsingFallback()) {
      const idx = memoryAnimals.findIndex(
        (a) => a._id === idOrTag || a.id === idOrTag || a.tagNumber.toLowerCase() === idOrTag.toLowerCase()
      );
      if (idx === -1) throw new NotFoundError(`Animal '${idOrTag}' not found.`, ErrorCodes.ANIMAL_NOT_FOUND);

      memoryAnimals[idx] = { ...memoryAnimals[idx], ...updateData, updatedAt: new Date() };
      await this.clearCache();
      return memoryAnimals[idx];
    }

    const query = idOrTag.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrTag } : { tagNumber: idOrTag.toUpperCase() };
    const updated = await AnimalModel.findOneAndUpdate(query, updateData, { new: true, runValidators: true }).lean();
    if (!updated) {
      throw new NotFoundError(`Animal '${idOrTag}' not found.`, ErrorCodes.ANIMAL_NOT_FOUND);
    }
    await this.clearCache();
    return updated;
  }

  public async delete(idOrTag: string): Promise<void> {
    if (dbManager.isUsingFallback()) {
      const idx = memoryAnimals.findIndex(
        (a) => a._id === idOrTag || a.id === idOrTag || a.tagNumber.toLowerCase() === idOrTag.toLowerCase()
      );
      if (idx === -1) throw new NotFoundError(`Animal '${idOrTag}' not found.`, ErrorCodes.ANIMAL_NOT_FOUND);

      memoryAnimals.splice(idx, 1);
      await this.clearCache();
      return;
    }

    const query = idOrTag.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrTag } : { tagNumber: idOrTag.toUpperCase() };
    const res = await AnimalModel.findOneAndDelete(query);
    if (!res) {
      throw new NotFoundError(`Animal '${idOrTag}' not found.`, ErrorCodes.ANIMAL_NOT_FOUND);
    }
    await this.clearCache();
  }
}

export const animalService = new AnimalService();
