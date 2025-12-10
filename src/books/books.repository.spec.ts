import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BookRepository } from './books.repository';
import { Types } from 'mongoose';
import { mock } from 'node:test';

describe('BookRepository', () => {
    let repo: BookRepository;
    let mockBookModel: any; 

    function mockFindChain(mockData: any[]) {
        let limitValue = mockData.length;
        return {
            limit: function (n: number) {
            limitValue = n;
            return this;
            },
            lean: function () { return this; },
            exec: function () { return Promise.resolve(mockData); },
        };
    }

    function mockFindByIdChain(mockData: any) {
        return {
            lean: function () { return this; },
            exec: function () { return Promise.resolve(mockData); },
        };
    }


    function mockBookFromDatabase (count: number) {
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

    beforeEach( async () => {
        mockBookModel = {
            find: jest.fn(),
            findById: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookRepository,
                {
                    provide: getModelToken('Book'),
                    useValue: mockBookModel,
                },
            ],
        }).compile();


        repo = module.get<BookRepository>(BookRepository);
    })

    // it should be defined
    // it should return 20 books if more than 20 exists 
    // it should return all books if less than 20 exists 
    // should return an empty array if no books exists 
    // should return books with correct structure 
    // should call find limit lean exec 
    // should handle errorrs from the database

    it('should be defined', () => { 
        expect(repo).toBeDefined();
    });

    describe('get default books', () => {

        it('should return 20 books if more than 20 exists', async () => {
            const mockBooks = mockBookFromDatabase(30);
            mockBookModel.find.mockReturnValue(mockFindChain(mockBooks));
            const result = await repo.findDefaultBooks();
            expect(result.length).toBe(20);
            expect(mockBookModel.find).toHaveBeenCalled();
        });
    
    
        it('it should return all books if less than 20 exists', async () => {
            const mockBooks = mockBookFromDatabase(10);
            mockBookModel.find.mockReturnValue(mockFindChain(mockBooks));
            const result = await repo.findDefaultBooks();
            expect(result.length).toBe(10);
            expect(mockBookModel.find).toHaveBeenCalled();
        });
    
    
        it('should return an empty array if no books exists', async () => {
            const mockBooks = [];
            mockBookModel.find.mockReturnValue(mockFindChain(mockBooks));
            const result = await repo.findDefaultBooks();
            expect(result).toEqual([]);
            expect(mockBookModel.find).toHaveBeenCalled();
        });
    
    
        it('should return books with correct structure', async () => {
            const mockBooks = mockBookFromDatabase(2);
            mockBookModel.find.mockReturnValue(mockFindChain(mockBooks));
            const result = await repo.findDefaultBooks();
            const expectedResult = mockBooks.map(book => ({ 
                _id: book._id.toString(),
                title: book.title,
                genre: book.genre,
                price: book.price,
                stock: book.stock,
                createdAt: book.createdAt,
                updatedAt: book.updatedAt,
            }));
            expect(result).toEqual(expectedResult);
            expect(mockBookModel.find).toHaveBeenCalled();
        });
    
    
        it('should handle errors from the database', async () => {
            const errorMessage = 'Database error';
            mockBookModel.find.mockImplementation(() => {
                throw new Error(errorMessage);
            });
    
            await expect(repo.findDefaultBooks()).rejects.toThrow(errorMessage);
            expect(mockBookModel.find).toHaveBeenCalled();
        });
    })




    describe('get book stock', () => {
        // should return null if book not exists
        // should return 0 if book out of stock 
        // should return stock number if book is exists 
        // should handle error when database raise error 

        it('should return null if book not', async () => {
            const id = "undefined"
            mockBookModel.findById.mockReturnValue(mockFindByIdChain(null))
            const result = await repo.getBookStock(id);
            expect(mockBookModel.findById).toHaveBeenCalledWith(id);
            expect(result).toBeNull();
        })

        it('should return 0 if book out of stock', async () => {
            const id = "outOfStockId"
            const mockBook = {
                _id: new Types.ObjectId(),
                title: 'Out of Stock Book',
                genre: ['Fiction'],
                price: 15,
                stock: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockBookModel.findById.mockReturnValue( mockFindByIdChain(mockBook) )
            const result = await repo.getBookStock(id);
            expect( mockBookModel.findById ).toHaveBeenCalledWith(id);
            expect(result).toBe(0);
        })

        it('should return stock number if book is exists', async () => {
            const id = "validid"
            const mockBook = {
                _id: new Types.ObjectId(),
                title: 'Out of Stock Book',
                genre: ['Fiction'],
                price: 15,
                stock: 27,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockBookModel.findById.mockReturnValue( mockFindByIdChain(mockBook) )
            const result = await repo.getBookStock(id);
            expect( mockBookModel.findById ).toHaveBeenCalledWith(id);
            expect(result).toBe(27);
        })

        it('should handle error when database raise error', async () => {
            const id = "valid_id"
            const errorMessage = "error"
            mockBookModel.findById.mockImplementation(() => {
                throw new Error(errorMessage);
            });
            await expect(repo.getBookStock(id)).rejects.toThrow(errorMessage);
            expect(mockBookModel.findById).toHaveBeenCalled();
        })
        

    })




    describe('get books by ids', () => {
        // should be defined 
        // should return empty array if no ids provided
        // should return books matching the provided ids
        // should handle errors from the database

        it('should be defined', () => {
            expect(repo.getBooksByIds).toBeDefined();
        })

        it('should return empty array if no ids provided', async () => {
            // shouldn't call find 
            // should return [] 
            mockBookModel.find.mockResolvedValue(mockFindChain([]))
            const result = await repo.getBooksByIds([])
            expect(result).toEqual([])
        })

        it('should return books matching the provided ids', async () => {
            const books = mockBookFromDatabase(3);
            const ids = books.map(book => book._id.toString());

            mockBookModel.find.mockReturnValue(mockFindChain(books));
            const result = await repo.getBooksByIds(ids);
            const resultIds = result.map(book => book._id);

            expect(resultIds).toEqual(ids);
            expect(mockBookModel.find).toHaveBeenCalledWith({ _id: { $in: ids } });
            expect(mockBookModel.find).toHaveBeenCalledTimes(1)
        })


        it('should handle errors from the database', async () => {
            const ids = ["validid"];
            mockBookModel.find.mockImplementation(() => {
                throw new Error('Database error');
            });
            await expect(repo.getBooksByIds(ids)).rejects.toThrow('Database error');
            expect(mockBookModel.find).toHaveBeenCalledWith({ _id: { $in: ids } });
        })


    })
});