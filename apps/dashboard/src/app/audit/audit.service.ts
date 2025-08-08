import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  AuditLogQuery, 
  AuditLogsResponse
} from '../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = 'http://localhost:3003/api/audit-log';

  constructor(private http: HttpClient) {}

  getAuditLogs(query: AuditLogQuery = {}): Observable<AuditLogsResponse> {
    let params = new HttpParams();

    if (query.limit) params = params.set('limit', query.limit.toString());
    if (query.offset) params = params.set('offset', query.offset.toString());

    return this.http.get<AuditLogsResponse>(this.apiUrl, { params });
  }

  downloadAuditLogs(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}`, { 
      responseType: 'blob',
      headers: { 'Accept': 'text/csv' }
    });
  }

  downloadAuditSummary(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/summary`, { 
      responseType: 'blob',
      headers: { 'Accept': 'text/csv' }
    });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  downloadAuditLogsAsCSV(): void {
    this.downloadAuditLogs().subscribe({
      next: (blob) => {
        const timestamp = new Date().toISOString().split('T')[0];
        this.downloadFile(blob, `audit-logs-${timestamp}.csv`);
      },
      error: (error) => {
        console.error('Error downloading audit logs:', error);
      }
    });
  }

  downloadAuditSummaryAsCSV(): void {
    this.downloadAuditSummary().subscribe({
      next: (blob) => {
        const timestamp = new Date().toISOString().split('T')[0];
        this.downloadFile(blob, `audit-summary-${timestamp}.csv`);
      },
      error: (error) => {
        console.error('Error downloading audit summary:', error);
      }
    });
  }
}
