import { Injectable } from '@nestjs/common';
import { OrderRepository } from 'src/order/model/order.repository';
import { OrderService } from 'src/order/model/order.service';
import { ReportItemDto } from './dto/report-item.dto';

@Injectable()
export class ReportService {
  constructor(private readonly orderRepository: OrderRepository) {}
  async getReport(lastDate: string) {
    switch (lastDate) {
      case 'last_7_days':
        return await this.getLastOptionDaysOrder(7);
      case 'last_28_days':
        return await this.getLastOptionDaysOrder(28);
      case 'last_year':
        return await this.getLastYearOrder();
      default:
        return await this.getLastOptionDaysOrder(7);
    }
  }

  async getLastOptionDaysOrder(day: number) {
    let reportItem: ReportItemDto[] = [];
    const currentDate = new Date();

    for (let i = 0; i < day; i++) {
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - i); // Ngày bắt đầu
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1); // Ngày kết thúc (ngày tiếp theo)

      const orders = await this.orderRepository.getLastOptionDays(
        startDate,
        endDate,
      );

      let gross_sales = 0;
      let net_sales = 0;

      if (orders.length > 0) {
        orders.forEach((order) => {
          gross_sales += order.total;
          net_sales += order.total - order.product_cost;
        });
      }

      reportItem.push({
        gross_sales: gross_sales,
        net_sales: net_sales,
        orders_count: orders.length,
        date: startDate,
      });
    }

    return reportItem;
  }

  async getLastYearOrder() {
    let reportItem: ReportItemDto[] = [];
    const monthCount = 13;
    const currentDate = new Date();

    const startMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 12,
      1,
    );

    for (let i = 0; i < monthCount; i++) {
      const monthStart = new Date(startMonth);
      monthStart.setMonth(startMonth.getMonth() + i);
      console.log('monthStart', monthStart);
      const monthEnd = new Date(monthStart);

      monthEnd.setMonth(monthStart.getMonth() + 1);

      console.log('monthEnd', monthEnd);

      const orders = await this.orderRepository.getLastOptionDays(
        monthStart,
        monthEnd,
      );

      let gross_sales = 0;
      let net_sales = 0;

      if (orders.length > 0) {
        orders.forEach((order) => {
          gross_sales += order.total;
          net_sales += order.total - order.product_cost;
        });
      }

      reportItem.push({
        gross_sales: gross_sales,
        net_sales: net_sales,
        orders_count: orders.length,
        date: monthStart,
      });
    }

    return reportItem;
  }
}
