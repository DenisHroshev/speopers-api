import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OperationsService } from './operations.service';
import { CreateOperationDto } from './dtos/create-operation.dto';
import { UpdateOperationDto } from './dtos/update-operation.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FillWithAiDto } from './dtos/fill-with-ai.dto';
import { Role } from '../auth/constants/roles.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TokenUser } from '../auth/decorators/token-user.decorator';
import { ITokenUser } from '../auth/types/token-user.type';

@Controller('operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @UseGuards(AuthGuard)
  @Get()
  getAllOperations(@TokenUser() user: ITokenUser) {
    return this.operationsService.getAllOperations(user);
  }

  @Roles(Role.DISPATCHER)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('fill-with-ai')
  fillWithAi(@Query() { prompt }: FillWithAiDto) {
    return this.operationsService.fillWithAi(prompt);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  getSingleOperation(@Param('id', ParseIntPipe) id: number) {
    return this.operationsService.getSingleOperation(id);
  }

  @Roles(Role.DISPATCHER)
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  addOperation(@Body() createOperationDto: CreateOperationDto) {
    return this.operationsService.addOperation(createOperationDto);
  }

  @Roles(Role.DISPATCHER)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':id')
  modifyOperation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOperationDto: UpdateOperationDto,
  ) {
    return this.operationsService.modifyOperation(id, updateOperationDto);
  }

  @Roles(Role.DISPATCHER)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  deleteOperation(@Param('id', ParseIntPipe) id: number) {
    return this.operationsService.deleteOperation(id);
  }
}
