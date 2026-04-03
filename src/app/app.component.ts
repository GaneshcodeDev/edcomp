import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoaderComponent } from './shared/components/global-loader.component';
import { ToastContainerComponent } from './shared/components/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalLoaderComponent, ToastContainerComponent],
  template: `
    <router-outlet />
    <app-global-loader />
    <app-toast-container />
  `,
  styles: [`:host { display: block; }`]
})
export class AppComponent {
  title = 'AttendEase';
}
