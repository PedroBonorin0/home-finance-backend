import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { InstallmentGroupsModule } from '../installment-groups/installment-groups.module';

@Module({
  imports: [InstallmentGroupsModule],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}
