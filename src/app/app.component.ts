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
  private getFilterClientsResp = {};
  private getTopFinancialIssuersDataResp = {};
  private getClaimLinesAmountsByStatusResp = {};
  private getClaimLinesAmountsByTypeResp = {};
  private getTopClaimLinesAmountByCountryResp = {};

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

    const filtersFilter = {
      clients: [],
      countries: ['Spain'],
      types: [],
      statuses: [],
      beneficialOwners: ['Beneficial Owner 59'],
      portfolios: [],
    };

    this.salesforceService.getFilteredClaimLines(filters).subscribe(
      res => {
        this.getFilteredClaimLinesResp = res;
      }
    );

    this.salesforceService.getFilterClients(filtersFilter).subscribe(
      res => {
        this.getFilterClientsResp = res;
      }
    );

    this.salesforceService.getTopFinancialIssuersData(filters, 10).subscribe(
      res => {
        this.getTopFinancialIssuersDataResp = res;
      }
    );

    this.salesforceService.getClaimLinesAmountsByStatus(filters).subscribe(
      res => {
        this.getClaimLinesAmountsByStatusResp = res;
      }
    );

    this.salesforceService.getClaimLinesAmountsByType(filters).subscribe(
      res => {
        this.getClaimLinesAmountsByTypeResp = res;
      }
    );

    this.salesforceService.getTopClaimLinesAmountByCountry(filters).subscribe(
      res => {
        this.getTopClaimLinesAmountByCountryResp = res;
      }
    );

  }

}
