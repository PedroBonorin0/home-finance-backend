import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateInstallmentGroupDto, InstallmentGroupResponseDto } from './installment-groups.dto';
import { InstallmentGroupsService } from './installment-groups.service';

@ApiTags('Grupos de Parcelas')
@Controller('installment-groups')
export class InstallmentGroupsController {
  constructor(private readonly service: InstallmentGroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar grupos de parcelas' })
  @ApiResponse({ status: 200, type: [InstallmentGroupResponseDto] })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar grupo de parcelas por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: InstallmentGroupResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar grupo de parcelas' })
  @ApiResponse({ status: 201, type: InstallmentGroupResponseDto })
  create(@Body() dto: CreateInstallmentGroupDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover grupo de parcelas' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Grupo de parcelas removido' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
