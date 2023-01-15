import {AlignType, ClickToEditType, ColumnType} from "../model/types-model";

export interface ColumnContract {
  text?: string;
  align?: AlignType;
  width?: string;
  minWidth?: string;
  maxLength?: number;
  minLength?: number;
  dataIndex?: string;
  scope?: string;
  cssCell?: string;
  rowspan?: number;
  colspan?: number;
  hidden?: boolean;
  editing?: boolean;
  clicksToEdit?: ClickToEditType;
  type?: ColumnType
  format?: string;
  currency?: string;
  cellRender?: (row: any, rowIndex: number, value?: string, columnIndex?: number) => string;
  cellClick?: (row: any, rowIndex: number, columnIndex?: number) => void;
  cellDbClick?: (row: any, rowIndex: number, columnIndex?: number) => void;
}
