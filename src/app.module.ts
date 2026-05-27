import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { RecordsModule } from './records/records.module';
import { PercentagesModule } from './percentages/percentages.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { SupabaseModule } from './supabase/supabase.module';
import { CsvImportModule } from './csv-import/csv-import.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    CategoriesModule,
    RecordsModule,
    PercentagesModule,
    SubcategoriesModule,
    CsvImportModule,
  ],
})
export class AppModule {}
