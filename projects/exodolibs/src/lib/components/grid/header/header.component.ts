import {Component, Input, OnInit} from '@angular/core';
import {ColumnContract} from '../contracts/column-contract';

@Component({
  selector: 'exodo-grid-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() headers: ColumnContract[];
  constructor() { }

  ngOnInit(): void {
  }

}
