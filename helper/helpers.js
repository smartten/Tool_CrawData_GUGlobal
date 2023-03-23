import _ from 'lodash';
import axios from "axios";
import cheerio from "cheerio";
import puppeteer from 'puppeteer';
import { ProductUniQloModel } from '../models/uniqlo.model.js';

///////////////////////////////////////////////////////////////////////////////
// UTILITY FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
 * Compose function arguments starting from right to left
 * to an overall function and returns the overall function
 */
const compose = (...fns) => arg => {
	return _.flattenDeep(fns).reduceRight((current, fn) => {
		if (_.isFunction(fn)) return fn(current);
		throw new TypeError("compose() expects only functions as parameters.");
	}, arg);
};

/**
 * Compose async function arguments starting from right to left
 * to an overall async function and returns the overall async function
 */
const composeAsync = (...fns) => arg => {
	return _.flattenDeep(fns).reduceRight(async (current, fn) => {
		if (_.isFunction(fn)) return fn(await current);
		throw new TypeError("compose() expects only functions as parameters.");
	}, arg);
};

/**
 * Enforces the scheme of the URL is https
 * and returns the new URL
 */
const enforceHttpsUrl = url =>
	_.isString(url) ? url.replace(/^(https?:)?\/\//, "https://") : null;

/**
 * Strips number of all non-numeric characters
 * and returns the sanitized number
 */
const sanitizeNumber = number =>
	_.isString(number)
		? number.replace(/[^0-9-.]/g, "")
		: _.isNumber(number) ? number : null;

/**
 * Filters null values from array
 * and returns an array without nulls
 */
const withoutNulls = arr =>
	_.isArray(arr) ? arr.filter(val => !_.isNull(val)) : [];

/**
 * Transforms an array of ({ key: value }) pairs to an object
 * and returns the transformed object
 */
const arrayPairsToObject = arr =>
	arr.reduce((obj, pair) => ({ ...obj, ...pair }), {});

/**
 * A composed function that removes null values from array of ({ key: value }) pairs
 * and returns the transformed object of the array
 */
const fromPairsToObject = compose(arrayPairsToObject, withoutNulls);

/**
 * Handles the request(Promise) when it is fulfilled
 * and sends a JSON response to the HTTP response stream(res).
 */
const sendResponse = res => async request => {
	return await request
		.then(data => res.json({ status: "success", data }))
		.catch(({ status: code = 500 }) =>
			res.status(code).json({ status: "failure", code, message: code == 404 ? 'Not found.' : 'Request failed.' })
		);
};

// const sendResponseUniQlo = async res => {
	// (async () => {
	// 	const browser = await puppeteer.launch({
	// 		headless: false
	// 	});
	// 	const page = await browser.newPage();
	// 	await page.goto('https://www.uniqlo.com/jp/ja/kids/outerwear');
	// 	await autoScroll(page);

	// 	const html = await page.content()
	// 	await browser.close();
	// 	const $ = await cheerio.load(html)
	// 	const listProduct = $('.lazyload-wrapper').find('.fr-ec-product-tile-resize-wrapper')
	// 	listProduct.each(async function (item, elem) {
	// 		try {
	// 			const elm = $(this)
	// 			const img = elm.find('.fr-ec-product-tile__image').find('img').attr('src')
	// 			// const color = elm.find('.fr-ec-chip fr-ec-chip--product-tile.fr-ec-chip-group-product-tile__chip')
	// 			const description = elm.find('.fr-ec-flag-text.fr-ec-flag--standard.fr-ec-text-align-left.fr-ec-flag-text--color-secondary.fr-ec-text-transform-normal').text()
	// 			const detail = elm.find('.fr-ec-product-tile__status-flags-list-item').find('p').text()
	// 			const name = elm.find('.fr-ec-product-tile__end').find('h3').text()
	// 			const price = elm.find('.fr-ec-product-tile__end').find('.fr-ec-price').find('p').text()
	// 			const product = { img, description, detail, name, price };
	// 			if (!await ProductUniQloModel.exists(product)) {
	// 				const newProduct = new ProductUniQloModel(product)
	// 				await newProduct.save()
	// 			}

	// 		} catch (error) {
	// 			console.log('err', error);

	// 		}
	// 	});
	// 	res.json('ok')
	// })();
// }

/**
 * Loads the html string returned for the given URL
 * and sends a Cheerio parser instance of the loaded HTML
 */
const fetchHtmlFromUrl = async url => {
	return await axios
		.get(enforceHttpsUrl(url))
		.then(response => {
			const dataConvertCheerio = cheerio.load(response.data)
			return dataConvertCheerio
		})
		.catch(error => {
			error.status = (error.response && error.response.status) || 500;
			throw error;
		});
};

const fetchHtmlFromUrlByScroll = async url => {
	try {
		const browser = await puppeteer.launch({
			headless: false
		});
		const page = await browser.newPage();
		await page.goto(url);
		await autoScroll(page);

		const html = await page.content()
		await browser.close();
		return cheerio.load(html)

	} catch (error) {

	}
};

///////////////////////////////////////////////////////////////////////////////
// HTML PARSING HELPER FUNCTIONS
///////////////////////////////////////////////////////////////////////////////

/**
 * Scroll page get all html page 
 */

async function autoScroll(page) {
	await page.evaluate(async () => {
		await new Promise((resolve) => {
			var totalHeight = 0;
			var distance = 50;
			var timer = setInterval(() => {
				var scrollHeight = document.body.scrollHeight;
				window.scrollBy(0, distance);
				totalHeight += distance;

				if (totalHeight >= scrollHeight - window.innerHeight) {
					clearInterval(timer);
					resolve();
				}
			}, 50);
		});
	});
}

/**
 * Fetches the inner text of the element
 * and returns the trimmed text
 */
const fetchElemInnerText = elem => (elem.text && elem.text().trim()) || null;

/**
 * Fetches the specified attribute from the element
 * and returns the attribute value
 */
const fetchElemAttribute = attribute => elem =>
	(elem.attr && elem.attr(attribute)) || null;

/**
 * Extract an array of values from a collection of elements
 * using the extractor function and returns the array
 * or the return value from calling transform() on array
 */
const extractFromElems = extractor => transform => elems => $ => {
	const results = elems.map((i, element) => extractor($(element))).get();
	return _.isFunction(transform) ? transform(results) : results;
};

/**
 * A composed function that extracts number text from an element,
 * sanitizes the number text and returns the parsed integer
 */
const extractNumber = compose(parseInt, sanitizeNumber, fetchElemInnerText);

/**
 * A composed function that extracts url string from the element's attribute(attr)
 * and returns the url with https scheme
 */
const extractUrlAttribute = attr =>
	compose(enforceHttpsUrl, fetchElemAttribute(attr));


export {
	compose,
	composeAsync,
	enforceHttpsUrl,
	sanitizeNumber,
	withoutNulls,
	arrayPairsToObject,
	fromPairsToObject,
	sendResponse,
	fetchHtmlFromUrl,
	fetchElemInnerText,
	fetchElemAttribute,
	extractFromElems,
	extractNumber,
	extractUrlAttribute,
	// sendResponseUniQlo,
	fetchHtmlFromUrlByScroll
};