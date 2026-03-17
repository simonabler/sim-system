//Verkaufsobjekt;
//Artikelbez;
//Bez.2;
//Barcode;
//MEH;
//Listenpreis EUR/EH;
//Rabatt %;EUR Netto/EH;Brutto;Rabatt;Netto;PE;Preisherkunft;Sortiment;

import { CsvKey } from 'nest-csv-parser';


export class ArticleCsvEntity {

  @CsvKey('Verkaufsobjekt')
  verkaufsobjekt: string;

  @CsvKey('Artikelbez')
  artikelbez: string;

  @CsvKey('Bez. 2')
  bezeichnung2: string;

  @CsvKey('Barcode')
  barcode: string;

  @CsvKey('MEH')
  unit: string;

  @CsvKey('Brutto')
  brutto: string;

  @CsvKey('Netto')
  netto: string;

  @CsvKey('per')
  pe: string;

  constructor(partial: Partial<ArticleCsvEntity>) {
    Object.assign(this, partial);
  }

}
