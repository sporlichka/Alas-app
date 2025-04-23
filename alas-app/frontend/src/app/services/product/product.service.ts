import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { NewProduct, Product } from '../../types/types';
import { Observable, of } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import {
  ShoeModelType,
  BrandType,
  SizeType,
  ColorType,
} from '../../types/types';
import { LoaderService } from '../loader/loader.service';
import { CacheService } from '../cache/cache.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly CACHE_DURATION = 15 * 60 * 1000;
  constructor(
    private http: HttpClient,
    private loaderService: LoaderService,
    private productCacheService: CacheService<Product[]>,
    private brandCacheService: CacheService<BrandType[]>
  ) {}

  public getProducts(filters: any = {}): Observable<Product[]> {
    this.loaderService.show();
    let params = new HttpParams();

    if (filters.brand) {
      params = params.set('brand', filters.brand);
    }
    if (filters.min_price) {
      params = params.set('min_price', filters.min_price);
    }
    if (filters.max_price) {
      params = params.set('max_price', filters.max_price);
    }
    if (filters.has_stock !== undefined) {
      params = params.set('has_stock', filters.has_stock);
    }

    const cacheKey = this.createCacheKey(filters);

    const cachedProducts = this.productCacheService.get(cacheKey);
    if (cachedProducts) {
      console.log('Returning cached data for:', cacheKey);
      this.loaderService.hide();
      return of(cachedProducts);
    } else {
      console.log('Making a new request for products');
    }
    return this.http.get<Product[]>(`products/`, { params }).pipe(
      tap((data) => {
        console.log('Caching data for:', cacheKey);
        this.productCacheService.set(cacheKey, data, this.CACHE_DURATION);
      }),
      catchError((error) => {
        console.error('Error occurred while fetching products:', error);
        throw error;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  private createCacheKey(filters: any): string {
    return JSON.stringify(filters);
  }

  public getProductById(id: number): Observable<Product> {
    this.loaderService.show();
    return this.http.get<Product>(`products/${id}/`).pipe(
      catchError((error) => {
        console.error(
          `Error occurred while fetching product with ID ${id}:`,
          error
        );
        throw error;
      }),
      finalize(() => this.loaderService.hide())
    );
  }

  public getRandomProductExcluding(
    currentProductId?: number
  ): Observable<Product> {
    let params = new HttpParams();

    if (currentProductId !== undefined) {
      params = params.set('currentProductId', currentProductId.toString());
    }

    return this.http
      .get<Product>(`products/get_random_product_excluding_id/`, {
        params,
      })
      .pipe(
        catchError((error) => {
          console.error('Error occurred while fetching random product:', error);
          throw error;
        })
      );
  }
  public patchProductStock(id: number, stock: number): Observable<Product> {
    this.loaderService.show();
    return this.http.patch<Product>(`products/${id}/`, { stock }).pipe(
      catchError((error) => {
        console.error('Error occurred while updating product stock:', error);
        throw error;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  public addProduct(product: NewProduct): Observable<Product> {
    this.loaderService.show();
    return this.http.post<Product>(`products/`, product).pipe(
      catchError((error) => {
        console.error('Error occurred while adding product:', error);
        throw error;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  getShoeModels(): Observable<ShoeModelType[]> {
    return this.http.get<ShoeModelType[]>(`model/`).pipe(
      catchError((error) => {
        console.error(`Error occurred while fetching models:`, error);
        throw error;
      })
    );
  }
  getBrands(): Observable<BrandType[]> {
    const cacheKey = 'brands';
    const cachedBrands = this.brandCacheService.get(cacheKey);
    if (cachedBrands) {
      console.log('Returning cached data for brands');
      return of(cachedBrands);
    } else {
      console.log('Making a new request for brands');
    }
    return this.http.get<BrandType[]>(`brand/`).pipe(
      tap((data) => {
        console.log('Caching data for brands');
        this.brandCacheService.set(cacheKey, data, this.CACHE_DURATION);
      }),
      catchError((error) => {
        console.error(`Error occurred while fetching brands:`, error);
        throw error;
      })
    );
  }
  getSizes(): Observable<SizeType[]> {
    return this.http.get<SizeType[]>(`size/`).pipe(
      catchError((error) => {
        console.error(`Error occurred while fetching sizes:`, error);
        throw error;
      })
    );
  }

  getColors(): Observable<ColorType[]> {
    return this.http.get<ColorType[]>(`color/`).pipe(
      catchError((error) => {
        console.error(`Error occurred while fetching colors:`, error);
        throw error;
      })
    );
  }
}
