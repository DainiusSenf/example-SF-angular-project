import {Component, OnInit} from '@angular/core';
import {SalesforceService} from './services/salesforce.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private salesforceService: SalesforceService) { }

  private userInfo = {};
  private saveDefaultCurrencyResp = {};
  private getFilteredClaimLinesResp = {};

  ngOnInit(): void {

    this.salesforceService.getUserInfo().subscribe(
      res => {
        this.userInfo = res;
      }
    );

    this.salesforceService.saveDefaultCurrency('EUR').subscribe(
      res => {
        this.saveDefaultCurrencyResp = res;
      }
    );

    const filters = {
      claimTypes: [],
      currencyCode: 'GBP',
      statuses: [],
      countries: ['Spain'],
      beneficialOwners: ['Beneficial Owner 59'],
      portfolios: [],
      clients: [],
      claimSubmissionDateFrom: '',
      claimSubmissionDateTo: '',
      dividendPaymentDateFrom : '',
      dividendPaymentDateTo : '',
      paymentDateFrom : '',
      paymentDateTo : '',
      pageNo : 0,
      pageSize : 200,
      orderBy : [],
      orderDirection : ''
    };

    this.salesforceService.getFilteredClaimLines(filters).subscribe(
      res => {
        this.getFilteredClaimLinesResp = res;
      }
    );
  }

}
