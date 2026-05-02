import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CategoryType,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './categories.dto';

@Injectable()
export class CategoriesService {
  private readonly TABLE = 'categories';

  constructor(private readonly supabase: SupabaseService) {}

  async findAll(type?: CategoryType) {
    let query = this.supabase.db
      .from(this.TABLE)
      .select('*')
      .order('name', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Categoria ${id} não encontrada`);
    return data;
  }

  async create(dto: CreateCategoryDto) {
    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .insert(dto)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    const { data, error } = await this.supabase.db
      .from(this.TABLE)
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    await this.findOne(id);

    const { count } = await this.supabase.db
      .from('records')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count && count > 0) {
      throw new ConflictException(
        `Categoria possui ${count} registro(s) vinculado(s) e não pode ser removida`,
      );
    }

    const { error } = await this.supabase.db
      .from(this.TABLE)
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Categoria removida com sucesso' };
  }
}
