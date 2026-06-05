import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { TokenBucketRateLimit } from '../rate-limit/decorators/token-bucket.decorator';
import { ContactTicketsService } from './contact-tickets.service';
import { CreateContactTicketDto } from './dto/create-contact-ticket.dto';
import { ListContactTicketsQueryDto } from './dto/list-contact-tickets-query.dto';
import { UpdateContactTicketDto } from './dto/update-contact-ticket.dto';

@Controller()
export class ContactTicketsController {
  constructor(private readonly contactTicketsService: ContactTicketsService) {}

  @TokenBucketRateLimit({
    capacity: 3,
    refillRate: 1,
    refillIntervalMs: 200000,
    cost: 1,
    keyPrefix: 'contact-tickets',
  })
  @UseGuards(OptionalJwtAuthGuard)
  @Post('contact-tickets')
  createTicket(
    @Body() dto: CreateContactTicketDto,
    @CurrentUser() user: AuthenticatedUser | null,
    @Req() request: Request,
  ) {
    return this.contactTicketsService.createTicket(dto, {
      user,
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/contact-tickets')
  listTickets(@Query() query: ListContactTicketsQueryDto) {
    return this.contactTicketsService.listTickets(query);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/contact-tickets/:id')
  getTicket(@Param('id', ParseIntPipe) id: number) {
    return this.contactTicketsService.getTicket(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/contact-tickets/:id')
  updateTicket(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactTicketDto,
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.contactTicketsService.updateTicket(id, dto, {
      admin,
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });
  }
}
