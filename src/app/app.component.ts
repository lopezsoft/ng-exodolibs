import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ColumnContract, DataSourceContract} from "exodolibs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'ng-exodolibs';
  aColumns: ColumnContract[] = [
    {
      text: '#',
      dataIndex: 'checked',
      width: '32px',
      cellRender: (row: any, rowIndex: number): string => {
        return `<span>${rowIndex + 1}</span>`;
      }
    },
    {
      text: '..',
      dataIndex: 'sd',
      width: '16px',
      cellRender: (row, rowIndex): string => {
        return `Hola`;
      }
    },
    {
      text: 'First Name',
      dataIndex: 'name',
      width: '100%',
      editing: true,
      clicksToEdit: 1
    },
    {
      text: 'Last Name',
      dataIndex: 'last_name',
      width: '300px',
      editing: true,
      clicksToEdit: 2,
      cssCell: 'text-muted text-danger',
    },
    {
      text: 'checking',
      dataIndex: 'checking',
      editing: true,
      type: 'boolean',
      clicksToEdit: 2,
      cssCell: 'text-center'
    },
    {
      text: 'Number',
      dataIndex: 'number',
      editing: true,
      type: 'number',
      clicksToEdit: 2
    },
    {
      text: 'Currency',
      dataIndex: 'currency',
      editing: true,
      type: "currency",
      format: 'es-CO',
      currency: 'COP',
      minWidth: '10rem',
      align: 'right',
      clicksToEdit: 2
    },
    {
      text: 'Date',
      dataIndex: 'date',
      editing: true,
      type: "date",
      format: 'Y-m-d',
      minWidth: '10rem',
      clicksToEdit: 2
    }
  ];
  columns: ColumnContract[] = [
    {
      text: '#',
      dataIndex: 'term_name',
      width: '32px',
      cellRender: (row: any, rowIndex: number): string => {
        return `<span>${rowIndex + 1}</span>`;
      }
    },
    {
      text: '..',
      dataIndex: 'sd',
      width: '16px',
      cellRender: (row, rowIndex): string => {
        return `Hola`;
      }
    },
    {
      text: 'First Name',
      dataIndex: 'name',
      width: '100%',
      editing: true,
      clicksToEdit: 1
    },
    {
      text: 'Last Name',
      dataIndex: 'last_name',
      width: '300px',
      editing: true,
      clicksToEdit: 2,
      cssCell: 'text-muted text-danger',
    },
    {
      text: 'checking',
      dataIndex: 'checking',
      editing: true,
      type: 'boolean',
      clicksToEdit: 2,
      cssCell: 'text-center'
    },
    {
      text: 'Number',
      dataIndex: 'number',
      editing: true,
      type: 'number',
      clicksToEdit: 2
    },
    {
      text: 'Currency',
      dataIndex: 'currency',
      editing: true,
      type: "currency",
      format: 'es-CO',
      currency: 'COP',
      minWidth: '10rem',
      align: 'right',
      clicksToEdit: 2
    },
    {
      text: 'Date',
      dataIndex: 'date',
      editing: true,
      type: "date",
      format: 'Y-m-d',
      minWidth: '10rem',
      clicksToEdit: 2
    }
  ];

  aDataSource: any = {
    rows: [],
    dataRecords: null,
  };

  dataSource: any = {
    rows: [],
    dataRecords: null,
  };


  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.dataSource.rows  = [
      {
        name: 'Name',
        last_name: 'Last Name',
        checking: 1,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      },
      {
        name: 'Name',
        last_name: 'Pepe as',
        checking: 1,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      },{
        name: 'Name',
        last_name: 'Marias',
        checking: 1,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      },{
        name: 'parra',
        last_name: 'Last Name',
        checking: 1,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      },{
        name: 'Name',
        last_name: 'Last Name',
        checking: 0,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      },{
        name: 'Lopez',
        last_name: 'Last Name',
        checking: 0,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      },{
        name: 'Name',
        last_name: 'Last Name',
        checking: 1,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      }
    ];
    this.aDataSource.rows  = [
      {
        name: 'Name',
        last_name: 'Last Name',
        checking: 1,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      },
      {
        name: 'Name',
        last_name: 'Pepe as',
        checking: 1,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      },{
        name: 'Name',
        last_name: 'Marias',
        checking: 1,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      },{
        name: 'parra',
        last_name: 'Last Name',
        checking: 1,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      },{
        name: 'Name',
        last_name: 'Last Name',
        checking: 0,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      },{
        name: 'Lopez',
        last_name: 'Last Name',
        checking: 0,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      },{
        name: 'Name',
        last_name: 'Last Name',
        checking: 1,
        number: 1,
        currency: 100045,
        date: '05/01/2022',
      }
    ];
  }
}
