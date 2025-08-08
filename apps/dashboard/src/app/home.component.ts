import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="text-center py-16">
      <h2 class="text-4xl font-bold text-gray-900 mb-6">Welcome to Turbo Task Management</h2>
      <p class="text-xl text-gray-600 mb-12">A productivity tool for managing tasks efficiently</p>

      <div class="flex justify-center space-x-6">
        <a routerLink="/login" 
           class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200">
          Sign In
        </a>
        <a routerLink="/register" 
           class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200">
          Sign Up
        </a>
      </div>
    
    </div>
  `
})
export class HomeComponent {}
