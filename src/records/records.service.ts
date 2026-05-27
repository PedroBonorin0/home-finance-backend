import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { InstallmentGroupsService } from '../installment-groups/installment-groups.service';
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
    private readonly installmentGroupsService: InstallmentGroupsService,
  ) {}

  async findAll(filters: RecordFiltersDto) {
    const page = filters.page ?? 1;
    const per_page = filters.per_page ?? 20;
    const start = (page - 1) * per_page;
    const end = start + per_page - 1;

    let query = this.supabase.db
      .from(this.TABLE)
      .select('*, categories(id, name, type)', { count: 'exact' })
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (filters.category_id !== undefined) {
      if (filters.category_id === null || filters.category_id === 'null') {
        query = query.is('category_id', null);
      } else {
        query = query.eq('category_id', filters.category_id);
      }
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
    if (filters.installment_group_id) {
      query = query.eq('installment_group_id', filters.installment_group_id);
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
      .select('*, categories(id, name, type)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Registro ${id} não encontrado`);
    return data;
  }

  async create(dto: CreateRecordDto) {
    if (dto.installments && dto.installments > 1) {
      const group = await this.installmentGroupsService.create({
        category_id: dto.category_id,
        responsible: dto.responsible,
        total_value: dto.value,
        installments: dto.installments,
        first_date: dto.date,
        description: dto.notes ?? undefined,
      });

      const installmentValue = Math.floor((dto.value / dto.installments) * 100) / 100;
      const recordsToInsert = [];

      for (let i = 0; i < dto.installments; i++) {
        const baseDate = new Date(dto.date + 'T12:00:00');
        const targetMonth = baseDate.getMonth() + i;
        const targetYear = baseDate.getFullYear() + Math.floor(targetMonth / 12);
        const normalizedMonth = targetMonth % 12;

        const lastDayOfMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
        const day = Math.min(baseDate.getDate(), lastDayOfMonth);

        const recordDate = new Date(targetYear, normalizedMonth, day);
        const dateStr = recordDate.toISOString().split('T')[0];

        const value = i === dto.installments - 1
          ? Math.round((dto.value - installmentValue * (dto.installments - 1)) * 100) / 100
          : installmentValue;

        recordsToInsert.push({
          category_id: dto.category_id,
          responsible: dto.responsible,
          value,
          method: dto.method,
          date: dateStr,
          notes: dto.notes ? `${dto.notes} (${i + 1}/${dto.installments})` : `${i + 1}/${dto.installments}`,
          installment_group_id: group.id,
          installment_number: i + 1,
        });
      }

      const { data, error } = await this.supabase.db
        .from(this.TABLE)
        .insert(recordsToInsert)
        .select('*, categories(id, name, type)');

      if (error) throw new Error(error.message);
      return data;
    }

    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .insert({
        category_id: dto.category_id,
        responsible: dto.responsible,
        value: dto.value,
        method: dto.method,
        date: dto.date,
        notes: dto.notes,
        installment_group_id: null,
        installment_number: null,
      })
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

  async removeByInstallmentGroup(installment_group_id: string) {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .delete()
      .eq('installment_group_id', installment_group_id)
      .select('id');

    if (error) throw new Error(error.message);
    await this.installmentGroupsService.remove(installment_group_id);
    return { message: `${data?.length ?? 0} registros removidos com sucesso` };
  }

  async updateByInstallmentGroup(installment_group_id: string, dto: UpdateRecordDto) {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .update(dto)
      .eq('installment_group_id', installment_group_id)
      .select('*, categories(id, name, type)');

    if (error) throw new Error(error.message);
    return data;
  }

  async findByInstallmentGroup(installment_group_id: string) {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .select('*, categories(id, name, type)')
      .eq('installment_group_id', installment_group_id)
      .order('date', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async getSummary(filters: RecordFiltersDto) {
    let query = this.supabase.db
      .from(this.TABLE)
      .select('value, categories(type)');

    if (filters.date_from) query = query.gte('date', filters.date_from);
    if (filters.date_to) query = query.lte('date', filters.date_to);
    if (filters.category_id !== undefined) {
      if (filters.category_id === null || filters.category_id === 'null') {
        query = query.is('category_id', null);
      } else {
        query = query.eq('category_id', filters.category_id);
      }
    }

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
