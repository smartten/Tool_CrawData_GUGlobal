import _ from 'lodash';
import cheerio from "cheerio";

// Import helper functions
import {
	compose,
	composeAsync,
	extractNumber,
	enforceHttpsUrl,
	fetchHtmlFromUrl,
	extractFromElems,
	fromPairsToObject,
	fetchElemInnerText,
	fetchElemAttribute,
	extractUrlAttribute
} from "../helper/helpers.js";
import axios from 'axios';
import { ProductRugsMatsukiyoModel } from '../models/rugs-matsukiyo.model.js';
import { ProductCosmeticsMatsukiyoModel } from '../models/cosmetics-matsukiyo.model.js';
import { ProductDailyNecessitiesMatsukiyoModel } from '../models/daily-necessities-matsukiyo.model.js';
import { ProductFoodMatsukiyoModel } from '../models/food-matsukiyo.model.js';

// scotch.io (Base URL)
const BASE_URL = "https://www.matsukiyo.co.jp";

///////////////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
 * Resolves the url as relative to the base scotch url
 * and returns the full URL
 */
const scotchRelativeUrl = url =>
	_.isString(url) ? `$ BASE_URL}${url.replace(/^\/*?/, "/")}` : null;

/**
 * A composed function that extracts a url from element attribute,
 * resolves it to the Scotch base url and returns the url with https
 */
const extractScotchUrlAttribute = attr =>
	compose(enforceHttpsUrl, scotchRelativeUrl, fetchElemAttribute(attr));

///////////////////////////////////////////////////////////////////////////////
// EXTRACTION FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
 * Extract a single social URL pair from container element
 */
var URL;

const modelWithMainCategory = (mainCategory) => {
	switch (mainCategory) {
		case '001':
			return ProductRugsMatsukiyoModel
			break;
		case '003':
			return ProductCosmeticsMatsukiyoModel
			break;
		case '004':
			return ProductDailyNecessitiesMatsukiyoModel
			break;
		case '005':
			return ProductFoodMatsukiyoModel
			break;
		default:
			throw Error("Main category invalid...!")
	}
}

/**
	* Call api get detail product
 */
const reqApiDetailProduct = async (href) => {
	try {
		if (href) {
			return await axios
				.get(`${BASE_URL}${href}`)
				.then(response => {
					const dataConvertCheerio = cheerio.load(response.data)
					return dataConvertCheerio
				})
				.catch(error => {
					error.status = (error.response && error.response.status) || 500;
					throw error;
				});
		}
	} catch (error) {
		console.log("err", error);
	}
}
/**
 * Extract profile from a Scotch author's page using the Cheerio parser instance
 * and returns the author profile object
 */

const extractDetailProduct = (dataDetail) => {
	let listImg = []
	const listInfoProduct = dataDetail('.ctBox01.clearfix').find('.goodsBox.main')
	const listImageHtml = dataDetail('.ctBox01.clearfix').find('.slideBox').find('div.thumb-pager').children('a')
	console.log('listImageHtml' ,listImageHtml.length);
	listImageHtml.each((i ,e) => {
		console.log(dataDetail(this).find('img').attr('src'));
		
	})
	const favoriteNumber = listInfoProduct.find('.star').find('li').text()
	const statusProduct = listInfoProduct.find('.send').find('span.green').text()
	const producerAndProductCode = listInfoProduct.find('.cpde').text()
	const note = listInfoProduct.find('.note').text()
	
	return listImg
}

const extract = async $ => {
	try {
		const modelDatabase = modelWithMainCategory(URL.split('=')[1])
		await modelDatabase.deleteMany()
		const resultList = $('.resultList')
		const ulResultList = resultList.find('#itemList')
		let dataQueryShowMoreBtn = $('.resultList').find('#searchMore').attr('data-query').replace('12' , '1000');
		const arrProduct = []
		while (dataQueryShowMoreBtn) {
			console.log('dataQueryShowMoreBtn', dataQueryShowMoreBtn);
			const { data } = await axios.get(`https://www.matsukiyo.co.jp/store/api/search/next`, {
				params: {
					query: dataQueryShowMoreBtn
				}
			})
			dataQueryShowMoreBtn = data?.query
			ulResultList.append(data.list)
		}
		let count = 1;
		await modelDatabase.deleteMany()
		resultList.find('#itemList > li').each(async function (item, elem) {
			try {
				const elm = $(this)
				const img = elm.find('.img').find('img').attr('src')
				const hrefDetailProduct = elm.find('.img').find('a').attr('href')
				console.log('hrefDetailProduct' ,hrefDetailProduct);
				
				// const dataDetail = await reqApiDetailProduct(hrefDetailProduct)
				// const detailProduct = extractDetailProduct(dataDetail)
				const productName = elm.find('.ttl').text().toString().trim()
				const price = elm.find('p[class="price"]').text().toString().trim()
				const priceInTax = elm.find('p[class="price inTax"]').text().toString().trim()
				const product = { img: `${BASE_URL}${img}`, productName, price, priceInTax }
				// if(!await modelDatabase.exists(product))
				// {
					const newProduct = new modelDatabase(product)
					await newProduct.save()
				// }
				// await modelDatabase.deleteMany()
				arrProduct.push({ img: `${BASE_URL}${img}`, productName, price, priceInTax })
			} catch (error) {
				console.log('err' ,error);
				
			}
		});
		return Promise.all([
			arrProduct
		]).then(([arrProduct]) => ({ product: arrProduct }));
		// return { product: arrProduct }
	} catch (error) {
		console.log("err", error);

	}
};

/**
 * Fetches the Scotch profile of the given author
 */
const fetchProductByList = url => {
	URL = url
	return composeAsync(extract, fetchHtmlFromUrl)(url);
};

export { fetchProductByList };
