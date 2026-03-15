import { User } from '../models';
import { environment } from '../../environments/environment';

export function getWeeksNames(day: number) {

    switch (day) {
        case 0:
            return 'sun';
        case 1:
            return 'mon';
        case 2:
            return 'tue';
        case 3:
            return 'wed';
        case 4:
            return 'thu';
        case 5:
            return 'fri';
        case 6:
            return 'sat';

        default:
            return '';

    }
}


export function downloadFile(data, filename, type) {
    const blob = new Blob([data], { type: type });

    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.id = 'downloadFile';
    link.href = downloadURL;
    link.download = filename;
    const body = $('body').eq(0);
    body.append(link);
    link.click();
    $('#downloadFile').remove();
}

export function downloadFileFromUrl(data) {

    let apiReq;
    if (location.protocol !== 'https:') {
        apiReq = `${environment.apiUrlHTTP}/${data}`;
    } else {
        apiReq = `${environment.apiUrlHTTPS}/${data}`;
    }

    const link = document.createElement('a');
    link.id = 'DownloadZip';
    link.hidden = true;
    link.href = apiReq;
    link.download = 'test.zip';
    link.type = 'application/zip';
    const body = $('body').eq(0);
    body.append(link);
    link.click();
    $('#DownloadZip').remove();

}

