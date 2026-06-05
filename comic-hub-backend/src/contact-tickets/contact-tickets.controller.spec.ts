import { Test, TestingModule } from '@nestjs/testing';
import { ContactTicketsController } from './contact-tickets.controller';
import { ContactTicketsService } from './contact-tickets.service';

describe('ContactTicketsController', () => {
  let controller: ContactTicketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactTicketsController],
      providers: [
        {
          provide: ContactTicketsService,
          useValue: {
            createTicket: jest.fn(),
            getTicket: jest.fn(),
            listTickets: jest.fn(),
            updateTicket: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ContactTicketsController>(ContactTicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
