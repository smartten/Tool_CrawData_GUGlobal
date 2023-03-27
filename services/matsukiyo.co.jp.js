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
import { ProductMatsukiyoModel } from '../models/matsukiyo.model.js';

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
const extractSocialUrl = elem => {
	const icon = elem.find("span.icon");
	const regex = /^(?:icon|color)-(.+)$/;

	const onlySocialClasses = regex => (classes = "") => classes
		.replace(/\s+/g, " ")
		.split(" ")
		.filter(classname => regex.test(classname));

	const getSocialFromClasses = regex => classes => {
		let social = null;
		const [classname = null] = classes;

		if (_.isString(classname)) {
			const [, name = null] = classname.match(regex);
			social = name ? _.snakeCase(name) : null;
		}

		return social;
	};

	const href = extractUrlAttribute("href")(elem);

	const social = compose(
		getSocialFromClasses(regex),
		onlySocialClasses(regex),
		fetchElemAttribute("class")
	)(icon);

	return social && { [social]: href };
};

/**
 * Extract a single post from container element
 */
const extractPost = elem => {
	const title = elem.find('.card__title a');
	const image = elem.find('a[data-src]');
	const views = elem.find("a[title='Views'] span");
	const comments = elem.find("a[title='Comments'] span.comment-number");

	return {
		title: fetchElemInnerText(title),
		image: extractUrlAttribute('data-src')(image),
		url: extractScotchUrlAttribute('href')(title),
		views: extractNumber(views),
		comments: extractNumber(comments)
	};
};

/**
 * Extract a single stat from container element
 */
const extractStat = elem => {
	const statElem = elem.find(".stat")
	const labelElem = elem.find('.label');

	const lowercase = val => _.isString(val) ? val.toLowerCase() : null;

	const stat = extractNumber(statElem);
	const label = compose(lowercase, fetchElemInnerText)(labelElem);

	return { [label]: stat };
};

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
const extract = async $ => {
	try {
		const resultList = $('.resultList')
		const ulResultList = resultList.find('#itemList')
		let dataQueryShowMoreBtn = $('.resultList').find('#searchMore').attr('data-query');
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
		resultList.find('#itemList > li').each(async function (item, elem) {
			try {
				const elm = $(this)
				const img = elm.find('.img').find('img').attr('src')
				const hrefDetailProduct = elm.find('.img').find('a').attr('href')
				const dataDetail = await reqApiDetailProduct(hrefDetailProduct)
				const productDetail = dataDetail('.ctBox02').find('p')

				const productName = elm.find('.ttl').text().toString().trim()
				const price = elm.find('p[class="price"]').text().toString().trim()
				const priceInTax = elm.find('p[class="price inTax"]').text().toString().trim()
				const product = { img: `${BASE_URL}${img}`, productName, price, priceInTax, productDetail: productDetail.text() }
				if(!await ProductMatsukiyoModel.exists(product))
				{
					const newProduct = new ProductMatsukiyoModel(product)
					await newProduct.save()
				}
				// await ProductMatsukiyoModel.deleteMany()
				arrProduct.push({ img: `${BASE_URL}${img}`, productName, price, priceInTax, productDetail: productDetail.text() })
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
	return composeAsync(extract, fetchHtmlFromUrl)(url);
};

export { fetchProductByList };
