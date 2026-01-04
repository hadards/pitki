import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api, Category, Stats } from '../../services/api';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  categories: Category[] = [];
  stats: Stats | null = null;
  newCategoryName: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadStats();
  }

  loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.error = 'Failed to load categories';
      }
    });
  }

  loadStats(): void {
    this.api.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
      }
    });
  }

  addCategory(): void {
    if (!this.newCategoryName.trim()) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.api.createCategory(this.newCategoryName).subscribe({
      next: (category) => {
        this.categories.push(category);
        this.categories.sort((a, b) => a.name.localeCompare(b.name));
        this.newCategoryName = '';
        this.loading = false;
      },
      error: (err) => {
        console.error('Error adding category:', err);
        this.error = err.error?.error || 'Failed to add category';
        this.loading = false;
      }
    });
  }

  deleteCategory(category: Category): void {
    if (!confirm(`Delete category "${category.name}"? Articles in this category will remain but be uncategorized.`)) {
      return;
    }

    this.api.deleteCategory(category.id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== category.id);
        this.loadStats();
      },
      error: (err) => {
        console.error('Error deleting category:', err);
        alert('Failed to delete category');
      }
    });
  }
}
