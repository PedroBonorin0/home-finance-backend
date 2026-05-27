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

      const { data, error } = await this.supabase.db
        .from(this.TABLE)
        .insert({
          responsible: dto.responsible,
          value: amount,
          method: PaymentMethod.CREDIT,
          date: row.date,
          notes: title || null,
          subcategory_id: null,
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

    const created = [];
    const skipped = [];

    for (const row of rows) {
      const amount = parseFloat(row.Valor);
      const descricao = (row['Descrição'] || '').trim();

      if (amount === 0) {
        skipped.push({ descricao, amount, reason: 'Valor zero, ignorado' });
        continue;
      }

      const { data, error } = await this.supabase.db
        .from(this.TABLE)
        .insert({
          responsible: dto.responsible,
          value: Math.abs(amount),
          method: PaymentMethod.PIX,
          date: this.parseBrazilianDate(row.Data),
          notes: descricao || null,
          subcategory_id: null,
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
