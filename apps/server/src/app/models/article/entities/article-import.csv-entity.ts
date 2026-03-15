//Verkaufsobjekt;
//Artikelbez;
//Bez.2;
//Barcode;
//MEH;
//Listenpreis EUR/EH;
//Rabatt %;EUR Netto/EH;Brutto;Rabatt;Netto;PE;Preisherkunft;Sortiment;

import { CsvKey } from "nest-csv-parser";


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

  // @CsvKey('Listenpreis EUR/EH')
  // listenpreisEUREH: string;

  // @CsvKey('Rabatt %')
  // rabattPer: string;

  // @CsvKey('EUR Netto/EH')
  // eurNetto: string;

  @CsvKey('Brutto')
  brutto: string;

  // @CsvKey('Rabatt')
  // rabatt: string;

  @CsvKey('Netto')
  netto: string;

  @CsvKey('per')
  pe: string;

  // @CsvKey('Preisherkunft')
  // pereisher: string;

  // @CsvKey('Sortiment')
  // sortiment: string;

  constructor(partial: Partial<ArticleCsvEntity>) {
    Object.assign(this, partial);
  }

}