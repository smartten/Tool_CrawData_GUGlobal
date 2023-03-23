import mime from 'mime'
import xl from 'excel4node'
import { headerColumn, columnNameByHeader } from './headerColumn.js';

export const createExcelFile = (data) => {

    const workBook = new xl.Workbook();
    const workSheet = workBook.addWorksheet('excel-info-product')
    let colIndex = 1
    headerColumn.forEach(item => {
        workSheet.cell(1, colIndex++).string(item)
    })
    let rowIndex = 2
    let countId = 1
    data.forEach(item => {
        Object.keys(JSON.parse(JSON.stringify(item))).forEach(colName => {
            if (columnNameByHeader[colName]) {
                const columIndex = headerColumn.indexOf(columnNameByHeader[colName])
                if (columIndex == 0) {
                    workSheet.cell(rowIndex, columIndex + 1).string(countId.toString())
                }
                else if (columIndex !== -1)
                    workSheet.cell(rowIndex, columIndex + 1).string(item[colName].toString())
            }
        })
        countId = countId + 1
        rowIndex++
    })
    workBook.write('excel-info-product.xlsx')
}