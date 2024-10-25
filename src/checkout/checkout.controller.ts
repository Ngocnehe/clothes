import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() checkout: CheckoutDto) {
    return this.checkoutService.placeorder(req.user._id, checkout);
  }
}
