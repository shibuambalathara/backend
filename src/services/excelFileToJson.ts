import * as XLSX from 'xlsx';
// import { WorkSheet, Sheet2JSONOpts, Range, ColInfo, } from 'xlsx';

/* load 'fs' for readFile and writeFile support */
import * as fs from 'fs';

export default function excelFileToJson(filePath: string, sheetName: string): Promise<any> {
    const { read, utils: { sheet_to_json } } = XLSX;
    // XLSX.set_fs(fs);
    return new Promise((resolve, reject) => {
        const workbook = XLSX.readFile(filePath);
        const sheet_name_list = workbook.SheetNames;
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
    });
}

