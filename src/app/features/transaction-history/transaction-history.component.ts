import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
declare var $: any;
import * as M from "materialize-css/dist/js/materialize";
import { DatePipe } from '@angular/common';
import { CommonService } from '@clientApp-core/services/common/common.service';
import { B2cUserService } from '@clientApp-core/services/authentication/b2c-user.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {
  @ViewChild('fdp', { static: true }) fdpicker: ElementRef;
  @ViewChild('tdp', { static: true }) tdpicker: ElementRef;
  @ViewChild('cbh', { static: true }) trnModal: ElementRef;
  fdinstances: any;
  tdinstances: any;
  depositeWithdrawReportData: any[] = [];
  Dates: Date[];
  PaymentStatus: [];
  transactionHistory: any[] = [];
  fromdate = new Date();
  @ViewChild('dataTable', { static: true }) table;
  dataTable: any;
  trnModalInstances: any;
  constructor(private b2cUserService: B2cUserService, public datepipe: DatePipe,
    public commonService: CommonService, private toastr: ToastrService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.GetPaymentStatusDropDown();
    this.fromdate.setDate(this.fromdate.getDate() - 7);
    this.Dates = [this.fromdate, new Date()];
    this.loadProfitAndLoss(this.getDateRange(this.Dates));
  }
  ngAfterViewInit() {
    const self = this;
    this.fdinstances = M.Datepicker.init(this.fdpicker.nativeElement, {
      format: 'dd-mm-yyyy',
      defaultDate: self.fromdate,
      setDefaultDate: true,
      onSelect: function (date) {
        if (date != null) {
          self.Dates[0] = date;
        } else {
          self.Dates[0] = new Date();
        }
      }
    });
    this.tdinstances = M.Datepicker.init(this.tdpicker.nativeElement, {
      format: 'dd-mm-yyyy',
      defaultDate: new Date(),
      setDefaultDate: true,
      onSelect: function (date) {
        if (date != null) {
          self.Dates[1] = date;
        } else {
          self.Dates[1] = new Date();
        }
      }
    });

    this.trnModalInstances = M.Modal.init(this.trnModal.nativeElement, {});
    this.fdinstances.setDate(this.fromdate);
    this.tdinstances.setDate(new Date());
  }
  checkDetailsPopUp(){
    this.trnModalInstances.open()
  }
  onSearchClick() {
    this.commonService.setLoadingStatus(true);
    this.loadProfitAndLoss(this.getDateRange(this.Dates));
  }
  loadDatatable() {
    const self = this;
    this.dataTable = $(this.table.nativeElement);
    if (this.dataTable.DataTable) {
      this.dataTable.DataTable({
        data: self.depositeWithdrawReportData,
        responsive: true,
        destroy: true,
        order: [0, 'desc'],
        columns: [{
          title: 'Date',
          data: 'dt',
          render: function (data, type, row) {
            if (type === 'display' || type === 'filter') {
              return self.datepipe.transform(row.dt, 'dd/MM/yyyy, h:mm:ss a');
            }
            return data;
          }
        }, {
          title: 'Transaction Id',
          data: 'rm',
          render: function (data, type, row) {
            if (row.isd != true) {
              return "<a  class='transhover cursor-pointer'  id=" + row.ti + ">" + row.rm + "</a>"
            } else {
              return "<span>" + row.rm + "</span>";
            }
          }
        }, {
          title: 'Status',
          data: 'st',
          render: function (data, type, row) {
            if (row.st === 'Pending') {
              return '<span class="th-status th-warning">Pending</span>'
            } else if (row.st === 'InProgress') {
              return '<span class="th-status th-info">InProgress</span>'
            } else if (row.st === 'Success') {
              return '<span class="th-status th-success">Success</span>'
            } else if (row.st === 'Completed ') {
              return '<span class="th-status th-success">Completed </span>'
            } else if (row.st === 'Failed') {
              return '<span class="th-status th-danger">Failed</span>'
            } else {
              return '<span class="th-status tth-info">' + row.st + '</span>';
            }
          }
        }, {
          title: 'Deposit/Withdraw',
          data: 'isd',
          width: '130px',
          render: function (data, type, row) {
            if (row.isd) {
              return 'Deposit'
            } else {
              return 'Withdraw';
            }
          }
        }, {
          title: 'Amount',
          data: 'amt',
          className: "right-align",
          render: function (data, type, row) {
            if (row.isd) {
              return '<span class="txt-green right-align">' + row.amt + '</span>'
            } else {
              return '<span class="txt-red right-align">' + row.amt + '</span>';
            }
          }
        }, {
          title: 'Remark',
          data: 'pm'
        }],
        dom: 'lBfrtip',
        buttons: [
          {
            extend: 'csvHtml5',
            title: 'transaction-history',
            className: 'btn-gold'
          },
          {
            extend: 'excelHtml5',
            title: 'transaction-history',
            className: 'btn-gold'
          },
          {
            extend: 'pdfHtml5',
            title: 'transaction-history',
            className: 'btn-gold'
          }
        ]
      });
    }
    this.dataTable.off().on('click', 'a', function () {
      const transactionId = $(this)[0].id;
      self.getTransactionHistory(transactionId);
    });
  }

  getTransactionHistory(transactionId: number) {
    this.commonService.setLoadingStatus(true);
    this.b2cUserService.getTransactionHistory$(transactionId)
      .pipe(
        untilDestroyed(this), catchError(err => throwError(err))
      ).subscribe(response => {
        this.transactionHistory = response.result.message;
        this.commonService.setLoadingStatus(false);
        this.trnModalInstances.open();
      }, err => { this.commonService.setLoadingStatus(false); console.log('getTransactionHistory', err) });

  }
  private loadProfitAndLoss(payload) {
    this.b2cUserService.GetDepositeWithdrawReport(payload)
      .pipe(untilDestroyed(this), catchError(err => throwError(err)))
      .subscribe(response => {
        if (response.isSuccess) {
          this.commonService.setLoadingStatus(false);
          this.depositeWithdrawReportData = response.result.message;
          this.loadDatatable();
        } else {
          this.toastr.error(response.result.message, "Notification", {
            toastClass: "custom-toast-error"
          })
        }

      }, err => { this.commonService.setLoadingStatus(false); console.log('GetDepositeWithdrawReport$', err) });
  }
  private getDateRange(dates: Date[]) {
    if (dates != null) {
      return { startDate: dates[0].toLocaleDateString('en-US'), endDate: dates[1].toLocaleDateString('en-US') };
    }
  }
  hideModal() {
    this.trnModalInstances.close();
  }
  GetPaymentStatusDropDown() {
    this.b2cUserService.GetPaymentStatusDropDown()
      .pipe(untilDestroyed(this), catchError(err => throwError(err)))
      .subscribe(response => {
        if (response.isSuccess) {
          this.PaymentStatus = response.result.message;
        }

      }, err => { this.commonService.setLoadingStatus(false); console.log('GetPaymentStatusDropDown$', err) });
  }
  loadScript() {
    //   this.scriptService.load('external').then(data => {
    //     this.loadDatatable();
    // }).catch(error => console.log('loadScript',error));
  }
  isEmpty(obj: any) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
   getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'inprogress';
      case 'InProgress':
        return 'inprogress';
      case 'Success':
      case 'Completed ':
        return 'success';
      case 'Failed':
        return 'failed';
      default:
        return 'success';
    }
  }
  ngOnDestroy() {

  }

}
