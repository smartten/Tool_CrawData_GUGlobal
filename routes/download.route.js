import { Router } from "express";
import { getAll } from "../services/download.service.js";
import { createExcelFile } from "../helper/createExcelFile.js";

const download = Router();

download.get("/", async (req, res) => {
    const response = await getAll();
    const {
        file,
        fileName,
        mimeType
    } = response
    res.setHeader('Content-Disposition', "attachment;filename=" + file)
    res.setHeader('Content-Type', mimeType)
    res.download(file)
    // res.json({})
});

export { download };
