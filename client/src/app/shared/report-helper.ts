import {GoogleCharts} from 'google-charts';

export class ReportHelper {
  public static print(id: string): void{
    const printContents = document.getElementById(id).innerHTML;
    const popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Sample</title>
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
          <style>
            .none-in-print{
                display: none;
            }

            .hidden-in-print{
                visibility: hidden;
            }
          </style>
        </head>
        <body onload="window.print();">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
  }

  public static dateByText(text: string): Date{
    return new Date(Date.parse(text));
  }
}
