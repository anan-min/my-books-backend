import { Test, TestingModule } from '@nestjs/testing';
import { Cart } from './interfaces/cart.interface';
import { CartsRepository } from './carts.repository';
import { describe, mock } from 'node:test';
import { RedisService } from '../redis/redis.service';



describe('CartsRepository', () => {

    let repo: CartsRepository;
    let mockRedis: Partial<RedisService>;

    beforeEach( async () => {

        mockRedis = {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn()
        }

        const module: TestingModule = await Test.createTestingModule({
                providers: [  
                    CartsRepository,
                    {
                        provide: RedisService,
                        useValue: mockRedis,
                    } 
                ],
              }).compile();
        
        repo = module.get<CartsRepository>(CartsRepository)

    })

    it('should be define', async () => {
        expect(repo).toBeDefined();
    })

    describe('getCart', () => {
        // should return null when cartid is null and not call redis
        // should return cart items when cart exists in redis
        // should return null when cart does not exist in redis
        // should handle errors from redis service

        it('should return null when cartid is null and not call redis', async () => {
            mockRedis.get = jest.fn().mockResolvedValue(null);
            const result = await repo.getCart(null)
            expect(result).toBe(null)
            expect(mockRedis.get).not.toHaveBeenCalled()

        });
        it('should return cart items when cart exists in redis', async () => {
            const cartId = "1"
            const cart: Cart = {
                items: [
                    {
                        _id: "random_id",
                        qty: 10
                    },
                    {
                        _id: "random_id",
                        qty: 10
                    }
                ]
            }
            mockRedis.get = jest.fn().mockResolvedValue(JSON.stringify(cart));
            const result = await repo.getCart(cartId)
            expect(result).toEqual(cart)
            expect(mockRedis.get).toHaveBeenCalled()
        });
        it('should return null when cart does not exist in redis', async () => {
            mockRedis.get = jest.fn().mockResolvedValue(null);
            const result = await repo.getCart("invalid_id")
            expect(result).toBe(null)
            expect(mockRedis.get).toHaveBeenCalled()
        });
        it('should handle errors from redis service', async () => {
            mockRedis.get = jest.fn().mockRejectedValue(new Error('Redis error'));
            await expect( repo.getCart("any_id") ).rejects.toThrow('Redis error');
            expect(mockRedis.get).toHaveBeenCalled()
        });

    })


    describe('createCart', () => {
        // should create a new cart with initial item and return cartId
        // should throw error when cartId is empty
        // should throw error when cart already exists 
        // should handle errors from redis service
        // should throw and error when redis 

        it('should create a new cart with initial item and return cartId', async () => {
            const cartId = "1"
            const initialItem = {
                _id: "random_id",
                qty: 5
            }
            const expectedCart: Cart = {
                items: [initialItem]
            }
            mockRedis.set = jest.fn().mockResolvedValue('OK');
            const result = await repo.createCart(cartId, initialItem)
            expect(result).toEqual(expectedCart)
            expect(mockRedis.set).toHaveBeenCalled()
        });

        it('should throw error when cartId is empty', async () => {
            const cartId = ""
            const initialItem = {
                _id: "random_id",
                qty: 5
            }

            mockRedis.get = jest.fn();
            mockRedis.set = jest.fn();

            await expect(repo.createCart(cartId, initialItem))
                             .rejects.toThrow(new Error('cartId is required to create a cart'));
            expect(mockRedis.get).not.toHaveBeenCalled();
            expect(mockRedis.set).not.toHaveBeenCalled();
        });

        it('should throw error when cartId is already exists', async () => {
            const cartId = "already_exists"
            const cart: Cart = {
                items: [
                    {
                        _id: "random_id",
                        qty: 10
                    },
                    {
                        _id: "random_id",
                        qty: 10
                    }
                ]
            }

            const initialItem = {
                _id: "random_id",
                qty: 5
            }

            mockRedis.get = jest.fn().mockResolvedValue(JSON.stringify(cart));
            mockRedis.set = jest.fn();

            await expect(repo.createCart(cartId, initialItem))
                             .rejects.toThrow(new Error('Cart with this ID already exists'));
            expect(mockRedis.get).toHaveBeenCalled();
            expect(mockRedis.set).not.toHaveBeenCalled();
        });




        it('should handle errors from redis service', async () => {
            const cartId = "1"
            const initialItem = {
                _id: "random_id",
                qty: 5
            }

            mockRedis.get = jest.fn().mockRejectedValue(new Error('Redis error'));
            mockRedis.set = jest.fn();

            await expect( repo.createCart(cartId, initialItem) )
                             .rejects.toThrow('Redis error');
            expect(mockRedis.get).toHaveBeenCalled();
            expect(mockRedis.set).not.toHaveBeenCalled();
        });

    })


    describe('updateCart',  () => {
        // should not call redis set when cartId is empty
        // should update cart and return updated cart 
        // should handle errors from redis service

        it('should not call redis  set when cartId is empty', async () => {
            const cartId = ""
            const cart: Cart = {
                items: [
                    {
                        _id: "valid_id",
                        qty: 1
                    }
                ]
            }
            mockRedis.set = jest.fn();
            await expect(repo.updateCart(cartId, cart)).rejects.toThrow("cartId is required to update a cart")
            expect(mockRedis.set).not.toHaveBeenCalled()
        });


        it('should update cart and return updated cart', async () => {
            const cartId = "valid_id"
            const cart: Cart = {
                items: [
                    {
                        _id: "valid_id",
                        qty: 1
                    }
                ]
            }
            mockRedis.set = jest.fn().mockResolvedValue("OK")
            const result = await repo.updateCart(cartId, cart);
            expect(mockRedis.set).toHaveBeenCalledTimes(1)
            expect(result).toEqual(cart);
        });
        

        it('should handle errors from redis service', async () => {
            const cartId = "valid_id"
            const cart: Cart = {
                items: [
                    {
                        _id: "valid_id",
                        qty: 1
                    }
                ]
            }
            mockRedis.set = jest.fn().mockRejectedValue(new Error('Redis error'));
            await expect(repo.updateCart(cartId, cart)).rejects.toThrow(new Error('Redis error'))
            expect(mockRedis.set).toHaveBeenCalledWith(cartId, JSON.stringify(cart));
        });
        

        it('should update cart and return cart', async () => {
            const cartId = "valid_id"
            const cart: Cart = {
                items: [
                    {
                        _id: "valid_id",
                        qty: 1
                    }
                ]
            }
            mockRedis.set = jest.fn().mockResolvedValue("OK")
            const result = await repo.updateCart(cartId, cart)
            expect(result).toEqual(cart);
            expect(mockRedis.set).toHaveBeenCalledWith(cartId, JSON.stringify(cart))
        });

    }) 
});