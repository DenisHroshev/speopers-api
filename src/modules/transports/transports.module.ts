import { Module } from '@nestjs/common';
import { TransportsController } from './transports.controller';
import { TransportsService } from './transports.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transport } from './entitites/transport.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transport])],
  controllers: [TransportsController],
  providers: [TransportsService],
})
export class TransportsModule {}
