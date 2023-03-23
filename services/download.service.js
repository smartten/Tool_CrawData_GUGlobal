import { createExcelFile } from "../helper/createExcelFile.js";
import path from 'path'
import mime from 'mime'
import { ProductModel } from "../models/product.js";


export const getAll = async () => {
    const product = await ProductModel.find().limit(100)
    createExcelFile(product)
    const file = 'excel-info-product.xlsx'
    const fileName = path.basename(file)
    const mimeType = mime.getType(file)
    return {
        file,
        fileName,
        mimeType
      };
}