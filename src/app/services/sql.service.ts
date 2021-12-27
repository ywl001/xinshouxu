import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SQLService {

  sqlUrl = '/xinshouxu/sql.php'
  constructor(private http: HttpClient) { }

  exec(phpFunc:string,data:any){
    console.log(phpFunc)
    return this.http.post<any>(this.sqlUrl, { 'func': phpFunc, 'data': data })
  }
}
