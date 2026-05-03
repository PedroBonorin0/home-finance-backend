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

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(filters: RecordFiltersDto) {
    let query = this.supabase.db
      .from(this.TABLE)
      .select('*, categories(id, name, type)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
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

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .select('*, categories(id, name, type)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Registro ${id} não encontrado`);
    return data;
  }

  async create(dto: CreateRecordDto) {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .insert(dto)
      .select('*, categories(id, name, type)')
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
      .select('*, categories(id, name, type)')
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
      .select('value, categories(type)');

    if (filters.date_from) query = query.gte('date', filters.date_from);
    if (filters.date_to) query = query.lte('date', filters.date_to);
    if (filters.category_id) query = query.eq('category_id', filters.category_id);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    let total_income = 0;
    let total_outcome = 0;

    for (const record of data ?? []) {
      const type = (record.categories as any)?.type;
      if (type === 'income') total_income += Number(record.value);
      else if (type === 'outcome') total_outcome += Number(record.value);
    }

    return {
      total_income,
      total_outcome,
      balance: total_income - total_outcome,
      count: data?.length ?? 0,
    };
  }
}
