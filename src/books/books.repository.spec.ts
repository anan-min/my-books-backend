import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BookRepository } from './books.repository';
import { Types } from 'mongoose';

describe('BookRepository', () => {
    let repo: BookRepository;
    let mockBookModel: any; 

    function mockFindChain(mockData: any[]) {
        return {
            exec: jest.fn().mockResolvedValue(mockData),
        };
    }

    function mockFindByIdChain(mockData: any) {
        return {
            exec: jest.fn().mockResolvedValue(mockData),
        };
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

 

    it('should be defined', () => { 
        expect(repo).toBeDefined();
    });

    describe('get default books', () => {
        // should return empty list if no books found 
        // should return all books if books exists
        // should handle error if mongo have error

        it('should return empty list if no books found', async () => {
            const books = []; 
            mockBookModel.find.mockReturnValue(mockFindChain(books))
            const expectedResult = [] 
            const result = await repo.findDefaultBooks();
            expect(result).toEqual(expectedResult);
        });


        it('should return all books if books exists', async () => {
            const books = [
                {
                    _id: new Types.ObjectId(),
                    title: 'Book 1',
                    genre: ['Fiction'],
                    price: 10,
                    stock: 5,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    _id: new Types.ObjectId(),
                    title: 'Book 1',
                    genre: ['Fiction'],
                    price: 10,
                    stock: 5,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    _id: new Types.ObjectId(),
                    title: 'Book 1',
                    genre: ['Fiction'],
                    price: 10,
                    stock: 5,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            

            mockBookModel.find.mockReturnValue(mockFindChain(books))
            const result = await repo.findDefaultBooks();
            expect(result).toEqual(books);
        })

        it('should handle error if mongo have error', async () => {
            mockBookModel.find.mockReturnValue(
                { exec: jest.fn().mockRejectedValue(new Error('Mongo error')) }
            );
            await expect(repo.findDefaultBooks()).rejects.toThrow('Mongo error')
        })
        
    })




    describe('get book stock', () => {
        // should return null if no book found 
        // should find book based on id and return stock 
        // should handle error if mongo have error

        it('should return null if no book found', async () => {
            mockBookModel.findById.mockReturnValue(mockFindByIdChain(null));
            const result = await repo.getBookStock(new Types.ObjectId().toString());
            expect(result).toBeNull();
        });

        it('should find book based on id and return stock', async () => {
            const book = {
                _id: new Types.ObjectId(),
                title: 'Book 1',
                genre: ['Fiction'],
                price: 10,
                stock: 5,
                createdAt: new Date(),
                updatedAt: new Date(),
            };


            mockBookModel.findById.mockReturnValue(mockFindByIdChain(book));
            const result = await repo.getBookStock(book._id.toString());
            expect(mockBookModel.findById).toHaveBeenCalledWith(book._id.toString(), { stock: 1 });
            expect(mockBookModel.findById).toHaveBeenCalledTimes(1);
            expect(result).toEqual(book.stock);
        });


        it('should handle error if mongo have error', async () => {
            mockBookModel.findById.mockReturnValue(
                { exec: jest.fn().mockRejectedValue(new Error('Mongo error')) }
            );
            await expect(repo.getBookStock(new Types.ObjectId().toString())).rejects.toThrow('Mongo error')
        });
        
    })



    describe('get books by ids', () => {
        // should return empty list if ids is empty 
        // should return books based on ids 
        // should handle error if mongo have error

        it('should return empty list if ids is empty', async () => {
            const result = await repo.getBooksByIds([]);
            expect(result).toEqual([]);
        });

        it('should return books based on ids', async () => {
            const ids = [new Types.ObjectId().toString(), new Types.ObjectId().toString()];
            const books = [
                {
                    _id: new Types.ObjectId(ids[0]),
                    title: 'Book 1',
                    genre: ['Fiction'],
                    price: 10,
                    stock: 5,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    _id: new Types.ObjectId(ids[1]),
                    title: 'Book 2',
                    genre: ['Non-Fiction'],
                    price: 15,
                    stock: 3,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            mockBookModel.find.mockReturnValue(mockFindChain(books));
            const result = await repo.getBooksByIds(ids);
            expect(mockBookModel.find).toHaveBeenCalledWith({
                _id: { $in: ids },
            });
            expect(mockBookModel.find).toHaveBeenCalledTimes(1);
            expect(result).toEqual(books);
        });

        it('should handle error if mongo have error', async () => {
            const ids = [new Types.ObjectId().toString(), new Types.ObjectId().toString()];

            mockBookModel.find.mockReturnValue(
                { exec: jest.fn().mockRejectedValue(new Error('Mongo error')) }
            );
            await expect(repo.getBooksByIds(ids)).rejects.toThrow('Mongo error')
        });
        
    })


});