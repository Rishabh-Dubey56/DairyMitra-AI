import { MilkRecordModel, memoryMilkRecords } from './milkRecord.model.js';
import { animalService } from '../animals/animal.service.js';
import { dbManager } from '../../bootstrap/database.js';
import { ConflictError, NotFoundError } from '../../shared/errors/AppError.js';
import { ErrorCodes } from '../../shared/constants/errorCodes.js';
import { parsePagination, formatPaginatedResult, PaginatedResult } from '../../shared/utils/pagination.js';

export class MilkRecordService {
  public async getAll(query: any): Promise<PaginatedResult<any>> {
    const pagination = parsePagination(query);
    const date = query.date;
    const animalId = query.animalId;
    const startDate = query.startDate;
    const endDate = query.endDate;

    if (dbManager.isUsingFallback()) {
      let filtered = [...memoryMilkRecords];
      if (date) filtered = filtered.filter((r) => r.date === date);
      if (animalId) filtered = filtered.filter((r) => r.animalId === animalId || r.animalTag === animalId);
      if (startDate) filtered = filtered.filter((r) => r.date >= startDate);
      if (endDate) filtered = filtered.filter((r) => r.date <= endDate);

      // Sort descending by date
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const total = filtered.length;
      const paginated = filtered.slice(pagination.skip, pagination.skip + pagination.limit);
      return formatPaginatedResult(paginated, total, pagination);
    }

    const filter: any = {};
    if (date) filter.date = date;
    if (animalId) filter.$or = [{ animalId }, { animalTag: animalId.toUpperCase() }];
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const [data, total] = await Promise.all([
      MilkRecordModel.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      MilkRecordModel.countDocuments(filter),
    ]);

    return formatPaginatedResult(data, total, pagination);
  }

  public async create(data: any): Promise<any> {
    // Lookup animal details to ensure tag & name consistency
    const animal = await animalService.getById(data.animalId);

    const morning = Number(data.morningQuantity) || 0;
    const evening = Number(data.eveningQuantity) || 0;
    const total = Math.round((morning + evening) * 10) / 10;
    const rate = Number(data.ratePerLitre) || (animal.type === 'Buffalo' ? 65 : 44);
    const amount = Math.round(total * rate);

    if (dbManager.isUsingFallback()) {
      const duplicate = memoryMilkRecords.find((r) => r.animalId === animal.id && r.date === data.date);
      if (duplicate) {
        throw new ConflictError(
          `A milk production record for ${animal.tagNumber} (${animal.name}) on date ${data.date} already exists.`,
          ErrorCodes.MILK_DUPLICATE_SESSION
        );
      }

      const newRecord = {
        _id: `mr-${Date.now()}`,
        id: `mr-${Date.now()}`,
        animalId: animal.id || animal._id,
        animalTag: animal.tagNumber,
        animalName: animal.name,
        date: data.date,
        morningQuantity: morning,
        eveningQuantity: evening,
        totalQuantity: total,
        fatPercentage: data.fatPercentage,
        snfPercentage: data.snfPercentage,
        ratePerLitre: rate,
        totalAmount: amount,
        notes: data.notes,
        createdAt: new Date(),
      };

      memoryMilkRecords.unshift(newRecord);
      return newRecord;
    }

    const existing = await MilkRecordModel.findOne({ animalId: animal._id, date: data.date });
    if (existing) {
      throw new ConflictError(
        `A milk production record for ${animal.tagNumber} (${animal.name}) on date ${data.date} already exists.`,
        ErrorCodes.MILK_DUPLICATE_SESSION
      );
    }

    const record = new MilkRecordModel({
      animalId: animal._id,
      animalTag: animal.tagNumber,
      animalName: animal.name,
      date: data.date,
      morningQuantity: morning,
      eveningQuantity: evening,
      totalQuantity: total,
      fatPercentage: data.fatPercentage,
      snfPercentage: data.snfPercentage,
      ratePerLitre: rate,
      totalAmount: amount,
      notes: data.notes,
    });

    return record.save();
  }

  public async delete(id: string): Promise<void> {
    if (dbManager.isUsingFallback()) {
      const idx = memoryMilkRecords.findIndex((r) => r._id === id || r.id === id);
      if (idx === -1) throw new NotFoundError('Milk record not found.', ErrorCodes.MILK_RECORD_NOT_FOUND);
      memoryMilkRecords.splice(idx, 1);
      return;
    }

    const res = await MilkRecordModel.findByIdAndDelete(id);
    if (!res) {
      throw new NotFoundError('Milk record not found.', ErrorCodes.MILK_RECORD_NOT_FOUND);
    }
  }
}

export const milkRecordService = new MilkRecordService();
