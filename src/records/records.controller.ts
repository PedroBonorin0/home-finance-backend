import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateRecordDto,
  RecordFiltersDto,
  RecordResponseDto,
  RecordsSummaryDto,
  UpdateRecordDto,
} from './records.dto';
import { RecordsService } from './records.service';

@ApiTags('Registros')
@Controller('records')
export class RecordsController {
  constructor(private readonly service: RecordsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar registros com filtros opcionais' })
  @ApiResponse({ status: 200, type: [RecordResponseDto] })
  findAll(@Query() filters: RecordFiltersDto) {
    return this.service.findAll(filters);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumo financeiro (total receitas, despesas e saldo)' })
  @ApiResponse({ status: 200, type: RecordsSummaryDto })
  getSummary(@Query() filters: RecordFiltersDto) {
    return this.service.getSummary(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar registro por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: RecordResponseDto })
  @ApiResponse({ status: 404, description: 'Registro não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar novo registro financeiro' })
  @ApiResponse({ status: 201, type: RecordResponseDto })
  create(@Body() dto: CreateRecordDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar registro financeiro' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: RecordResponseDto })
  @ApiResponse({ status: 404, description: 'Registro não encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRecordDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover registro financeiro' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Registro removido' })
  @ApiResponse({ status: 404, description: 'Registro nao encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Delete('installment-group/:installment_group_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover todos os registros de um grupo de parcelas' })
  @ApiParam({ name: 'installment_group_id', type: String })
  @ApiResponse({ status: 200, description: 'Registros removidos' })
  removeByInstallmentGroup(@Param('installment_group_id', ParseUUIDPipe) installment_group_id: string) {
    return this.service.removeByInstallmentGroup(installment_group_id);
  }

  @Patch('installment-group/:installment_group_id')
  @ApiOperation({ summary: 'Atualizar todos os registros de um grupo de parcelas' })
  @ApiParam({ name: 'installment_group_id', type: String })
  @ApiResponse({ status: 200, type: [RecordResponseDto] })
  updateByInstallmentGroup(
    @Param('installment_group_id', ParseUUIDPipe) installment_group_id: string,
    @Body() dto: UpdateRecordDto,
  ) {
    return this.service.updateByInstallmentGroup(installment_group_id, dto);
  }

  @Get('installment-group/:installment_group_id')
  @ApiOperation({ summary: 'Buscar todos os registros de um grupo de parcelas' })
  @ApiParam({ name: 'installment_group_id', type: String })
  @ApiResponse({ status: 200, type: [RecordResponseDto] })
  findByInstallmentGroup(@Param('installment_group_id', ParseUUIDPipe) installment_group_id: string) {
    return this.service.findByInstallmentGroup(installment_group_id);
  }
}
