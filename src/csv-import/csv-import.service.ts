import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { SupabaseService } from '../supabase/supabase.service';
import { CsvImportDto } from './csv-import.dto';
import { PaymentMethod } from '../records/records.dto';

@Injectable()
export class CsvImportService {
  private readonly TABLE = 'records';

  constructor(private readonly supabase: SupabaseService) {}

  async import(file: Express.Multer.File, dto: CsvImportDto) {
    const csvContent = file.buffer.toString('utf-8');
    const method = dto.method;

    switch (method) {
      case PaymentMethod.CREDIT:
        return this.importCreditCsv(csvContent, dto);
      case PaymentMethod.PIX:
        return this.importPixCsv(csvContent, dto);
      default:
        throw new BadRequestException('Método não suportado para importação CSV');
    }
  }

  private async getSubcategoryMap(): Promise<Record<string, string>> {
    const { data, error } = await this.supabase.db
      .from('subcategories')
      .select('*, categories(id, name)');

    if (error) throw new Error(`Erro ao carregar subcategorias: ${error.message}`);

    const map: Record<string, string> = {};
    for (const sub of data) {
      const categoryName = (sub.categories as { name: string })?.name;
      if (categoryName) {
        map[`${categoryName}.${sub.name}`] = sub.id;
      }
    }
    return map;
  }

  private findPixSubcategoryId(
    descricao: string,
    map: Record<string, string>,
  ): string | null {
    if (descricao.startsWith('Transferência recebida')) return map['Geral.Extra'] ?? null;
    if (descricao === 'Pagamento de boleto efetuado - VALTER LOURO ASSESSORIA E ADMINISTRACAO DE IMOVEIS') return map['Despesas Fixas.Aluguel'] ?? null;
    if (descricao === 'Aplicação em investimento') return map['Investimento.Selic'] ?? null;
    if (descricao.startsWith('Compra de FII')) return map['Investimento.FII'] ?? null;
    if (descricao === 'Crédito em conta') return map['Geral.Rendimento'] ?? null;
    return null;
  }

  private findCreditSubcategoryId(
    title: string,
    map: Record<string, string>,
  ): string | null {
    if (title === 'Multimix') return map['Alimentação.Mercado'] ?? null;
    if (title === 'Redonda Pizzas') return map['Alimentação.Almoco/Janta'] ?? null;
    if (title.includes('Uber')) return map['Transporte.Uber/99'] ?? null;
    if (title.includes('Spotify')) return map['Lazer.Assinatura'] ?? null;
    if (title.includes('Armazem do Grao')) return map['Alimentação.Mercado'] ?? null;
    if (title.includes('Petro Frutas')) return map['Alimentação.Mercado'] ?? null;
    if (title.includes('Wellhub')) return map['Saúde.Academia'] ?? null;
    if (title.includes('Manual Saude Brasil')) return map['Saúde.Manual - Cabelo'] ?? null;
    return null;
  }

  private async importCreditCsv(csvContent: string, dto: CsvImportDto) {
    const rows = this.parseCsv(csvContent);

    if (rows.length === 0) {
      return { total: 0, created: 0, skipped: [] };
    }

    this.validateColumns(rows[0], ['date', 'title', 'amount']);

    const cancelationAmounts = new Set(
      rows
        .filter((r) => parseFloat(r.amount) < 0)
        .map((r) => Math.abs(parseFloat(r.amount))),
    );

    const subcategoryMap = await this.getSubcategoryMap();
    const created = [];
    const skipped = [];

    for (const row of rows) {
      const amount = parseFloat(row.amount);
      const title = (row.title || '').trim();

      if (amount < 0) {
        skipped.push({ title, amount, reason: 'Registro de cancelamento' });
        continue;
      }

      if (title.toLowerCase().includes('pagamento recebido')) {
        skipped.push({ title, amount, reason: 'Pagamento recebido (último mês pago)' });
        continue;
      }

      if (cancelationAmounts.has(amount)) {
        skipped.push({ title, amount, reason: 'Cancelado (possui estorno correspondente)' });
        continue;
      }

      const subcategory_id = this.findCreditSubcategoryId(title, subcategoryMap);

      const { data, error } = await this.supabase.db
        .from(this.TABLE)
        .insert({
          responsible: dto.responsible,
          value: amount,
          method: PaymentMethod.CREDIT,
          date: row.date,
          notes: title || null,
          subcategory_id,
        })
        .select()
        .single();

      if (error) throw new Error(`Erro ao criar registro: ${error.message}`);
      created.push(data);
    }

    return { total: rows.length, created: created.length, skipped };
  }

  private async importPixCsv(csvContent: string, dto: CsvImportDto) {
    const rows = this.parseCsv(csvContent);

    if (rows.length === 0) {
      return { total: 0, created: 0, skipped: [] };
    }

    this.validateColumns(rows[0], ['Data', 'Valor', 'Descrição']);

    const subcategoryMap = await this.getSubcategoryMap();
    const created = [];
    const skipped = [];

    for (const row of rows) {
      const amount = parseFloat(row.Valor);
      const descricao = (row['Descrição'] || '').trim();

      if (amount === 0) {
        skipped.push({ descricao, amount, reason: 'Valor zero, ignorado' });
        continue;
      }

      const subcategory_id = this.findPixSubcategoryId(descricao, subcategoryMap);

      const { data, error } = await this.supabase.db
        .from(this.TABLE)
        .insert({
          responsible: dto.responsible,
          value: Math.abs(amount),
          method: PaymentMethod.PIX,
          date: this.parseBrazilianDate(row.Data),
          notes: descricao || null,
          subcategory_id,
        })
        .select()
        .single();

      if (error) throw new Error(`Erro ao criar registro: ${error.message}`);
      created.push(data);
    }

    return { total: rows.length, created: created.length, skipped };
  }

  private parseCsv(content: string): Record<string, string>[] {
    try {
      return parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
        relax_column_count: true,
      });
    } catch {
      throw new BadRequestException('Erro ao processar arquivo CSV');
    }
  }

  private validateColumns(row: Record<string, string>, required: string[]) {
    const headers = Object.keys(row);
    const missing = required.filter((col) => !headers.includes(col));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Colunas obrigatórias ausentes: ${missing.join(', ')}. Colunas encontradas: ${headers.join(', ')}`,
      );
    }
  }

  private parseBrazilianDate(dateStr: string): string {
    const parts = dateStr.split('/');
    if (parts.length !== 3) {
      throw new BadRequestException(`Formato de data inválido: ${dateStr}. Esperado: dd/mm/yyyy`);
    }
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
}
