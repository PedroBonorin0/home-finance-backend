import { Module } from '@nestjs/common';
import { InstallmentGroupsController } from './installment-groups.controller';
import { InstallmentGroupsService } from './installment-groups.service';

@Module({
  controllers: [InstallmentGroupsController],
  providers: [InstallmentGroupsService],
  exports: [InstallmentGroupsService],
})
export class InstallmentGroupsModule {}
