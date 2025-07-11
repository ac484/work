import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
     <div
        class="bg-surface-0 dark:bg-surface-900 p-6 rounded-2xl max-w-7xl mx-auto border border-surface-200 dark:border-surface-700 w-full"
    >
        <div class="flex justify-between items-center sm:flex-row flex-col gap-2">
        </div>
    </div>
  `,
})
export class AppFooter {

}
