import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Article {
  id: string;
  user_id: string;
  url: string | null;
  title: string;
  thumbnail_url: string | null;
  source: string;
  category_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  categories?: { name: string };
}

export interface Stats {
  total_articles: number;
  by_category: Array<{ category: string; count: number }>;
  by_source: Array<{ source: string; count: number }>;
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private apiUrl = environment.apiUrl;
  private userId = environment.userId;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'x-user-id': this.userId
    });
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`, {
      headers: this.getHeaders()
    });
  }

  createCategory(name: string): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, { name }, {
      headers: this.getHeaders()
    });
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Articles
  getArticles(filters?: {
    category?: string;
    source?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
    sort?: 'newest' | 'oldest';
  }): Observable<Article[]> {
    let url = `${this.apiUrl}/articles`;
    const params = new URLSearchParams();

    if (filters) {
      if (filters.category) params.append('category', filters.category);
      if (filters.source) params.append('source', filters.source);
      if (filters.search) params.append('search', filters.search);
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);
      if (filters.sort) params.append('sort', filters.sort);
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return this.http.get<Article[]>(url, {
      headers: this.getHeaders()
    });
  }

  createArticle(article: {
    url?: string;
    title: string;
    thumbnail_url?: string;
    source: string;
    category_id: string;
    notes?: string;
  }): Observable<Article> {
    return this.http.post<Article>(`${this.apiUrl}/articles`, article, {
      headers: this.getHeaders()
    });
  }

  updateArticle(id: string, updates: {
    title?: string;
    category_id?: string;
    notes?: string;
  }): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/articles/${id}`, updates, {
      headers: this.getHeaders()
    });
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/articles/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Statistics
  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.apiUrl}/stats`, {
      headers: this.getHeaders()
    });
  }

  // Set user ID (call this when app initializes with Telegram user ID)
  setUserId(userId: string): void {
    this.userId = userId;
  }
}
