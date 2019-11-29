import {Injectable} from '@angular/core';
import {RemoteResponseType, SalesforceBaseService} from './salesforceBaseService.service';
import {Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable()
export class SalesforceService extends SalesforceBaseService {

  constructor() {
    super('CTRL_App');
  }

  public callSfMethods(
    controller: string,
    methodPath: string,
    params: any[] = [],
  ): Observable<RemoteResponseType> {
    return super.remoteAction(methodPath, [...params], undefined, controller)
        .pipe(
          catchError((error: any) => {
            console.error(error);
            throw of(error);
          })
        );
  }

  public getUserInfo(): Observable<any> {
    return this.callSfMethods('CTRL_App', 'getUserDetails', []);
  }

  public saveDefaultCurrency(currency: string): Observable<any> {
    return this.callSfMethods('CTRL_App', 'saveDefaultCurrency', [currency]);
  }

  public getFilteredClaimLines(filters): Observable<any> {
    return this.callSfMethods('CTRL_ClaimLines', 'getClaimLines', [filters]);
  }


}
