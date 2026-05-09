import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePercentageDto } from './percentages.dto';

@Injectable()
export class PercentagesService {
  private readonly TABLE = 'percentages';
  private readonly CONFIG_ID = '00000000-0000-0000-0000-000000000001';

  constructor(private readonly supabase: SupabaseService) {}

  async upsert(dto: CreatePercentageDto) {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .upsert({ id: this.CONFIG_ID, ...dto })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async find() {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .select('*')
      .eq('id', this.CONFIG_ID)
      .single();

    if (error || !data) throw new NotFoundException('Configuração não encontrada');
    return data;
  }
}
