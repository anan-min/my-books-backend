import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { BookRepository } from './books.repository';
import { Types } from 'mongoose';

describe('BooksService', () => {
  let service: BooksService;
  let mockRepo: Partial<BookRepository>;

  beforeEach(async () => {

    mockRepo = {
      findDefaultBooks: jest.fn(),
      getBookStock: jest.fn(),
      getBooksByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [BooksService, {
        provide: BookRepository,
        useValue: mockRepo,
      }],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });


  function mockBooksFromRepo(count: number): any[] {
    let books: any[] = [];
    for (let i = 0; i < count; i++) {
      books.push({
        _id: new Types.ObjectId(),
        title: `Book Title ${i + 1}`, 
        genre: `Genre ${i + 1}`,
        price: 10 + i,
        stock: 5 + i,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return books;
  }


  // should be defined 
  // should return empty array if no books exists 
  // should return books with correct structure 
  // should call repository method 
  // should handle errors from the repository 

  describe('get defaultBooks', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });


    it('should return empty array if no books exists', async () => {
      const mockBooks = [];
      mockRepo.findDefaultBooks = jest.fn().mockResolvedValue(mockBooks);

      const result = await service.getDefaultBooks();
      expect(result).toEqual([]);
      expect(mockRepo.findDefaultBooks).toHaveBeenCalled();
    })


    it('should return books with correct structure', async () => {
      const mockBooks = mockBooksFromRepo(20);
      mockRepo.findDefaultBooks = jest.fn().mockResolvedValue(mockBooks);

      const expectedResult = mockBooks.map(book => ({
        _id: book._id,
        title: book.title,
        genre: book.genre,
        price: book.price,
        stock: book.stock,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      }));

      const result = await service.getDefaultBooks();
      expect(result).toEqual(expectedResult);
      expect(mockRepo.findDefaultBooks).toHaveBeenCalled();
    })


    it('should call repository method', async () => {
      const mockBooks = mockBooksFromRepo(5);
      mockRepo.findDefaultBooks = jest.fn().mockResolvedValue(mockBooks);
      await service.getDefaultBooks();
      expect(mockRepo.findDefaultBooks).toHaveBeenCalledTimes(1);
    });


    it('should handle errors from the repository', async () => {
      mockRepo.findDefaultBooks = jest.fn().mockRejectedValue(new Error('Database error'));
      await expect(service.getDefaultBooks()).rejects.toThrow('Database error');
      expect(mockRepo.findDefaultBooks).toHaveBeenCalled();
    });

  });



  // should return true when enough stock exists
  // should return false when not enough stock exists
  // should return false when book does not exist
  // should handle errors from the repository

  describe('hasEnoughStock', () => {
    it('should return true when enough stock exists', async () => {
      mockRepo.getBookStock = jest.fn().mockResolvedValue(10);
      const bookId = 'book-id-1';
      const quantity = 5;

      const result = await service.hasEnoughStock(bookId, quantity);
      expect(mockRepo.getBookStock).toHaveBeenCalledWith(bookId);
      expect(result).toBe(true);
    });

    it('should return true when enough stock exists 2', async () => {
      mockRepo.getBookStock = jest.fn().mockResolvedValue(5);
      const bookId = 'book-id-1';
      const quantity = 5;

      const result = await service.hasEnoughStock(bookId, quantity);
      expect(mockRepo.getBookStock).toHaveBeenCalledWith(bookId);
      expect(result).toBe(true);
    });

    it('should return false when not enough stock exists', async () => {
      mockRepo.getBookStock = jest.fn().mockResolvedValue(5);
      const bookId = 'book-id-1';
      const quantity = 3;

      const result = await service.hasEnoughStock(bookId, quantity);
      expect(mockRepo.getBookStock).toHaveBeenCalledWith(bookId);
      expect(result).toBe(true);
    });

    it('should return false when book does not exist', async () => {
      mockRepo.getBookStock = jest.fn().mockResolvedValue(null);
      const bookId = 'book-id-1';
      const quantity = 6;

      const result = await service.hasEnoughStock(bookId, quantity);
      expect(mockRepo.getBookStock).toHaveBeenCalledWith(bookId);
      expect(result).toBe(false);

    });
    it('should handle errors from the repository', async () => {
      const id = "validId"
      const qty = 1
      mockRepo.getBookStock = jest.fn().mockRejectedValue(new Error('Database error'));
      await expect(service.hasEnoughStock(id, qty)).rejects.toThrow('Database error');
      expect(mockRepo.getBookStock).toHaveBeenCalled();
    });

  });



  // it should be defined 
  // it should return empty array when no ids provided
  // it should return books with correct structure for given ids
  // it should handle errors from the repository
  describe('getBooksByIds', () => {
    it('should be defined', () => {
      expect(service.getBooksByIds).toBeDefined();
    });

    it('should return empty array when no ids provided', async () => {
      mockRepo.getBooksByIds = jest.fn();
      const result = await service.getBooksByIds([]);
      expect(result).toEqual([]);
      expect(mockRepo.getBooksByIds).not.toHaveBeenCalled();
    });

    it('should return books with correct structure for given ids', async () => {
      const books = mockBooksFromRepo(10);
      const bookIds = books.map((book) => book._id);
      mockRepo.getBooksByIds = jest.fn().mockResolvedValue(books)

      const results = await mockRepo.getBooksByIds(bookIds);
      const resultIDs = results.map((result) => result._id);


      expect(resultIDs).toEqual(bookIds);
      expect(mockRepo.getBooksByIds).toHaveBeenCalledTimes(1)
      expect(mockRepo.getBooksByIds).toHaveBeenCalledWith(bookIds);
    });

    it('it should handle errors from the repository', async () => {
      const ids = ["valid_id"]
      mockRepo.getBooksByIds = jest.fn().mockRejectedValue(new Error('Database error'));
      await expect(service.getBooksByIds(ids)).rejects.toThrow('Database error');
      expect( mockRepo.getBooksByIds ).toHaveBeenCalled()
    });


  });

});
