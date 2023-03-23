import axios from 'axios';
import cheerio from "cheerio";
import _ from 'lodash';
import { ProductUniQloModel } from '../models/uniqlo.model.js';
// Import helper functions
import { compose, composeAsync, enforceHttpsUrl, extractNumber, extractUrlAttribute, fetchElemAttribute, fetchElemInnerText, fetchHtmlFromUrlByScroll } from "./helpers.js";
import { ProductGuGlobalModel } from '../models/goglobal.model.js';
import puppeteer from 'puppeteer';


const BASE_URL = "https://www.gu-global.com";
/**
	* Call api get detail product
 */
const reqApiDetailProduct = async (href) => {
    try {
        const url = `${BASE_URL}${href}`
		const browser = await puppeteer.launch({
			headless: false
		});
		const page = await browser.newPage();
		await page.goto(url);
		// await autoScroll(page);

        const html = await page.content()
        
		await browser.close();
		return cheerio.load(html)

	} catch (error) {

	}
}
/**
 * Extract profile from a Scotch author's page using the Cheerio parser instance
 * and returns the author profile object
 */
const extractGuGlobal = async $ => {
	try {
		const listProduct = $('.lazyload-wrapper').find('.fr-ec-product-tile-resize-wrapper')
		listProduct.each(async function (item, elem) {
			try {
				const elm = $(this)
                const img = elm.find('.fr-ec-product-tile__image').find('img').attr('src')
                const hrefProduct = elm.find('a').attr('href')
                // console.log('hrefProduct' ,hrefProduct);
                // const productDetailHtml = await reqApiDetailProduct(hrefProduct)
                // const overviewProduct = productDetailHtml('#productLongDescription-content').find('p').text()
                // const productInfoDetail = productDetailHtml('#productMaterialDescription-content')
                // const productCode = productInfoDetail.find('.fr-ec-mb-spacing-02').text()
                // const productMindFul = productInfoDetail.find('.fr-ec-mb-spacing-05').text()
                // const detailDes =  productInfoDetail.find('dl.fr-ec-description-list').html()
                const productDetail = {}
                // const productDetail = {overviewProduct , productCode , productMindFul ,detailDes}
				const description = elm.find('.fr-ec-flag-text.fr-ec-flag--standard.fr-ec-text-align-left.fr-ec-flag-text--color-secondary.fr-ec-text-transform-normal').text()
				const stateFlags = elm.find('.fr-ec-product-tile__status-flags-list-item').find('p').text()
				const name = elm.find('.fr-ec-product-tile__end').find('h3').text()
				const price = elm.find('.fr-ec-product-tile__end').find('.fr-ec-price').find('p').text()
				const product = { img, description, stateFlags, name, price ,productDetail };
				if (!await ProductGuGlobalModel.exists(product)) {
					const newProduct = new ProductGuGlobalModel(product)
					await newProduct.save()
				}
			} catch (error) {
				console.log('err', error);

			}
        });
        
		return {}
	} catch (error) {
		console.log("err", error);

	}
};

/**
 * Fetches the Scotch profile of the given author
 */

const fetchProductGuGlobal = url => {
	return composeAsync(extractGuGlobal, fetchHtmlFromUrlByScroll)(url);
};

export { fetchProductGuGlobal };

