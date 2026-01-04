import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api, Article, Category } from '../../services/api';

@Component({
  selector: 'app-articles-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './articles-list.html',
  styleUrl: './articles-list.css',
})
export class ArticlesList implements OnInit {
  articles: Article[] = [];
  categories: Category[] = [];
  sources: string[] = [];

  // Filters
  selectedCategory: string = '';
  selectedSource: string = '';
  searchQuery: string = '';
  selectedDateRange: string = 'all';
  customFromDate: string = '';
  customToDate: string = '';
  sortOrder: 'newest' | 'oldest' = 'newest';

  loading: boolean = false;
  error: string = '';

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadArticles();
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadArticles(): void {
    this.loading = true;
    this.error = '';

    const filters: any = {
      sort: this.sortOrder
    };

    if (this.selectedCategory) {
      filters.category = this.selectedCategory;
    }

    if (this.selectedSource) {
      filters.source = this.selectedSource;
    }

    if (this.searchQuery) {
      filters.search = this.searchQuery;
    }

    // Date range filter
    if (this.selectedDateRange !== 'all' && this.selectedDateRange !== 'custom') {
      const dates = this.getDateRange(this.selectedDateRange);
      filters.from_date = dates.from;
      filters.to_date = dates.to;
    } else if (this.selectedDateRange === 'custom') {
      if (this.customFromDate) filters.from_date = this.customFromDate;
      if (this.customToDate) filters.to_date = this.customToDate;
    }

    this.api.getArticles(filters).subscribe({
      next: (articles) => {
        this.articles = articles;
        this.extractSources(articles);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading articles:', err);
        this.error = 'Failed to load articles. Make sure the backend is running.';
        this.loading = false;
      }
    });
  }

  extractSources(articles: Article[]): void {
    const sourceSet = new Set(articles.map(a => a.source));
    this.sources = Array.from(sourceSet).sort();
  }

  getDateRange(range: string): { from: string, to: string } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let from: Date;

    switch (range) {
      case 'today':
        from = today;
        break;
      case 'week':
        from = new Date(today);
        from.setDate(from.getDate() - 7);
        break;
      case 'month':
        from = new Date(today);
        from.setMonth(from.getMonth() - 1);
        break;
      default:
        from = new Date(0);
    }

    return {
      from: from.toISOString(),
      to: now.toISOString()
    };
  }

  onFilterChange(): void {
    this.loadArticles();
  }

  onSearchChange(): void {
    this.loadArticles();
  }

  deleteArticle(article: Article): void {
    if (!confirm(`Delete "${article.title}"?`)) {
      return;
    }

    this.api.deleteArticle(article.id).subscribe({
      next: () => {
        this.loadArticles();
      },
      error: (err) => {
        console.error('Error deleting article:', err);
        alert('Failed to delete article');
      }
    });
  }

  openArticle(url: string | null): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return past.toLocaleDateString();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedSource = '';
    this.searchQuery = '';
    this.selectedDateRange = 'all';
    this.customFromDate = '';
    this.customToDate = '';
    this.loadArticles();
  }
}
