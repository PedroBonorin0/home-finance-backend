import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateInstallmentGroupDto } from './installment-groups.dto';

@Injectable()
export class InstallmentGroupsService {
  private readonly TABLE = 'installment_groups';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new Error(`Grupo de parcelas ${id} nao encontrado`);
    return data;
  }

  async create(dto: CreateInstallmentGroupDto) {
    const installment_value = Math.round((dto.total_value / dto.installments) * 100) / 100;

    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .insert({
        ...dto,
        installment_value,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.db
      .from(this.TABLE)
      .delete()
      .eq('id', id);
    if (error) throw new Error(error.message);
    return { message: 'Grupo de parcelas removido com sucesso' };
  }
}
