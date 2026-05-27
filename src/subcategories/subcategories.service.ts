import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSubcategoryDto, UpdateSubcategoryDto } from './subcategories.dto';

@Injectable()
export class SubcategoriesService {
  private readonly TABLE = 'subcategories';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(category_id?: string) {
    let query = this.supabase.db
      .from(this.TABLE)
      .select('*, categories(id, name, type)')
      .order('name', { ascending: true });

    if (category_id) {
      query = query.eq('category_id', category_id);
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

    if (error || !data) throw new NotFoundException(`Subcategoria ${id} não encontrada`);
    return data;
  }

  async create(dto: CreateSubcategoryDto) {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .insert(dto)
      .select('*, categories(id, name, type)')
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, dto: UpdateSubcategoryDto) {
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

    const { count: recordCount } = await this.supabase.db
      .from('records')
      .select('id', { count: 'exact', head: true })
      .eq('subcategory_id', id);

    if (recordCount && recordCount > 0) {
      throw new ConflictException(
        `Subcategoria possui ${recordCount} registro(s) vinculado(s) e não pode ser removida`,
      );
    }

    const { error } = await this.supabase.db
      .from(this.TABLE)
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Subcategoria removida com sucesso' };
  }
}
