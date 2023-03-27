import cheerio from "cheerio";
import puppeteer from 'puppeteer';
import { ProductGuGlobalModel } from '../models/goglobal.model.js';
// Import helper functions
import { composeAsync, fetchHtmlFromUrlByScroll } from "../helper/helpers.js";
import axios from "axios";
import { translateJpToVi, translateJpToViWithArray, translateDataApi } from "../helper/covert.js"


const BASE_URL = "https://www.gu-global.com";
var URL;
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
		//https://wise.com/rates/history+live?source=VND&target=JPY&length=30&resolution=hourly&unit=day
		const listProduct = $('.lazyload-wrapper').find('.fr-ec-product-tile-resize-wrapper')
		const arrCategory = URL.split('/').slice(5);
		const productType = {
			mainCategory: arrCategory[0],
			subCategory: arrCategory[1],
			product: arrCategory[2] || ''
		}
		// const findProduct = await ProductGuGlobalModel.find({
		// 	productType
		// })
		// await ProductGuGlobalModel.deleteMany({productType})
		listProduct.each(async function (item, elem) {
			try {
				const elm = $(this)
				const img = elm.find('.fr-ec-product-tile__image').find('img').attr('src')
				const idProduct = elm.find('a').attr('id')
				const { data } = await axios.get(`https://www.gu-global.com/jp/api/commerce/v5/ja/products/${idProduct}/price-groups/00/details?includeModelSize=true&httpFailure=true`)
				const dataConvert = await translateDataApi(data.result)

				const description = elm.find('.fr-ec-flag-text.fr-ec-flag--standard.fr-ec-text-align-left.fr-ec-flag-text--color-secondary.fr-ec-text-transform-normal').text()
				const stateFlags = elm.find('.fr-ec-product-tile__status-flags-list-item').find('p').text()
				const name = elm.find('.fr-ec-product-tile__end').find('h3').text()
				const price = elm.find('.fr-ec-product-tile__end').find('.fr-ec-price').find('p').text()
				const product = {
					img, description: await translateJpToVi(description),
					stateFlags: await translateJpToViWithArray(stateFlags),
					name: await translateJpToVi(name),
					price,
					...dataConvert,
					productType
				};
				await ProductGuGlobalModel.deleteOne({productId : dataConvert.productId})
				// if (!await ProductGuGlobalModel.exists({ productId : dataConvert.productId })) {
					const newProduct = new ProductGuGlobalModel(product)
					await newProduct.save()
				// }
			} catch (error) {
				console.log('err', error);

			}
		});

		return {
			message: 'done'
		}
	} catch (error) {
		console.log("err", error);

	}
};

/**
 * Fetches the gu-global profile of the given author
 */

const fetchProductGuGlobal = url => {
	URL = url
	return composeAsync(extractGuGlobal, fetchHtmlFromUrlByScroll)(url);
};

export { fetchProductGuGlobal };

