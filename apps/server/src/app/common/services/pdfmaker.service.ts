import { Injectable } from "@nestjs/common";
//import  PdfPrinter from 'pdfmake';
const PdfPrinter = require('pdfmake')

import { Content, ContentTable, TDocumentDefinitions } from "pdfmake/interfaces";
import { SlipsheetEntity } from "../../models/bills/serializers/slipsheet.serializer";
import { createWriteStream, readFileSync } from 'fs';
import moment = require("moment");
import { BillEntity } from "src/models/bills/serializers/bill.serializer";
import { OrderEntryEntity } from "src/models/bills/serializers/order-entry.serializer";
import { AnnotationEntity } from "src/models/bills/serializers/annotation.serializer";

@Injectable()
export class PdfMakerService {

    private fonts = {
        Courier: {
            normal: 'Courier',
            bold: 'Courier-Bold',
            italics: 'Courier-Oblique',
            bolditalics: 'Courier-BoldOblique'
        },
        Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique'
        },
        Times: {
            normal: 'Times-Roman',
            bold: 'Times-Bold',
            italics: 'Times-Italic',
            bolditalics: 'Times-BoldItalic'
        },
        Arial: {
            normal: __dirname + '\\..\\pdfAnnotation\\fonts\\arial.ttf',
            bold: __dirname + '\\..\\pdfAnnotation\\fonts\\arialbd.ttf',
            italics: __dirname + '\\..\\pdfAnnotation\\fonts\\ariali.ttf',
            bolditalics: __dirname + '\\..\\pdfAnnotation\\fonts\\arialbi.ttf'
        },
        Symbol: {
            normal: 'Symbol'
        },
        ZapfDingbats: {
            normal: 'ZapfDingbats'
        },
        Roboto: {
            normal: 'fonts/Roboto-Regular.ttf',
            bold: 'fonts/Roboto-Medium.ttf',
            italics: 'fonts/Roboto-Italic.ttf',
            bolditalics: 'fonts/Roboto-MediumItalic.ttf'
        }
    };
    private _printer;

    constructor(
    ) {

        this._printer = new PdfPrinter(this.fonts);
    }




    public generateDeliverySlip(slip: SlipsheetEntity): PDFKit.PDFDocument {

        let docDefinition = this.generateDoc();
        const content: Array<Content> = [];
        content.push(this.getHead(slip, slip.printDate));
        content.push({
            text: 'Lieferschein #' + slip.slipsheetnumber,
            style: 'header'
        });

        const annotation = this.getSlipAnnotations(slip);
        if (annotation)
            content.push(annotation);

        content.push(this.getOrdersDelivery(slip));

        docDefinition.content = content;
        // Building the PDFtable0
        return this._printer.createPdfKitDocument(docDefinition);
    }
    private getSlipAnnotations(slip: SlipsheetEntity): Content {

        const returnValue: Content = [];
        slip?.annotations?.forEach((element: AnnotationEntity) => {
            returnValue.push({
                text: element.text,
                style: 'slipAnnotation'
            })
        });
        return returnValue.length === 0 ? null : returnValue;
    }

    public generateBill(bill: BillEntity): PDFKit.PDFDocument {

        let docDefinition = this.generateDoc();
        const content: Array<Content> = [];

        content.push(this.getHead(bill.slipsheets[0], bill.billDate));
        content.push({
            text: 'Rechnung #' + bill.billNumber,
            style: 'header'
        });
        content.push(this.getOrders(bill));
        docDefinition.content = content;
        // Building the PDFtable0
        return this._printer.createPdfKitDocument(docDefinition);
    }

    private generateDoc(): TDocumentDefinitions {

        return {
            pageOrientation: 'portrait',
            pageMargins: [60, 150, 60, 100],
            header: function (currentPageNumber, pageCount, currentPage) {
                return [{

                    columns: [
                        {
                            svg: readFileSync(__dirname + '\\..\\pdfAnnotation\\logo.svg').toString(),
                            fit: [170, 170],
                            margin: [60, 30, 0, 0],
                        },
                        {
                            alignment: 'right',
                            margin: [0, 25, 70, 0],
                            stack: [
                                {
                                    text: `Fliesserau 384 b`,
                                    style: 'header'
                                },
                                {
                                    text: `6500 Landeck`,
                                    style: 'header'
                                },
                                {
                                    text: ` `,
                                    style: 'subheader'
                                },
                                /*  {
                                      text: `Tel. & Fax: 05442/6 29 17`,
                                      style: 'subheader'
                                  },*/
                                {
                                    text: `Mobile +43 699 10 63 63 45`,
                                    style: 'subheader'
                                },
                                {
                                    text: `E-Mail: office@holz-abler.com`,
                                    style: 'subheader'
                                },
                                {
                                    text: `www.holz-abler.com`,
                                    style: 'subheader'
                                },
                                {
                                    text: `FN.: 303902s, ATU63848368`,
                                    style: 'subheader'
                                }
                            ]
                        },
                    ]
                },
                {
                    canvas: [{ type: 'line', x1: 50, y1: 5, x2: 595 - 50, y2: 5, lineWidth: 1 }]
                }
                ]

            },
            footer: function (currentPage, pageCount) {
                return [
                    {
                        canvas: [{ type: 'line', x1: 50, y1: 0, x2: 595 - 50, y2: 0, lineWidth: 1 }],
                        margin: [0, 30, 0, 5],
                    },
                    {
                        table: {
                            widths: [120, '*', 120],
                            margin: [0, 0, 0, 0],
                            body: [
                                [
                                    {
                                        svg: readFileSync(__dirname + '\\..\\pdfAnnotation\\adler.svg').toString(),
                                        alignment: 'right',
                                        width: 40,
                                        margin: [0, 0, 15, 0],
                                        color: '#e9582a'
                                    },

                                    {
                                        text: 'Zahlung innerhalb von 14 Tagen netto Kassa · Zahlbar und klagbar in Landeck \n \
                            Bankverbindung: Sparkasse Imst · IBAN: AT71 2050 2001 0000 2864 · BIC: SPIMAT21XXX \n \
                            Volksbank Tirol · IBAN: AT58 4239 0005 0006 7740 · BIC: VBOEATWWINN',
                                        style: 'footerText',
                                    },

                                    {
                                        image: __dirname + '\\..\\pdfAnnotation\\gdfort.jpg',
                                        width: 40,
                                        margin: [25, 0, 0, 0], color: '#e9582a'
                                    }
                                ]
                            ]
                        },
                        layout: 'noBorders'
                    }];
            },

            content: [],
            styles: {
                header: {
                    fontSize: 12,
                    //bold: true,
                    // margin: [0, 0, 0, 0],
                    color: 'black',
                    // alignment: 'right',
                },
                subheader: {
                    fontSize: 9,
                    // bold: true,
                    // margin: [0, 0, 0, 0],
                    color: 'black',
                    // alignment: 'right',
                },
                footerText: {
                    fontSize: 8,
                    margin: [0, 10, 0, 0],
                    alignment: 'center',
                    color: 'black'
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 7,
                    //color: 'black',
                    color: '#e9582a'
                },
                tableSum: {
                    color: 'black',
                    bold: true,
                },
                tableSumHeader: {
                    bold: true,
                    fontSize: 10,
                    color: 'black'
                },
                tableCell: {
                    fontSize: 7,

                },
                slipCell: {
                    color: '#e9582a'
                },
                slipAnnotation: {
                    fontSize: 9,
                    color: 'black',
                }
            },
            defaultStyle: {
                // alignment: 'justify'
                font: 'Arial',
                fontSize: 12,
            }
        };


    }

    private getOrders(bill: BillEntity): Content {

        let isDiscount = bill.slipsheets.some(c => c.orderEntries.some(o => o.articleGroupRabatt && o.articleGroupRabatt !== 0));
        let isDiscountSpecial = bill.slipsheets.some(c => c.orderEntries.some(o => o.customerRabatt && o.customerRabatt !== 0));

        console.log(isDiscount, isDiscountSpecial)

        const table = {
            style: 'tableExample',
            table: {
                // margin: [30, 0, 0, 0],
                headerRows: 1,
                widths: [60, 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                body: [
                    [
                        { text: 'Pos', style: 'tableHeader', margin: [0, 0, 5, 0] },
                        { text: 'Art.Num.', style: 'tableHeader' },
                        { text: 'Artikel', style: 'tableHeader' },
                        { text: 'Menge', style: 'tableHeader' },
                        { text: 'Preis', style: 'tableHeader' },
                        { text: isDiscount ? 'Rabatt' : '', style: 'tableHeader' },
                        { text: isDiscountSpecial ? 'Sonder\nRabatt' : '', style: 'tableHeader' },
                        { text: 'Gesamt', style: 'tableHeader' },

                    ],
                ]
            },
            layout: this.getTableDefaultLayout()
        };

        let sum = 0;


        for (let iCarts = 0; iCarts < bill.slipsheets.length; iCarts++) {
            let slip = bill.slipsheets[iCarts];
            let row = []
            row.push('');
            row.push({ text: "Lieferschein von " + moment(slip.createdAt).format('DD.MM.YYYY') + " L" + slip.slipsheetnumber, colSpan: 6, style: 'slipCell' });
            row.push('');
            row.push('');
            row.push('');
            row.push('');
            row.push('');
            row.push('');
            table.table.body.push(row);

            const annotation = this.getSlipAnnotations(slip);
            if (annotation) {
                row = [];
                annotation["colSpan"] = 6;
                row.push('');
                row.push(annotation);
                row.push('');
                row.push('');
                row.push('');
                row.push('');
                row.push('');
                row.push('');
                table.table.body.push(row);
            }


            for (let index = 0; index < slip.orderEntries.length; index++) {
                const element: OrderEntryEntity = slip.orderEntries[index];
                const amount = element.amountCounted || element.amount;
                const discountSpecial = element.customerRabatt || 0.0;
                let discount = element.articleGroupRabatt || 0.0;



                let row = []
                row.push({ text: index + 1, style: 'tableCell' });
                row.push({ text: element.article?.artNumber || "", style: 'tableCell' });
                row.push({ text: element.text, style: 'tableCell' });
                row.push({ text: amount, style: 'tableCell', alignment: 'right' });
                row.push({ text: '€' + (element.price.toFixed(2)), style: 'tableCell', alignment: 'right' });
                row.push({ text: isDiscount ? (discount.toFixed(0)) + '%' : '', style: 'tableCell', alignment: 'right' });
                row.push({ text: isDiscountSpecial ? (discountSpecial.toFixed(0)) + '%' : '', style: 'tableCell', alignment: 'right' });
                row.push({ text: '€' + (amount * element.price * (100 - discount) / 100 * (100 - discountSpecial) / 100).toFixed(2), style: 'tableCell', alignment: 'right' });
                sum += amount * element.price * (100 - discount) / 100 * (100 - discountSpecial) / 100;
                table.table.body.push(row);
            }


        }

        let row = []
        row.push({ text: '', border: [0, 0, 0, 0] });
        row.push({ text: '', border: [0, 0, 0, 0] });
        row.push({ text: '', border: [0, 0, 0, 0] });
        row.push({ text: '', border: [0, 0, 0, 0] });
        row.push({ text: 'Summe', colSpan: 2, style: 'tableCell', alignment: 'right' });
        row.push('');
        row.push('');
        row.push({ text: '€' + sum.toFixed(2), style: 'tableCell', alignment: 'right' });
        table.table.body.push(row);

        row = []
        row.push({ text: '', border: [0, 0, 0, 0] });
        row.push({ text: '', border: [0, 0, 0, 0] });
        row.push({ text: '', border: [0, 0, 0, 0] });
        row.push({ text: '', border: [0, 0, 0, 0] });
        row.push({ text: '20% MwSt.', colSpan: 2, style: 'tableCell', alignment: 'right' });
        row.push('');
        row.push('');
        row.push({ text: '€' + (sum * 0.2).toFixed(2), style: 'tableCell', alignment: 'right' });
        table.table.body.push(row);

        row = []
        row.push({ text: '', border: [0, 0, 0, 0] });
        row.push({ text: '', border: [0, 0, 0, 0] });
        row.push({ text: '', border: [0, 0, 0, 0] });
        row.push({ text: '', border: [0, 0, 0, 0] });
        row.push({ text: 'Gesamt', colSpan: 2, style: 'tableSumHeader', alignment: 'right' });
        row.push('');
        row.push('');
        row.push({ text: '€' + (sum * 1.2).toFixed(2), style: 'tableSumHeader', alignment: 'right' });
        table.table.body.push(row);


        return table;

    }


    private getTableDefaultLayout() {
        return {
            // code from lightHorizontalLines:
            hLineWidth: function (i, node) {
                if (i === 0) {
                    return 0;
                }
                if (i === node.table.body.length) {
                    return 2;
                }
                if (i === node.table.body.length - 1) {
                    return 1;
                }
                return (i === node.table.headerRows) ? 1 : 1;
            },
            vLineWidth: function (i) {
                return 0;
            },
            hLineColor: function (i, node) {
                if (i === node.table.body.length - 3)
                    return 'black'
                return i === 1 || i === node.table.body.length - 1 || i === node.table.body.length ? 'black' : '#aaa';
            },
            paddingLeft: function (i) {
                switch (i) {
                    case 0:
                    case 1:
                        return 0;
                    default:
                        return 5;
                }
            },
            paddingRight: function (i, node) {
                return (i === node.table.widths.length - 1) ? 0 : 5;
            },
            paddingTop: function (i, node) {
                return 4;
            },
            paddingBottom: function (i, node) {
                return 4;
            },
            // code for zebra style:
            fillColor: function (i, node) {
                return null;
                if (i === 0) {
                    return null;
                }
                if (i === node.table.body.length - 1) {
                    return '#b4b8b5';
                }
                return (i % 2 === 0) ? '#cfcfcf' : null;
            }
        }
    }

    private getOrdersDelivery(slip: SlipsheetEntity): Content {

        const table: ContentTable = {
            style: 'tableExample',
            table: {
                headerRows: 1,
                widths: [100, '*', '*', 'auto'],
                body: [
                    [
                        { text: 'Pos', style: 'tableHeader', margin: [0, 0, 5, 0] },
                        { text: 'Artikel', style: 'tableHeader' },
                        { text: 'Typ', style: 'tableHeader' },
                        { text: 'Menge', style: 'tableHeader' },
                    ],
                ]
            },
            layout: this.getSlipTableLayout()
        };

        let sum = 0;
        for (let index = 0; index < slip.orderEntries.length; index++) {
            const element = slip.orderEntries[index];
            let row = []
            row.push({ text: index + 1, style: 'tableCell' });
            row.push({ text: element.text, style: 'tableCell' });
            row.push({ text: element.article?.artNumber || "", style: 'tableCell' });
            row.push({ text: element.amount, style: 'tableCell' });
            table.table.body.push(row);
        }



        const row = []
        row.push('');
        row.push('');
        row.push('');
        row.push('');
        table.table.body.push(row);


        return table;

    }

    private getSlipTableLayout() {
        return {
            // code from lightHorizontalLines:
            hLineWidth: function (i, node) {
                if (i === 0) {
                    return 0;
                }
                if (i === node.table.body.length) {
                    return 2;
                }
                if (i === node.table.body.length - 1) {
                    return 1;
                }
                return (i === node.table.headerRows) ? 1 : 1;
            },
            vLineWidth: function (i) {
                return 0;
            },
            hLineColor: function (i, node) {

                return i === 1 || i === node.table.body.length - 1 || i === node.table.body.length ? 'black' : '#aaa';
            },
            paddingLeft: function (i) {
                switch (i) {
                    case 0:
                    case 1:
                        return 0;
                    default:
                        return 5;
                }
            },
            paddingRight: function (i, node) {
                return (i === node.table.widths.length - 1) ? 0 : 5;
            },
            paddingTop: function (i, node) {
                return 4;
            },
            paddingBottom: function (i, node) {
                return 4;
            },
            // code for zebra style:
            fillColor: function (i, node) {
                return null;
                if (i === 0) {
                    return null;
                }
                if (i === node.table.body.length - 1) {
                    return '#b4b8b5';
                }
                return (i % 2 === 0) ? '#cfcfcf' : null;
            }
        }
    }

    public savePDFToFileSystem(doc: PDFKit.PDFDocument, filepath: string): Promise<string> {
        return new Promise(
            (resolve, reject) => {
                if (!this.saveStreamtoFileSystem(doc, filepath,
                    (err, pages, path) => {
                        resolve(path);
                    })) {
                    reject();
                }
            }
        );
    }

    public saveStreamtoFileSystem(doc: PDFKit.PDFDocument, filepath: string, cb: Function) {
        try {
            if (filepath) {
                doc.pipe(createWriteStream(filepath));

                doc.on('end', function () {
                    cb(null, null, [filepath]);
                });
                doc.end();
            }
        } catch (error) {
            console.error(error);
            return null;
        }
        return true;

    }

    private getHead(slip: SlipsheetEntity, date?: Date): Content {

        return {
            alignment: 'justify',
            margin: [0, 10, 10, 40],
            columns: [
                {
                    width: 'auto',
                    text: [
                        'An\n',
                        (slip.customer.companyName || '') + '\n',
                        slip.customer.lastName + ' ' + slip.customer.firstName + '\n',
                        slip.customer.address + '\n',
                        slip.customer.postcode + ' ' + slip.customer.country + '\n',
                    ]
                },
                {
                    alignment: 'right',
                    text: 'Landeck, am ' + (moment(date || new Date()).format('DD.MM.YYYY')) + (slip.customer.customerNumber ? '\nKunde: ' + slip.customer.customerNumber : '\n') + (slip.customer.uid ? '\nIhre UID: ' + slip.customer.uid : '\nIhre UID:\n'),
                    margin: [0, 60, 0, 0],
                },

            ]
        };

    }

}
