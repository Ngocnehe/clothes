import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import exp from 'constants';
import { Order } from 'src/order/model/order.schema';
import { OrderModule } from 'src/order/model/order.module';

@Module({
  imports: [OrderModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
