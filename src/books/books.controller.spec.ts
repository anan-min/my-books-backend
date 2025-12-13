import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Types } from 'mongoose';

describe('BooksController', () => {
  let controller: BooksController;
  let mockService: Partial<BooksService>;


  function mockDataFromService(count: number) {
    let books: any[] = [];
    for (let i = 0; i < count; i++) {
      books.push({
        _id: new Types.ObjectId(),
        title: `Book Title ${i}`,
        genre: ['Fiction', 'Adventure'],
        price: 10 + i,
        stock: 5 + i,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return books;
  }

  beforeEach(async () => {
    mockService = {
      getDefaultBooks: jest.fn(),
    };


    const module: TestingModule = await Test.createTestingModule({
        controllers: [BooksController],
        providers: [  {
          provide: BooksService,
          useValue: mockService,
        } ],
      }).compile();

    controller = module.get<BooksController>(BooksController);
  
  });

  // should be defined
  // should return books with correct structure
  // should call service method to get books
  // should handle errors from the service


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  it('should return books with correct structure', async () => {
    const mockBooks = mockDataFromService(20);
    mockService.getDefaultBooks = jest.fn().mockResolvedValue(mockBooks);
    const result = await controller.getDefaultBooks();

    const expectedResult = mockBooks.map(book => ({
      _id: book._id,
      title: book.title,
      genre: book.genre,
      price: book.price,
      stock: book.stock,
    }));

    expect(result).toEqual(expectedResult);
  });



  it('should call service method to get books', async () => {
    const mockBooks = mockDataFromService(20);
    mockService.getDefaultBooks = jest.fn().mockResolvedValue(mockBooks);
    const result = await controller.getDefaultBooks();

    expect(mockService.getDefaultBooks).toHaveBeenCalled();
  });

  it('should handle errors from the service', async () => {
    mockService.getDefaultBooks = jest.fn().mockRejectedValue(new Error('Service error'));
    await expect(controller.getDefaultBooks()).rejects.toThrow('Service error');
  });

  





});
