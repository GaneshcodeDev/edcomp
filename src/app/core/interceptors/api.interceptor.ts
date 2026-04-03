import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { LoaderService } from '../services/loader.service';
import { ToastService } from '../services/toast.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(LoaderService);
  const toast = inject(ToastService);

  const token = localStorage.getItem('auth_token');
  const tenantId = localStorage.getItem('active_tenant_id');

  let headers = req.headers;
  if (token) headers = headers.set('Authorization', `Bearer ${token}`);
  if (tenantId) headers = headers.set('X-Tenant-Id', tenantId);

  loader.show();

  return next(req.clone({ headers })).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        toast.error('Session expired. Please login again.');
      } else if (error.status === 403) {
        toast.error(error.error?.message || 'Access denied');
      } else if (error.status === 0) {
        toast.error('Unable to connect to server');
      } else if (error.status >= 500) {
        toast.error('Server error. Please try again later.');
      }
      return throwError(() => error);
    }),
    finalize(() => loader.hide())
  );
};
