import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateRecordDto,
  RecordFiltersDto,
  UpdateRecordDto,
} from './records.dto';

@Injectable()
export class RecordsService {
  private readonly TABLE = 'records';

  constructor(
    private readonly supabase: SupabaseService,
  ) {}

  async findAll(filters: RecordFiltersDto) {
    const page = filters.page ?? 1;
    const per_page = filters.per_page ?? 20;
    const start = (page - 1) * per_page;
    const end = start + per_page - 1;

    let query = this.supabase.db
      .from(this.TABLE)
      .select('*, subcategories(id, name, category_id, categories(id, name, type))', { count: 'exact' })
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (filters.subcategory_id !== undefined) {
      if (filters.subcategory_id === null || filters.subcategory_id === 'null') {
        query = query.is('subcategory_id', null);
      } else {
        query = query.eq('subcategory_id', filters.subcategory_id);
      }
    }
    if (filters.category_id) {
      query = query.eq('subcategories.category_id', filters.category_id);
    }
    if (filters.responsible) {
      query = query.eq('responsible', filters.responsible);
    }
    if (filters.method) {
      query = query.eq('method', filters.method);
    }
    if (filters.date_from) {
      query = query.gte('date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('date', filters.date_to);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      data,
      total: count ?? 0,
      page,
      per_page,
      total_pages: Math.ceil((count ?? 0) / per_page),
    };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .select('*, subcategories(id, name, category_id, categories(id, name, type))')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Registro ${id} não encontrado`);
    return data;
  }

  async create(dto: CreateRecordDto) {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .insert({
        subcategory_id: dto.subcategory_id,
        responsible: dto.responsible,
        value: dto.value,
        method: dto.method,
        date: dto.date,
        notes: dto.notes,
      })
      .select('*, subcategories(id, name, category_id, categories(id, name, type))')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, dto: UpdateRecordDto) {
    await this.findOne(id);

    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .update(dto)
      .eq('id', id)
      .select('*, subcategories(id, name, category_id, categories(id, name, type))')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    await this.findOne(id);

    const { error } = await this.supabase.db
      .from(this.TABLE)
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Registro removido com sucesso' };
  }

  async getSummary(filters: RecordFiltersDto) {
    let query = this.supabase.db
      .from(this.TABLE)
      .select('value, responsible, subcategories(categories(type))');

    if (filters.date_from) query = query.gte('date', filters.date_from);
    if (filters.date_to) query = query.lte('date', filters.date_to);
    if (filters.subcategory_id !== undefined) {
      if (filters.subcategory_id === null || filters.subcategory_id === 'null') {
        query = query.is('subcategory_id', null);
      } else {
        query = query.eq('subcategory_id', filters.subcategory_id);
      }
    }
    if (filters.category_id) {
      query = query.eq('subcategories.category_id', filters.category_id);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    let total_income = 0;
    let total_outcome = 0;
    let pedro_outcome = 0;
    let clarissa_outcome = 0;

    for (const record of data ?? []) {
      const type = (record.subcategories as any)?.categories?.type;
      const value = Number(record.value);
      if (type === 'income') {
        total_income += value;
      } else if (type === 'outcome') {
        total_outcome += value;
        if (record.responsible === 'Pedro') pedro_outcome += value;
        else if (record.responsible === 'Clarissa') clarissa_outcome += value;
      }
    }

    return {
      total_income,
      total_outcome,
      balance: total_income - total_outcome,
      count: data?.length ?? 0,
      pedro_outcome,
      clarissa_outcome,
    };
  }
}
